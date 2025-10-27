import React, { useState, useEffect, useRef } from "react";
import { Form, Table } from "react-bootstrap";
import { yupResolver } from "@hookform/resolvers/yup";
import validationSchema from '../../../validation/validationSchema'
import "bootstrap/dist/css/bootstrap.min.css";
import {getTypeOfWork} from '../../../api/typeOfWorkAPi/typeOfWorkApi'
import DatePicker from "react-datepicker";
import { postPerseonlData } from '../../../api/ProjectDetailsAPI/projectDetailsApi'
import { getdirectrate } from '../../../api/directrateAPI/directrate'
import {getProjectTypeList} from '../../../api/projectTypeListApi/projectTypeListApi'
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import PreviewModal from '../../../components/previewfile/preview';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PiImagesSquareBold } from "react-icons/pi";
import { FcDocument } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import { IoIosSave } from "react-icons/io";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import {getDomain} from '../../../api/clientSectorApi/clientSectorApi'
import "./homePage.css";


const HomePage = () => {
  const { control, handleSubmit, formState: { errors }, setValue,reset,trigger,watch,getValues } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      selectedProjectTypes: [],
      startDate: null,
      endDate: null,
      SecondaryEmail:"",
      SecondaryPhoneNo:"",
      SecondaryFullName:"",
      secondaryRoleAndDesignation:"",
      projectValue:""
    },
  });

  const [preview, setPreview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTypeOfWorkOptions, setSelectedTypeOfWorkOptions] = useState([]);
  const [selectedOrderTypeOptions, setSelectedOrderTypeOptions] = useState([]);
  const [selectedTypeOptions, setSelectedTypeOptions] = useState([]);
  const [selectedDomainOptions, setSelectedDomainOptions] = useState([]);
  const [directrateOptions, setDirectrateOptions]= useState([])
  const [yearlyFields, setYearlyFields] = useState([]);
  const [selectPaymentMethodOptions, setSelectPaymentMethodOptions]= useState([])
  const [disableProjectValue,setDisableProjectValue] = useState(false)
  const [disableProjectValueYearly,setDisableProjectValueYearly] = useState(false)
  const [error, setError] = useState(null);
  const [projectTypes, setProjectTypes] = useState([]);
  const [disableScopeOfWork,setDisableScopeOfWork] =useState()
  const [typeOfWorkOption,setTypeOfWorkOption] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [data, setData] = useState([]);
  const [fileType, setFileType] = useState(''); 
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const OrderTypeOption =[
    {value:"GeM",label:"GeM"},
    {value:"Nomination",label:"Nomination"},
  ]
  const TypeOption =[
    {value:"PSU",label:"PSU"},
    {value:"Govt",label:"Govt"},
    {value:"Private",label:"Private"},
  ]
  const paymentMethodOptions = [
    { value: 'Fixed Payment', label: 'Fixed Payment' },
    { value: 'Yearly Payment', label: 'Yearly Payment' },
  ];

   useEffect(() => {
      fetchData();
    }, []);

  const fetchData = async () => {
    setLoading(true);
      try {
        const response = await getDomain({});
        const data = response?.data
        const option = data.map((domain)=>({
          value:domain._id,
          label:domain.domain
        }))
        setData(option);
      } catch (error) {
          console.error('Error fetching data:', error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(()=>{
    const fetchTypeOfWork = async() =>{
      try{
        const response = await getTypeOfWork({});
        if(response.data && Array.isArray(response.data.data)){
          const option = response.data.data.map((TypeOfWork)=>({
            value:TypeOfWork._id,
            label:TypeOfWork.typeOfWork
          }))
          setTypeOfWorkOption(option)
        }else{
          console.log("Expect an Array")
        }
      }catch(error){
        console.error("Error fetching Type Of Work:");
      }
    }
    fetchTypeOfWork()
  },[])
  useEffect(() => {
    if (selectPaymentMethodOptions?.value === "Yearly Payment") {
      generateYearlyFields();
    } else {
      setYearlyFields([]);
    }
  }, [watch("startDate"), watch("endDate"), selectPaymentMethodOptions]);

  
  useEffect(() => {
    
    const fetchProjectTypeList = async () => {
      try {
        if (selectedTypeOfWorkOptions){
        const selectedType=selectedTypeOfWorkOptions?.label;
        const response = await getProjectTypeList({category:selectedType}); 
        
        if (response && Array.isArray(response.data)) {
          const options = response.data.map((projectTypes) => ({
            label: projectTypes.ProjectTypeName, 
            value: projectTypes._id 
          }));
          setProjectTypes(options); 
          
        } else {
          console.error("Expected an array in response.data but got:",);
        }
      } else{
         setProjectTypes([]); 
      }
      } catch (error) {
        console.error("Error fetching device list:");
      }
    };
    
    fetchProjectTypeList();
  }, [selectedTypeOfWorkOptions]);
  
  useEffect(() => {
    const fetchDirectrateList = async () => {
      setLoading(true);
      setError("");
  
      try {
        const response = await getdirectrate();
  
        if (response && response.data && response.data.data && Array.isArray(response.data.data)) {

          const options = response.data.data.map((directrate) => ({
            label: directrate.directrate, 
            value: directrate._id, 
          }));
  
          setDirectrateOptions(options);
        } else {
          throw new Error("Unexpected data format or empty directrate list");
        }
      } catch (err) {
       
        console.error("Error fetching directrate list:");
      } finally {
        setLoading(false);
      }
    };
  
    fetchDirectrateList();
  }, []);

  const handleFormdataSubmit = async (data) => {
    const payload = {
      workOrderNo:data.workOrderNo,
      orderType:data.orderType,
      domain:data.domain,
      type:data.type,
      orginisationName: data.OrganisationName,
      projectName: data.ProjectName,
      startDate: data.startDate, 
      endDate: data.endDate,
      projectValue: data.ProjectValue,
      primaryPersonName: data.PrimaryFullName,
      secondaryPersonName: data.SecondaryFullName,
      primaryPersonPhoneNo: data.PrimaryPhoneNo,
      secondaryPrsonPhoneNo: data.SecondaryPhoneNo,
      secondaryPersonEmail: data.SecondaryEmail,
      primaryPersonEmail: data.PrimaryEmail,
      directrate: data.DirectrateName,
      typeOfWork: data.typeOfWork,
      paymentMethod: data.paymentMethod,
      serviceLocation: data.ServiceLoction,
      secondaryRoleAndDesignation: data.secondaryRoleAndDesignation,
      primaryRoleAndDesignation:data.primaryRoleAndDesignation,
      projectManager:data.projectManager,
      projectType: data.selectedProjectTypes.map(type => type.value),
      workOrder: uploadedFile,
      projectValueYearly:
        data.paymentMethod === "Yearly Payment"
          ? data.yearlyProjectValues.map((item) => ({
              financialYear: item.yearRange,
              amount: item.value ? item.value.toString() : "0",
            }))
        : [],
    };
 
    setLoading(true);
    try{
      const response = await postPerseonlData(payload);
      if (response.statusCode === 200) {
        reset({
          workOrderNo: '',
          orderType: '',
          type: '',
          domain:'',
          OrganisationName: '',
          ProjectName: '',
          startDate: null,
          endDate: null,
          ProjectValue: '',
          PrimaryFullName: '',
          SecondaryFullName: '',
          PrimaryPhoneNo: '',
          SecondaryPhoneNo: '',
          SecondaryEmail: '',
          PrimaryEmail: '',
          DirectrateName: '',
          ServiceLoction: '',
          paymentMethod:'',
          projectManager: '',
          typeOfWork:null,
          selectedProjectTypes: [],
          primaryRoleAndDesignation:'',
          secondaryRoleAndDesignation:'',
          uploadedFile:null,
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setPreview(null);
        setValue('typeOfWork',"")
        setSelectedTypeOfWorkOptions(null)
        setSelectedOrderTypeOptions(null)
        setSelectedDomainOptions(null)
        setSelectedTypeOptions(null)
        setSelectPaymentMethodOptions(null)
        setDisableProjectValue(false);
        setDisableProjectValueYearly(false);
        setUploadedFile(null);
        setFileType("");
        setDisableScopeOfWork('')
  
        toast.success('Form submitted successfully!', {
          className: 'custom-toast custom-toast-success',
        });
      } else if(response.statusCode === 400 && response.message.includes("Work Order Number")){
        toast.error(response.message, {
          className: "custom-toast custom-toast-error",
        });
      }else if(response.statusCode === 400 && response.message.includes("Project Name")){
        toast.error(response.message, {
          className: "custom-toast custom-toast-error",
        });
      }
    }catch(error){
      toast.error('Failed to submit the form.', {
        className: 'custom-toast custom-toast-error',
      });
    }
    setLoading(false);
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
      handleSubmit(handleFormdataSubmit)();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadedFile(file);
  
    if (file) {
      setFileType(file.type); 
  
      if (file.type === 'application/pdf') {
        const fileURL = URL.createObjectURL(file);
        setPreview(fileURL);
      } else if (file.type.startsWith('image/')) {

        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result); 
        };
        reader.readAsDataURL(file);
      }
    }
  };
  const handlePreviewClick = () => {
    setShowPreviewModal(true);
  };

  const handleCloseModal = () => {
    setShowPreviewModal(false); 
  };

  const handleBackClick = ()=>{
    navigate(`/home`) 
  }

  const handleTypeOfWorkChange = (selected) =>{
      setValue('selectedProjectTypes', []);
      setSelectedTypeOfWorkOptions(selected)
      setDisableScopeOfWork(selected)
      const selectedString = selected?.label || '';
      setValue('typeOfWork',selectedString)
      trigger('typeOfWork');
  }

  const handleOrderType = (selected) =>{
    setSelectedOrderTypeOptions(selected)
    const value = selected?.value
    setValue('orderType',value)
  }

  const handleType = (selected) =>{
    setSelectedTypeOptions(selected)
    const value = selected?.value
    setValue('type',value)
  }

  const handleDomain = (selected) =>{
    setSelectedDomainOptions(selected)
    const value = selected?.value
    setValue('domain',value)
  }

  const formatINRCurrency = (value) => {
    const number = value.replace(/,/g, '');
    const x = number.length;
    if (x <= 3) return number;
    const lastThree = number.slice(x - 3);
    const rest = number.slice(0, x - 3);
    const formattedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return formattedRest + ',' + lastThree;
  };
  const handlePaymentMethodChange = (selected) =>{
    if (selected?.value === "Fixed Payment") {
      setDisableProjectValue(true);
      setDisableProjectValueYearly(false);
    } else if (selected?.value === "Yearly Payment") {
      setDisableProjectValueYearly(true);
      setDisableProjectValue(false);
    } else {
      setDisableProjectValue(false);
      setDisableProjectValueYearly(false);
    }
    setSelectPaymentMethodOptions(selected)
    const value = selected?.value
    setValue('paymentMethod',value)
  }

  const generateYearlyFields = () => {
    const start = getValues("startDate");
    const end = getValues("endDate");

    if (!start || !end) return;

    const startYear = new Date(start).getFullYear();
    const startMonth = new Date(start).getMonth() + 1;
    const endYear = new Date(end).getFullYear();
    const endMonth = new Date(end).getMonth() + 1;


    let fyStart = startMonth < 4 ? startYear - 1 : startYear;
    let fyEnd = endMonth >= 4 ? endYear : endYear - 1;

    const fields = [];

    for (let year = fyStart; year <= fyEnd; year++) {
      fields.push({
        yearRange: `${year}-${year + 1}`,
        value: "",
      });
  }

  setYearlyFields(fields);
};


  return (
    <div className="home-page">
      <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
      <div className="row">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        position="relative"
        mb={3}
      >
        <Box position="absolute" left={0}>
          <Tooltip title="Back">
            <IconButton
              onClick={handleBackClick}
              sx={{
                backgroundColor: 'error.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'error.dark',
                },
                width: 48,
                height: 48,
              }}
            >
              <ArrowBackIcon  size={24} />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="h4" fontWeight="bold">
          Project Details
        </Typography>
      </Box>
      </div>
      <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}/>
      <div className="container-fluid">
        <div className="row">
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-sm-3 col-lg-3 col-md-3">
              <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Work Order Number<span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="workOrderNo"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control"  placeholder="Enter Work Order Number"/>}
                  />
                  {errors.workOrderNo && <p className="text-danger">{errors.workOrderNo.message}</p>}
                </Form.Group>
              </div>
              <div className="col-sm-3 col-lg-3 col-md-3">
                <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Order Type<span className="text-danger">*</span></Form.Label>
                    <Controller
                      name="orderType"
                      control={control}
                      render={({ field }) => (
                        <Select
                        {...field}
                        options={OrderTypeOption} 
                        value={selectedOrderTypeOptions}
                        isClearable
                        isDisabled={loading}
                        placeholder="Select Order Type"
                        onChange={handleOrderType}
                      />
                      )}
                    />
                      {errors.orderType && <p className="text-danger">{errors.orderType.message}</p>}
                  </Form.Group>
              </div>
              <div className="col-sm-3 col-lg-3 col-md-3">
                <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Organisation Type<span className="text-danger">*</span></Form.Label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select
                        {...field}
                        options={TypeOption} 
                        value={selectedTypeOptions}
                        isClearable
                        isDisabled={loading}
                        placeholder="Select Order Type"
                        onChange={handleType}
                      />
                      )}
                    />
                      {errors.type && <p className="text-danger">{errors.type.message}</p>}
                  </Form.Group>
              </div>
              <div className="col-sm-3 col-md-3 col-lg-3">
                <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Domain<span className="text-danger">*</span></Form.Label>
                    <Controller
                      name="domain"
                      control={control}
                      render={({ field }) => (
                        <Select
                        {...field}
                        options={data} 
                        value={selectedDomainOptions}
                        isClearable
                        isDisabled={loading}
                        placeholder="Select Domain Type"
                        onChange={handleDomain}
                      />
                      )}
                    />
                      {errors.domain && <p className="text-danger">{errors.domain.message}</p>}
                  </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-3 col-md-3 col-lg-3">
                <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Organisation Name<span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="OrganisationName"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" placeholder="Enter Organisation Name"/>}
                  />
                  {errors.OrganisationName && <p className="text-danger">{errors.OrganisationName.message}</p>}
                </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fs-5 fw-bolder">Type Of Work<span className="text-danger">*</span></Form.Label>
                     <Controller
                        name="typeOfWork"
                        control={control}
                        render={({ field }) => (
                          <Select
                          {...field}
                          options={typeOfWorkOption} 
                          value={selectedTypeOfWorkOptions}
                          isClearable
                          isDisabled={loading}
                          placeholder="Select Type Of Work"
                          onChange={handleTypeOfWorkChange}
                        />
                        )}
                      />
                       {errors.typeOfWork && <p className="text-danger">{errors.typeOfWork.message}</p>}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="fs-5 fw-bolder">Project Manager<span className="text-danger">*</span></Form.Label>
                        <Controller
                          name="projectManager"
                          control={control}
                          render={({ field }) => <input {...field} className="form-control" placeholder="Enter Project Manager Name" />}
                        />
                        {errors.projectManager && <p className="text-danger">{errors.projectManager.message}</p>}
                      </Form.Group>
                
                
              </div>
              <div className="col-sm-3 col-md-3 col-lg-3"> 
                <Form.Group className="mb-3" controlId="PriojectName">
                  <Form.Label className="fs-5 fw-bolder">Project Name<span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="ProjectName"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" placeholder="Enter Project Name" />}
                  />
                  {errors.ProjectName && <p className="text-danger">{errors.ProjectName.message}</p>}
                </Form.Group>
                  {disableScopeOfWork &&(
                <Form.Group className="mb-3" >
                    <Form.Label className="fs-5 fw-bolder">Scope Of Work<span className="text-danger">*</span></Form.Label>
                    {projectTypes && Array.isArray(projectTypes) && projectTypes.length > 0 ? (
                    <Controller
                      name="selectedProjectTypes"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={projectTypes} 
                          isMulti
                          getOptionLabel={(e) => e.label}
                          getOptionValue={(e) => e.value}
                          onChange={(selected) => {setValue("selectedProjectTypes", selected);trigger('selectedProjectTypes')}} // Updates the form value
                          placeholder="Select Scope of Work"
                        />
                      )}
                    />
                  ) : (
                    <div>Loading project types...</div> 
                  )}
                  {errors.selectedProjectTypes && (
                    <div className="text-danger">{errors.selectedProjectTypes.message}</div>
                  )}
                </Form.Group>
                )}
                 <Form.Group className="mt-3">
                      <Form.Label className="fs-5 fw-bolder">Work Order<span className="text-danger">*</span></Form.Label>
                      <Controller
                        name="workOrder"
                        control={control}
                        render={({  field: { onChange, onBlur, name, ref } }) => (
                          <Form.Control
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => {
                              handleFileChange(e);
                              onChange(e.target.files[0]); 
                            }}
                            required
                            accept=".pdf,.jpeg,.jpg"
                          />
                        )}
                      />
                      {errors.workOrder && (
                        <p className="text-danger">{errors.workOrder.message}</p>
                      )}
                    </Form.Group>
                {preview && (
                  <div
                  onClick={handlePreviewClick}
                  style={{ cursor: 'pointer', marginTop: '10px' }}
                >
                 <h6>
                  {uploadedFile
                    ? fileType.startsWith('image/') 
                      ? <>
                          <PiImagesSquareBold style={{ marginRight: '8px' }} />
                          Preview Image
                        </>
                      : <>
                          <FcDocument style={{ marginRight: '8px' }} />
                          Preview Document
                        </>
                    : 'Preview File'} 
                </h6>
                </div>
                )}
                <PreviewModal
                  show={showPreviewModal}
                  onHide={handleCloseModal}
                  preview={preview}
                  fileType={fileType}
                />
                
              </div>
              <div className="col-sm-3 col-md-3 col-lg-3 ">
                <Form.Group className="mb-3" controlId="StartDate">
                    <Form.Label className="fs-5 fw-bolder">Start Date<span className="text-danger">*</span></Form.Label>
                    <div className="row px-2">
                      <Controller
                        name="startDate"
                        control={control}
                        render={({ field }) => <DatePicker {...field} selected={field.value} onChange={(date) => field.onChange(date)} className="form-control" dateFormat="MMMM d, yyyy" placeholderText="Select Start Date" />}
                        />
                      {errors.startDate && <p className="text-danger">{errors.startDate.message}</p>}
                    </div>
                  </Form.Group>
                    <Form.Group className="mb-3" controlId="directrate">
                          <Form.Label className="fs-5 fw-bolder">Directorates<span className="text-danger">*</span></Form.Label>
                          <Controller
                            name="DirectrateName"
                            control={control}
                            render={({ field }) => (
                              <Select
                              {...field}
                              options={directrateOptions} 
                              value={directrateOptions.find(option => option.label === field.value) || null}
                              isClearable
                              isDisabled={loading}
                              placeholder="Select Directorate"
                              onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.label : "")}
                            />
                            )}
                          />
                          {errors.DirectrateName && <p className="text-danger">{errors.DirectrateName.message}</p>}
                    </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fs-5 fw-bolder">Payment Method<span className="text-danger">*</span></Form.Label>
                    <Controller
                      name="paymentMethod"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={paymentMethodOptions}
                          value={selectPaymentMethodOptions}
                          isClearable
                          isDisabled={loading}
                          placeholder="Select Payment Method"
                          onChange={handlePaymentMethodChange}
                        />
                      )}
                    />
                    {errors.paymentMethod && <p className="text-danger">{errors.paymentMethod.message}</p>}
                  </Form.Group>
                
              </div>
              <div className="col-sm-3 col-md-3 col-lg-3 ">
                <Form.Group className="mb-3" controlId="EndDate">
                      <Form.Label className="fs-5 fw-bolder">End Date<span className="text-danger">*</span></Form.Label>
                      <div className="row px-2">
                         
                          <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => <DatePicker {...field} selected={field.value} onChange={(date) => field.onChange(date)} className="form-control" dateFormat="MMMM d, yyyy" placeholderText="Select End Date" />}
                          />
                          {errors.endDate && <p className="text-danger">{errors.endDate.message}</p>}
                       
                      </div>
                    </Form.Group>
                  <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Service Location<span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="ServiceLoction"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" placeholder="Location from where Project will be Executed"/>}
                  />
                  {errors.ServiceLoction && <p className="text-danger">{errors.ServiceLoction.message}</p>}
                </Form.Group>
                {disableProjectValue &&(
                <Form.Group className="mb-3" controlId="ProjectValue">
                  <Form.Label className="fs-5 fw-bolder">Project value With (GST)<span className="text-danger">*</span></Form.Label>
                   <Controller
                      name="ProjectValue"
                      control={control}
                      render={({ field: { onChange, onBlur, value, ref } }) => (
                        <input
                          type="text"
                          inputMode="numeric"
                          className="form-control"
                          placeholder="Project Value in ₹"
                          value={value ? formatINRCurrency(value) : ""}
                          onChange={(e) => {
                            const input = e.target;
                            const cursorPosition = input.selectionStart;
                            const raw = e.target.value.replace(/[^0-9]/g, '');
                            const formatted = formatINRCurrency(raw);
                            const prevCommas = (formatINRCurrency(value || "").slice(0, cursorPosition).match(/,/g) || []).length;
                            const newCommas = (formatted.slice(0, cursorPosition).match(/,/g) || []).length;
                            const commaDiff = newCommas - prevCommas;

                            onChange(raw);

                            setTimeout(() => {
                              const newPos = cursorPosition + commaDiff;
                              input.setSelectionRange(newPos, newPos);
                            }, 0);
                          }}
                          onBlur={onBlur}
                          ref={(el) => {
                            ref(el);
                            inputRef.current = el;
                          }}
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-", "."].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      )}
                    />
                  {errors.ProjectValue && <p className="text-danger">{errors.ProjectValue.message}</p>}
                </Form.Group> 
                )}

              </div>
              {disableProjectValueYearly && (
                <div>
                  <Form.Label className="fs-5 fw-bolder">
                    Project Values Yearly Wise With (GST) <span className="text-danger">*</span>
                  </Form.Label>

                <Table bordered hover responsive className="mt-2">
                    <thead className="custom-thead">
                    <tr>
                      <th style={{ width: "50%" }}>Financial Year</th>
                      <th style={{ width: "50%" }}>Project Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyFields.map((fieldData, index) => (
                      <tr key={fieldData.yearRange}>
                        <td className="align-middle">{fieldData.yearRange}</td>
                        <td>
                          <Controller
                            name={`yearlyProjectValues[${index}].value`}
                            control={control}
                            defaultValue=""
                            render={({ field: { onChange, onBlur, value, ref } }) => (
                              <>
                              <input
                                type="text"
                                inputMode="numeric"
                                className="form-control"
                                placeholder={`Enter value for ${fieldData.yearRange}`}
                                value={value ? formatINRCurrency(value) : ""}
                                onChange={(e) => {
                                  const input = e.target;
                                  const cursorPosition = input.selectionStart;
                                  const raw = e.target.value.replace(/[^0-9]/g, "");
                                  const formatted = formatINRCurrency(raw);
                                  const prevCommas =
                                    (formatINRCurrency(value || "")
                                      .slice(0, cursorPosition)
                                      .match(/,/g) || []).length;
                                  const newCommas =
                                    (formatted.slice(0, cursorPosition).match(/,/g) || [])
                                      .length;
                                  const commaDiff = newCommas - prevCommas;

                                  onChange(raw);

                                  setTimeout(() => {
                                    const newPos = cursorPosition + commaDiff;
                                    input.setSelectionRange(newPos, newPos);
                                  }, 0);
                                }}
                                onBlur={onBlur}
                                ref={ref}
                                onKeyDown={(e) => {
                                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                />
                                {errors.yearlyProjectValues &&
                                  errors.yearlyProjectValues[index] &&(
                                    <p className="text-danger">
                                      {errors.yearlyProjectValues.message }
                                    </p>
                                )}
                                </>
                            )}
                          />

                          {/* Hidden field for yearRange */}
                          <Controller
                            name={`yearlyProjectValues[${index}].yearRange`}
                            control={control}
                            defaultValue={fieldData.yearRange}
                            render={({ field }) => <input type="hidden" {...field} />}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                </div>

              )}
            </div>
            <h1 className="pt-5 fw-bolder">Contact Details Of Client</h1>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
            <div className="row">
              <div className="col-sm-3 col-md-3 col-lg-3">
                <Form.Group className="mb-3" controlId="fullName">
                  <Form.Label className="fs-5 fw-bolder">Primary Person Full Name<span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="PrimaryFullName"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" placeholder="Enter Primary Perseonal Details"/>}
                  />
                  {errors.PrimaryFullName && <p className="text-danger">{errors.PrimaryFullName.message}</p>}                
                </Form.Group>
                <Form.Group className="mb-3" controlId="fullName">
                  <Form.Label className="fs-5 fw-bolder">Secondary Person Full Name</Form.Label>
                  <Controller
                    name="SecondaryFullName"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" placeholder="Enter Secondary Perseon Details"/>}
                  />
                  {errors.SecondaryFullName && <p className="text-danger">{errors.SecondaryFullName.message}</p>}
                </Form.Group>
              </div>
              <div className="col-sm-3 col-md-3 col-lg-3">
                <Form.Group className="mb-3" controlId="primaryPhoneNo">
                  <Form.Label className="fs-5 fw-bolder">Primary Mobile Number<span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="PrimaryPhoneNo"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        className="form-control"
                        placeholder="Enter Primary Person Mobile Number"
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-", "."].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          field.onChange(e);
                        }}
                      />
                    )}
                  />
                  {errors.PrimaryPhoneNo && <p className="text-danger">{errors.PrimaryPhoneNo.message}</p>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="secondryPhoneNo">
                  <Form.Label className="fs-5 fw-bolder">Secondary Mobile Number</Form.Label>
                 <Controller
                  name="SecondaryPhoneNo"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      maxLength={10}
                      className="form-control"
                      placeholder="Enter Secondary Person Mobile Number"
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        field.onChange(e);
                      }}
                    />
                  )}
                />
                  {errors.SecondaryPhoneNo && <p className="text-danger">{errors.SecondaryPhoneNo.message}</p>}
                </Form.Group>
              </div>
              <div className="col-sm-3 col-lg-3 col-md-3">
                <Form.Group className="mb-3" controlId="primaryemail">
                  <Form.Label className="fs-5 fw-bolder">Primary E-Mail<span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="PrimaryEmail"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" placeholder = "Enter Primary Person E-mail ID"/>}
                  />
                  {errors.PrimaryEmail && <p className="text-danger">{errors.PrimaryEmail.message}</p>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="Secondaryemail">
                  <Form.Label className="fs-5 fw-bolder">Secondary E-Mail</Form.Label>
                  <Controller
                    name="SecondaryEmail"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" placeholder = "Enter Secondary Person E-mail Id"/>}
                  />
                  {errors.SecondaryEmail && <p className="text-danger">{errors.SecondaryEmail.message}</p>}
                </Form.Group>
              </div>
              <div className="col-sm-3 col-md-3 col-lg-3">
                <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Primary Role/Designation</Form.Label>
                  <Controller
                    name="primaryRoleAndDesignation"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" placeholder = "Enter Primary Person Role/Deignation"/>}
                  />
                  {errors.primaryRoleAndDesignation && <p className="text-danger">{errors.primaryRoleAndDesignation.message}</p>}
                </Form.Group>
                 <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Secondary Role/Designation</Form.Label>
                  <Controller
                    name="secondaryRoleAndDesignation"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" placeholder = "Enter Secondary Person Role/Deignation"/>}
                  />
                  {errors.secondaryRoleAndDesignation && <p className="text-danger">{errors.secondaryRoleAndDesignation.message}</p>}
                </Form.Group>
              </div>
            </div>  
            <div className="py-3">
             <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 4, 
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleButtonClick}
                  disabled={loading}
                  startIcon={!loading && <IoIosSave />}
                  sx={{
                    paddingX: 3,
                    paddingY: 1,
                    fontWeight: 'bold',
                    borderRadius: 3,
                    fontSize: '1rem',
                    letterSpacing: '0.5px',
                    boxShadow: 3,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'SAVE'}
                </Button>
              </Box>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
