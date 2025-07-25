import React, { useState, useEffect, useRef } from "react";
import Form from "react-bootstrap/Form";
import { yupResolver } from "@hookform/resolvers/yup";
import validationSchema from '../../../validation/validationSchema'
import "bootstrap/dist/css/bootstrap.min.css";
import {getTypeOfWork} from '../../../api/typeOfWorkAPi/typeOfWorkApi'
import DatePicker from "react-datepicker";
import { postPerseonlData } from '../../../api/ProjectDetailsAPI/projectDetailsApi'
import { postdirectrate, getdirectrate } from '../../../api/directrateAPI/directrate'
import {postProjectTypeList, getProjectTypeList} from '../../../api/projectTypeListApi/projectTypeListApi'
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import PreviewModal from '../../../components/previewfile/preview';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Popup from '../../../components/popupBox/PopupBox'
import FormComponent from '../../../components/formComponent/formcomponent'
import { PiImagesSquareBold } from "react-icons/pi";
import { FcDocument } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import { TiArrowBack } from "react-icons/ti";
import { IoIosSave } from "react-icons/io";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import "./homePage.css";


const HomePage = () => {
  const { control, handleSubmit, formState: { errors }, setValue,reset } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      selectedProjectTypes: [],
      startDate: null,
      endDate: null,
      SecondaryEmail:"",
      SecondaryPhoneNo:"",
      SecondaryFullName:"",
      secondaryRoleAndDesignation:""
    },
  });

  const [preview, setPreview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDirectrateModal, setShowDirectrateModal] = useState(false);
  const [projectTypeName, setProjectTypeName] = useState([]); 
  const [selectedTypeOfWorkOptions, setSelectedTypeOfWorkOptions] = useState([]);
  const [directrateOptions, setDirectrateOptions]= useState([])
  const [error, setError] = useState(null);
  const [directrateName, setDirectrateName] = useState('');
  const [projectTypes, setProjectTypes] = useState([]);
  const [disableScopeOfWork,setDisableScopeOfWork] =useState()
  const [typeOfWorkOption,setTypeOfWorkOption] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [fileType, setFileType] = useState(''); 
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(()=>{
    const fetchTypeOfWork = async() =>{
      try{
        const response = await getTypeOfWork();
        if(response.data && Array.isArray(response.data.data)){
          const option = response.data.data.map((TypeOfWork)=>({
            value:TypeOfWork._id,
            label:TypeOfWork.typrOfWork
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
      serviceLocation: data.ServiceLoction,
      secondaryRoleAndDesignation: data.secondaryRoleAndDesignation,
      primaryRoleAndDesignation:data.primaryRoleAndDesignation,
      projectManager:data.projectManager,
      projectType: data.selectedProjectTypes.map(type => type.value),
      workOrder: uploadedFile,
    };
    console.log(payload)
 
    setLoading(true);
    try{
      const response = await postPerseonlData(payload);
      if (response.statusCode === 200) {
        reset({
          workOrderNo: '',
          orderType: '',
          type: '',
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
        setUploadedFile(null);
        setFileType("");
  
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

  const handelProjectListFormSubmit = async() =>{
    const payload = {
      ProjectTypeName:projectTypeName 
    }
    setLoading(true);
    try{
      const response = await postProjectTypeList(payload);
      if (response.statusCode === 200){
        toast.success("Project type added successfully!",{
           className: 'custom-toast custom-toast-success'
      });
        setProjectTypeName("");
      } else if (response.statusCode === 400 && response.message.includes("Scope of work already exist")){
        toast.error(response.message, {
          className: "custom-toast custom-toast-error",
        });
      }
    }catch(error){ 
      toast.error(error?.message || "Failed to add Scope Of Work.", {
        className: "custom-toast custom-toast-error",
      });
    }finally{
      setLoading(false);
    }
  }

  const handleDirectrateFormSubmit = async()=>{
    const payload ={
      directrate:directrateName,
    }
    setLoading(true);
    try{
      const response = await postdirectrate(payload);
      if(response.statusCode == 200){
        toast.success("Project type added successfully!",{
          className: 'custom-toast custom-toast-success'
        });
        setDirectrateName('')
      }else if (response.statusCode === 400 && response.message.includes("Directorates already exist")){
        toast.error(response.message, {
          className: "custom-toast custom-toast-error",
        });
      }
    } catch(error){
      toast.error(error?.message || "Failed to add Scope Of Work.", {
        className: "custom-toast custom-toast-error",
      });
    }finally{
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    setProjectTypeName(e.target.value);
  };

  const handleDirectrateInputChange = (e) => {
    setDirectrateName(e.target.value);
  }

  const handledirectrateshow = () =>{
    setShowDirectrateModal(true);
  }

  const handledirectrateClose = () =>{
    setShowDirectrateModal(false)
  }

  const handleShow = () => {
    setShowModal(true); 
  };


  const handleClose = () => {
    setShowModal(false); 
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
      const selectedString = selected?.label;
      setValue('typeOfWork',selectedString)
  }
  const formatINRCurrency = (value) => {
    if (!value) return "";
    const number = Number(value.toString().replace(/,/g, ""));
    return number.toLocaleString("en-IN");
  };

  return (
    <div className="home-page">
        <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
        <Popup
        show={showDirectrateModal}
        handleClose={handledirectrateClose}
        title="ADD Directrate Name"   
        showFooter={true}      
        footerText="Close" 
        handleAdd={handleDirectrateFormSubmit}   
      >     
      <FormComponent
        label="Add Directorates Name" 
        placeholder="Enter Directorates Name"
        value={directrateName} 
        onChange={handleDirectrateInputChange}
      />
      </Popup>
      <Popup
        show={showModal}
        handleClose={handleClose}
        title="ADD Scope Of Work Type"   
        showFooter={true}      
        footerText="Close" 
        handleAdd={handelProjectListFormSubmit}   
      >     
       <FormComponent  
        label="Add Scope Of Work" 
        placeholder="Enter Scope of work"
        value={projectTypeName} 
        onChange={handleInputChange} 
      />
      </Popup>
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
              <div className="col-sm-4 col-lg-4 col-md-4">
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
              <div className="col-sm-4 col-lg-4 col-md-4">
                <Form.Group className="mb-3">
                    <Form.Label className="fs-5 fw-bolder">Order Type<span className="text-danger">*</span> </Form.Label>
                    <Controller
                      name="orderType"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <div className="row">
                          <div className="col-sm-3 col-lg-3 col-md-3">
                            <div className="form-check">
                              <input
                                {...field}
                                type="radio"
                                id="1"
                                value="GeM"
                                className="form-check-input"
                                checked={field.value === "GeM"}
                              />
                              <label htmlFor="11" className="form-check-label">GeM</label>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-6 col-md-6">
                            <div className="form-check">
                          <input
                            {...field}
                            type="radio"
                            id="2"
                            value="Nomination"
                            className="form-check-input"
                            checked={field.value === "Nomination"}
                          />
                          <label htmlFor="2" className="form-check-label">Nomination</label>
                        </div>
                      </div>
                    </div>                      
                      )}
                    />
                    {errors.orderType && <p className="text-danger">{errors.orderType.message}</p>}
                  </Form.Group>
              </div>
              <div className="col-sm-4 col-lg-4 col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder"> Type<span className="text-danger">*</span> </Form.Label>
                  <Controller
                    name="type"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <div className="row">
                        <div className="col-sm-3 col-lg-3 col-md-3">
                          <div className="form-check">
                            <input
                              {...field}
                              type="radio"
                              id="1"
                              value="PSU"
                              className="form-check-input"
                              checked={field.value === "PSU"}
                            />
                            <label htmlFor="1" className="form-check-label">PSU</label>
                          </div>
                        </div>
                        <div className="col-sm-3 col-lg-3 col-md-3">
                          <div className="form-check">
                            <input
                              {...field}
                              type="radio"
                              id="2"
                              value="Govt"
                              className="form-check-input"
                              checked={field.value === "Govt"}
                            />
                            <label htmlFor="2" className="form-check-label">Govt</label>
                          </div>
                        </div>
                        <div className="col-sm-3 col-md-3 col-lg-3">
                        <div className="form-check">
                            <input
                              {...field}
                              type="radio"
                              id="3"
                              value="Private"
                              className="form-check-input"
                              checked={field.value === "Private"}
                            />
                            <label htmlFor="3" className="form-check-label">Private</label>
                          </div>
                        </div>
                      </div>                      
                    )}
                  />
                  {errors.type && <p className="text-danger">{errors.type.message}</p>}
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6 col-md-6 col-lg-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Organisation Name<span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="OrganisationName"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" placeholder="Enter Organisation Name"/>}
                  />
                  {errors.OrganisationName && <p className="text-danger">{errors.OrganisationName.message}</p>}
                </Form.Group>
                <div className="row">
                  <div className="col-sm-6 col-md-6 col-lg-6">
                    <Form.Group className="mb-3" controlId="StartDate">
                      <Form.Label className="fs-5 fw-bolder">Start Date<span className="text-danger">*</span></Form.Label>
                      <div className="row">
                        <div className="col-sm-11 col-md-11 col-lg-11 ">
                        <Controller
                          name="startDate"
                          control={control}
                          render={({ field }) => <DatePicker {...field} selected={field.value} onChange={(date) => field.onChange(date)} className="form-control" dateFormat="MMMM d, yyyy" placeholderText="Select Start Date" />}
                          />
                        {errors.startDate && <p className="text-danger">{errors.startDate.message}</p>}
                        </div>
                      </div>
                    </Form.Group>
                  </div>
                  <div className="col-sm-6 col-md-6 col-lg-6">
                    <Form.Group className="mb-3" controlId="EndDate">
                      <Form.Label className="fs-5 fw-bolder">End Date<span className="text-danger">*</span></Form.Label>
                      <div className="row">
                          <div className="col-sm-11 col-md-11 col-lg-11 ">
                          <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => <DatePicker {...field} selected={field.value} onChange={(date) => field.onChange(date)} className="form-control" dateFormat="MMMM d, yyyy" placeholderText="Select End Date" />}
                          />
                          {errors.endDate && <p className="text-danger">{errors.endDate.message}</p>}
                        </div>
                      </div>
                    </Form.Group>
                  </div>
                </div>
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
                          onChange={(selected) => setValue("selectedProjectTypes", selected)} // Updates the form value
                          placeholder="Select Project Types"
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
                <Form.Group className="mb-3" controlId="ProjectValue">
                  <Form.Label className="fs-5 fw-bolder">Project value (GST)<span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="ProjectValue"
                    control={control}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <input
                        type="text"
                        inputMode="numeric"
                        className="form-control"
                        placeholder="Project Value in ₹"
                        value={value ? `${formatINRCurrency(value)}₹` : ""}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^0-9]/g, "");
                          if (!isNaN(rawValue)) {
                            onChange(rawValue);
                          }
                        }}
                        onBlur={onBlur}
                        ref={ref}
                        onKeyDown={(e) => {
                          const input = e.target;
                          const pos = input.selectionStart;
                          const length = input.value.length;
                          if (["e", "E", "+", "-", "."].includes(e.key)) {
                            e.preventDefault();
                          }
                          if ((e.key === "ArrowRight" || e.key === "End") && pos >= length - 1) {
                            e.preventDefault();
                          }
                          if (e.key === "Backspace" && pos >= length - 1) {
                            e.preventDefault();
                            const raw = value?.toString().slice(0, -1) || "";
                            onChange(raw);
                          }
                        }}
                        onClick={(e) => {
                          const input = e.target;
                          const length = input.value.length;
                          if (input.selectionStart >= length - 1) {
                            input.setSelectionRange(length - 1, length - 1);
                          }
                        }}
                      />
                    )}
                  />
                  {errors.ProjectValue && <p className="text-danger">{errors.ProjectValue.message}</p>}
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
              <div className="col-sm-6 col-md-6 col-lg-6"> 
                <Form.Group className="mb-3" controlId="PriojectName">
                  <Form.Label className="fs-5 fw-bolder">Project Name<span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="ProjectName"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" placeholder="Enter Project Name" />}
                  />
                  {errors.ProjectName && <p className="text-danger">{errors.ProjectName.message}</p>}
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
                    render={({ field }) => <input {...field} type="number" className="form-control" placeholder="Enter Primary Person Mobile Number" onKeyDown={(e) => {if (["e", "E", "+", "-", "."].includes(e.key)) {e.preventDefault();}}}/>}
                  />
                  {errors.PrimaryPhoneNo && <p className="text-danger">{errors.PrimaryPhoneNo.message}</p>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="secondryPhoneNo">
                  <Form.Label className="fs-5 fw-bolder">Secondary Mobile Number</Form.Label>
                  <Controller
                    name="SecondaryPhoneNo"
                    control={control}
                    render={({ field }) => <input {...field} className="form-control" type="number" placeholder ="Enter Secondary Person Mobile Number" onKeyDown={(e) => {if (["e", "E", "+", "-", "."].includes(e.key)) {e.preventDefault();}}} />}
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
                  justifyContent: 'space-between',
                  mt: 4, 
                }}
              >
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleBackClick}
                  startIcon={<TiArrowBack />}
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
                  BACK
                </Button>

                {/* SAVE Button on the right */}
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
