import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Form ,Table} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { editProjectDetails,getProjectDetailsById } from "../../../api/ProjectDetailsAPI/projectDetailsApi";
import { getProjectTypeList } from "../../../api/projectTypeListApi/projectTypeListApi";
import { getdirectrate } from "../../../api/directrateAPI/directrate";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {getTypeOfWork} from '../../../api/typeOfWorkAPi/typeOfWorkApi'
import { useNavigate } from 'react-router-dom';
import { Controller } from "react-hook-form";
import PreviewModal from '../../../components/previewfile/preview';  
import Select from "react-select";
import { PiImagesSquareBold } from "react-icons/pi";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import EditIcon from '@mui/icons-material/Edit';
import {getDomain} from '../../../api/clientSectorApi/clientSectorApi'
import './projectDetailsEdit'

const ProjectDetailsEdit = ({ ID, onClose }) => {
    const { register, handleSubmit, setValue, reset, getValues, control,formState: { errors },watch } = useForm();
    const [file, setFile] = useState(null);
    const [valueINR, setValueINR] = useState("");
    const [projectTypes, setProjectTypes] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedTypeOfWorkOptions, setSelectedTypeOfWorkOptions] = useState([]);
    const [yearlyFields, setYearlyFields] = useState([]);
    const [selectedOrderTypeOptions, setSelectedOrderTypeOptions] = useState([]);
    const [selectPaymentMethodOptions, setSelectPaymentMethodOptions]= useState([])
    const [selectedTypeOptions, setSelectedTypeOptions] = useState([]);
    const [disableProjectValue,setDisableProjectValue] = useState(false)
    const [savedProjectValue, setSavedProjectValue] = useState("");
    const [disableProjectValueYearly,setDisableProjectValueYearly] = useState(false)
    const [domainOption, setDomainoOption] = useState([])
    const [selectedDomainOptions, setSelectedDomainOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState("");
    const [fileError, setFileError] = useState("");
    const [directrateList, setDirectrateList] = useState([]);
    const [previewFileType, setPreviewFileType] = useState('');
    const [selectedDirectorate, setSelectedDirectorate] = useState(null);
    const [typeOfWorkOption,setTypeOfWorkOption] = useState([]);
    const [savedYearlyFields, setSavedYearlyFields] = useState([]); 
    const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');
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
    const { id } = useParams();
    const projectId = ID || id;
    const navigate = useNavigate();
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
            setDomainoOption(option);
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
        const fetchProjectTypes = async () => {
            try {
                if(selectedTypeOfWorkOptions){
                    let selectedType
                    if (Array.isArray(selectedTypeOfWorkOptions)){
                        selectedType =selectedTypeOfWorkOptions[0]?.label
                    }
                    else{
                        selectedType = selectedTypeOfWorkOptions.label
                    }
                    const response = await getProjectTypeList({category:selectedType});
                    setProjectTypes(response?.data || []);
                }
                else{
                    setProjectTypes([])
                }
            } catch (error) {
                console.error("Error fetching project types:");
            }
        };
        fetchProjectTypes();
    }, [selectedTypeOfWorkOptions,]);
    useEffect(() => {
        const fetchdirectrateList = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await getdirectrate();
                if (response?.data?.data && Array.isArray(response.data.data)) {
                    const options = response.data.data.map((item) => ({
                        label: item.directrate,
                    }));
                    setDirectrateList(options);
                } else {
                    throw new Error("Unexpected data format or empty directrate list");
                }
            } catch (err) {
                setError(`Failed to fetch directrate list:`);
                console.error("Error fetching directrate list:");
            } finally {
                setLoading(false);
            }
        };
        fetchdirectrateList();
    }, []);
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await getProjectDetailsById(projectId);
                const fetchedData = response?.data;
                const fileUrl = fetchedData?.workOrderUrl
                setFilePreviewUrl(fileUrl);
                if (fetchedData) {
                    const formattedStartDate = fetchedData.startDate
                        ? fetchedData.startDate.split("T")[0]
                        : "";
                    const formattedEndDate = fetchedData.endDate
                        ? fetchedData.endDate.split("T")[0]
                        : "";
    
                    reset({
                        ...fetchedData,
                        startDate: formattedStartDate,
                        endDate: formattedEndDate,
                        ProjectValue: fetchedData.projectValue || "",
                        projectValueYearly: fetchedData.projectValueYearly || [],
                    });
                    if (fetchedData.paymentMethod === 'Fixed Payment') {
                        setDisableProjectValue(true);
                        setDisableProjectValueYearly(false);    
                    }else if (fetchedData.paymentMethod === 'Yearly Payment') { 
                        setDisableProjectValue(false);
                        setDisableProjectValueYearly(true);
                         if (fetchedData.projectValueYearly?.length > 0) {
                            const yearlyMapped = fetchedData.projectValueYearly.map((item) => ({
                                yearRange: item.financialYear,
                                value: item.amount,
                            }));
                            setYearlyFields(yearlyMapped);
                        }
                    }
                    setFile(fetchedData.workOrder || null);
                    const selectedOrderType = Array.isArray(fetchedData.orderType) 
                    ? fetchedData.orderType
                    : [fetchedData.orderType]
                      const selectedOrderTypes = selectedOrderType.map(type => ({
                        value: type,
                        label: type,
                    }));
                    setSelectedOrderTypeOptions(selectedOrderTypes)
                    const selectedType = Array.isArray(fetchedData.type) 
                    ? fetchedData.type
                    : [fetchedData.type]
                      const selectedTypes = selectedType.map(type => ({
                        value: type,
                        label: type,
                    }));
                    setSelectedTypeOptions(selectedTypes)
                    const selectPaymentMethod = Array.isArray(fetchedData.paymentMethod)
                    ? fetchedData.paymentMethod
                    : [fetchedData.paymentMethod]
                    const selectedPaymentMethods = selectPaymentMethod.map(method => ({
                        value: method,
                        label: method,
                    }));
                    setSelectPaymentMethodOptions(selectedPaymentMethods)
                    if (domainOption.length > 0) {
                        const selectedDomain = Array.isArray(fetchedData.domain) 
                            ? fetchedData.domain
                            : [fetchedData.domain];

                        const selectedDomains = selectedDomain
                            .map(domainId => domainOption.find(opt => opt.value === domainId))
                            .filter(Boolean);

                        setSelectedDomainOptions(selectedDomains || null);
                    }
                    const selectedProjectTypes = fetchedData.projectType.map(type => ({
                        value: type._id,
                        label: type.ProjectTypeName,
                    }));
                    setSelectedOptions(selectedProjectTypes);
                    const selectedDirectrate = Array.isArray(fetchedData.directrate)
                    ? fetchedData.directrate
                    : [fetchedData.directrate];
                    const matchedDirectrate = selectedDirectrate.map(type =>({
                        label:type
                    }));
                    setSelectedDirectorate(matchedDirectrate || null);
                    const selectedTypeOfWork = Array.isArray(fetchedData.typeOfWork) 
                    ? fetchedData.typeOfWork
                    : [fetchedData.typeOfWork]
                    const matchedTypeOfWork =  selectedTypeOfWork.map(type=>({
                        label:type
                    }));
                    setSelectedTypeOfWorkOptions(matchedTypeOfWork || null);
                }
            } catch (error) {
                console.error("Error fetching project details:");
            }
        };
        if (projectId) fetchProject();
    }, [projectId, reset, setValue,domainOption]);
    const onSubmit = async (formData) => {
        setLoading(true); 
        try {
            const formDataToSubmit = new FormData();
            const workOrderNo = formData.workOrderNo || getValues("workOrderNo")
            const type = formData.type || getValues("type")
            const orginisationName = formData.orginisationName || getValues("orginisationName")
            const projectName = formData.projectName || getValues("projectName");
            const startDate = formData.startDate || getValues("startDate");
            const orderType = formData.orderType || getValues("orderType");
            const domain = formData.domain || getValues("domain");
            const endDate = formData.endDate || getValues("endDate");
            const projectValue = formData.projectValue || getValues("projectValue");
            const serviceLocation = formData.serviceLocation || getValues("serviceLocation");
            const projectType= formData.projectType || getValues("projectType");
            const directrate = formData.directrate || getValues("directrate");
            const primaryPersonName = formData.primaryPersonName || getValues("primaryPersonName")
            const secondaryPersonName = formData.secondaryPersonName || getValues("secondaryPersonName")
            const projectManager = formData.projectManager || getValues("projectManager")
            const primaryPersonPhoneNo = formData.primaryPersonPhoneNo || getValues("primaryPersonPhoneNo")
            const secondaryPrsonPhoneNo = formData.secondaryPrsonPhoneNo || getValues("secondaryPrsonPhoneNo")
            const primaryPersonEmail = formData.primaryPersonEmail || getValues("primaryPersonEmail")
            const secondaryPersonEmail = formData.secondaryPersonEmail || getValues("secondaryPersonEmail")
            const typeOfWork = formData.typeOfWork || getValues('typeOfWork')
            const primaryRoleAndDesignation = formData.primaryRoleAndDesignation || getValues('primaryRoleAndDesignation')
            const secondaryRoleAndDesignation = formData.secondaryRoleAndDesignation || getValues('secondaryRoleAndDesignation')
            const paymentMethod = formData.paymentMethod || getValues("paymentMethod");
            const currentYearlyData = getValues("projectValueYearly") || [];
            let projectTypeIds = [];
            if (Array.isArray(projectType) && projectType.every(item => item._id)) {
                projectTypeIds = projectType.map(item => item._id);
            } else {
                projectTypeIds = projectType;
            }

            formDataToSubmit.append("workOrderNo",workOrderNo)
            formDataToSubmit.append("domain",domain)
            formDataToSubmit.append("type",type)
            formDataToSubmit.append("orginisationName",orginisationName)
            formDataToSubmit.append("projectName", projectName);
            formDataToSubmit.append("endDate", endDate);
            formDataToSubmit.append("startDate", startDate);
            formDataToSubmit.append("orderType", orderType);
            formDataToSubmit.append("serviceLocation", serviceLocation);
            formDataToSubmit.append("projectType",projectTypeIds);
            formDataToSubmit.append("directrate",directrate)
            formDataToSubmit.append("primaryPersonName",primaryPersonName)
            formDataToSubmit.append("secondaryPersonName",secondaryPersonName)
            formDataToSubmit.append("projectManager",projectManager)
            formDataToSubmit.append("primaryPersonPhoneNo",primaryPersonPhoneNo)
            formDataToSubmit.append("secondaryPrsonPhoneNo",secondaryPrsonPhoneNo)
            formDataToSubmit.append("primaryPersonEmail",primaryPersonEmail)
            formDataToSubmit.append("secondaryPersonEmail",secondaryPersonEmail)
            formDataToSubmit.append("typeOfWork",typeOfWork)
            formDataToSubmit.append("primaryRoleAndDesignation",primaryRoleAndDesignation)
            formDataToSubmit.append("secondaryRoleAndDesignation",secondaryRoleAndDesignation)
            formDataToSubmit.append("paymentMethod",paymentMethod)
            if (file && file instanceof Blob) {
                formDataToSubmit.append("workOrder", file, file.name);
            } 
            if (paymentMethod === "Yearly Payment") {
                const formattedYearlyValues = currentYearlyData
                    .filter(item => item.financialYear && item.amount)
                    .map(item => ({
                        financialYear: item.financialYear,
                        amount: Number(item.amount)
                    }));

                if (formattedYearlyValues.length === 0 || !formattedYearlyValues[0].amount) {
                    toast.error("Please enter the first year's project value before submitting.",{
                        className: 'custom-toast custom-toast-error',
                    });
                    setLoading(false);
                    return;
                }

                formDataToSubmit.append("projectValueYearly", JSON.stringify(formattedYearlyValues));
                formDataToSubmit.append("projectValue", ""); 
            } else {
                formDataToSubmit.append("projectValueYearly", "[]");
                formDataToSubmit.append("projectValue", projectValue);
            }
           const response = await editProjectDetails(projectId, formDataToSubmit);
           if (response?.data?.statusCode  === 400){
            toast.error('Work Order Number Already Exist!', {
                className: 'custom-toast custom-toast-error',
            });
             } else if (response?.data?.statusCode  === 401){
                toast.error('Project Name Already Exist!', {
                className: 'custom-toast custom-toast-error',
            });
            }else if (response?.data?.statusCode  === 500){
                    toast.error(response?.data?.message, {
                    className: 'custom-toast custom-toast-error',
                });
           }else{
               toast.success('Form Updated successfully!', {
                    className: 'custom-toast custom-toast-success',
                });
           }
        } catch (error) {
            console.error("Update failed:", error);
            toast.error('Failed to submit the form.',error, {
                className: 'custom-toast custom-toast-error',
            });
        }
        setLoading(false)
    };
    const formatINRCurrency = (value) => {
    const x = value.replace(/,/g, "");
    const len = x.length;
    if (len <= 3) return x;
    const lastThree = x.slice(len - 3);
    const rest = x.slice(0, len - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return rest + "," + lastThree;
    };
    const projectTypeOptions = projectTypes.map((type) => ({
        value: type._id,
        label: type.ProjectTypeName,
    }));
    const handleBackClick = ()=>{
        navigate(`/home`) 
    }
    const handleProjectTypeChange = (selected) => {
        setSelectedOptions(selected);
        const selectedValues = selected.map((option) => option.value);
        setValue("projectType", selectedValues); 
    }

    const handleDirectoreteChange =(selected) => {
        setSelectedDirectorate(selected)
        const selectedString = selected && selected.label ? String(selected.label) : '';
        setValue('directrate',selectedString)
    }

     const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const maxSize = 10 * 1024 * 1024;
        if (!selectedFile) return;
            if (selectedFile.size > maxSize) {
                setFileError(true);
                setFile(null);
                e.target.value = null;
                return;
            }
      
        setFile(selectedFile);
        setFileError(false);

        const blobURL = URL.createObjectURL(selectedFile);
        setUploadedPreviewUrl(blobURL);       
        setFilePreviewUrl(blobURL);          
        setPreviewFileType(selectedFile.type);
    };

    const getFileTypeFromUrl = (url) => {
        const extension = url?.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
            return 'image/';
        } else if (extension === 'pdf') {
            return 'application/pdf';
        } else {
            return 'unknown';
        }
    };

    const handlePreviewClick = (url, type = '') => {
        const fileType = type || getFileTypeFromUrl(url);
        setFilePreviewUrl(url);
        setPreviewFileType(fileType);
        setShowModal(true);
    };
    const handleTypeOfWorkChange = (selected) =>{
        setSelectedTypeOfWorkOptions(selected)
        setSelectedOptions([])
        const selectedString = selected && selected.label ? String(selected.label) : '';
        setValue('typeOfWork',selectedString)
    }
    const handlePaymentMethodChange =(selected)=>{
        const start = getValues("startDate");
        const end = getValues("endDate");
        if (selected?.value === "Fixed Payment") {
            if (yearlyFields.length > 0) {
                setSavedYearlyFields(yearlyFields);
                setYearlyFields([]);
            }
            generateYearlyFields()
            setDisableProjectValue(true);
            setDisableProjectValueYearly(false);
            if (savedProjectValue) {
                setValue("projectValue", savedProjectValue || "");
            }
        }else if (selected?.value === "Yearly Payment") {
            setDisableProjectValue(false);
            setDisableProjectValueYearly(true);
            const currentValue = getValues("projectValue");
            setSavedProjectValue(currentValue || ""); 
            if (savedYearlyFields.length > 0) {
                setYearlyFields(savedYearlyFields);
                } else {
                setYearlyFields([]); 
            }
             if (start && end) {
                generateYearlyFields();
            } else {
                setYearlyFields([]);
            }
            setValue("projectValue", "")
        }
        setSelectPaymentMethodOptions(selected)
        const selectedString = selected?.label;
        setValue('paymentMethod',selectedString)
    }
    const handleOrderTypeChange = (selected) =>{
        setSelectedOrderTypeOptions(selected)
        const selectedString = selected?.label;
        setValue('orderType',selectedString)
    }
    const handleType =(selected)=>{
        setSelectedTypeOptions(selected)
        const selectedString = selected?.label;
        setValue('type',selectedString)
    } 
    const handleDomain =(selected)=>{
        setSelectedDomainOptions(selected)
        const selectedString = selected?.value;
        setValue('domain',selectedString)
    } 
    useEffect(() => {
        const start = getValues("startDate");
        const end = getValues("endDate");

        if (start && end) {
            generateYearlyFields();
        } else {
            setYearlyFields([]); 
        }
        }, [watch("startDate"), watch("endDate")]);
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
        <div className="container-fluid">
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
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
            <form onSubmit={handleSubmit(onSubmit)} className="edit-project-form">
                <div className="row pt-4" >
                    <div className="col-sm-3 col-md-3 col-lg-3">
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder">Work Order Number<span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                {...register("workOrderNo", { required: "Work Order Number is required" })}
                                isInvalid={!!errors.workOrderNo}
                            />
                            {errors.workOrderNo && (
                                <div className="text-danger">{errors.workOrderNo.message}</div>
                            )}
                        </Form.Group>
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-3">
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder">Order Type<span className="text-danger">*</span></Form.Label>
                            <Select
                                name="orderType"
                                options={OrderTypeOption}
                                value={selectedOrderTypeOptions} 
                                onChange={handleOrderTypeChange}
                                isDisabled={loading} 
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-3">
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder">Organisation Type<span className="text-danger">*</span></Form.Label>
                            <Select
                                name="type"
                                options={TypeOption}
                                value={selectedTypeOptions} 
                                onChange={handleType}
                                isDisabled={loading} 
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-3">
                         <Form.Group>
                            <Form.Label className="fs-5 fw-bolder">Domain<span className="text-danger">*</span></Form.Label>
                            <Select
                                name="domain"
                                options={domainOption}
                                value={selectedDomainOptions} 
                                onChange={handleDomain}
                                isDisabled={loading} 
                            />
                        </Form.Group>
                    </div>
                </div>
                <div className="row pt-3">
                    <div className="col-md-3 col-lg-3 col-sm-3">
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder">Organisation Name<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                {...register("orginisationName",{ required: "orginisationName is required" })}
                                isInvalid={!!errors.orginisationName} 
                            />
                            {errors.orginisationName && (
                                <div className="text-danger">{errors.orginisationName.message}</div>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-3">Type Of Work<span className="text-danger">*</span></Form.Label>
                            <Select
                                name="TypeOfWork"
                                options={typeOfWorkOption}
                                value={selectedTypeOfWorkOptions} 
                                onChange={handleTypeOfWorkChange}
                                isDisabled={loading} 
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-2">Project Manager<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                {...register("projectManager",{required:"Project Manager in required"})} 
                                isInvalid={!!errors.projectManager}
                            />
                            {errors.projectManager && (
                                <div className="text-danger">{errors.projectManager.message}</div>
                            )}
                        </Form.Group>            
                        
                       
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-3">
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder">Project Name<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                {...register("projectName",{required: "Project Name is required"})} 
                                isInvalid={!!errors.projectName}
                            />
                            {errors.projectName && (
                                <div className="text-danger">{errors.projectName.message}</div>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-3">Scope Of Work<span className="text-danger">*</span></Form.Label>
                            <Select
                                isMulti
                                name="projectType"
                                options={projectTypeOptions}
                                value={selectedOptions} 
                                onChange={handleProjectTypeChange} 
                            />
                            <input
                                type="hidden"
                                {...register("projectType", {
                                validate: value =>
                                    value && value.length > 0 ? true : "Please select at least one project type"
                                })}
                            />
                            {errors.projectType && (
                                <div className="text-danger">{errors.projectType.message}</div>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-2">Work Order<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="file" 
                                accept=".jpg,.png,.pdf" 
                                onChange={handleFileChange} 
                                className={fileError ? "is-invalid" : ""}
                            />
                            {fileError && (
                                <div className="invalid-feedback">
                                    File must be less than or equal to 10 MB.
                                </div>
                            )}
                        </Form.Group>
                        <div className="col-sm-7 col-md-7 col-lg-7">
                            <div className="col-md ">
                                <div className="mt-2" style={{ cursor: "pointer", marginTop: "10px" }}>
                                    <h6
                                        style={{ cursor: "pointer", marginTop: "10px" }}
                                        onClick={() =>
                                            uploadedPreviewUrl
                                            ? handlePreviewClick(uploadedPreviewUrl, previewFileType)
                                            : handlePreviewClick(filePreviewUrl) 
                                        }
                                    >
                                        <PiImagesSquareBold style={{ marginRight: "8px" }} /> Preview Uploaded
                                    </h6>
                                </div>
                            </div>
                        </div>
                        <PreviewModal 
                            show={showModal} 
                            onHide={() => setShowModal(false)} 
                            preview={filePreviewUrl} 
                            fileType={previewFileType} 
                        />  
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-3">
                        <Form.Group className="mb-3" controlId="StartDate">
                            <Form.Label className="fs-5 fw-bolder">Start Date<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="date"
                                {...register("startDate",{required: "Start Date is required"})} 
                                isInvalid={!!errors.startDate}                     
                            />
                            {errors.startDate && (
                                <div className="text-danger">{errors.startDate.message}</div>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder">Directorates<span className="text-danger">*</span></Form.Label> 
                            <Select
                                name="directrate"
                                options={directrateList}
                                value={selectedDirectorate}
                                onChange={handleDirectoreteChange}
                                isLoading={loading}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-2">Payment Method<span className="text-danger">*</span></Form.Label>
                            <Select
                                name="paymentMethod"
                                options={paymentMethodOptions}
                                value={selectPaymentMethodOptions} 
                                onChange={handlePaymentMethodChange}
                                isDisabled={loading} 
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-3">
                        <Form.Group controlId="endDate">
                            <Form.Label className="fs-5 fw-bolder">End Date<span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="date"
                                {...register("endDate", {
                                    required: "End Date is required",
                                    validate: (value) => {
                                    const startDate = getValues("startDate");
                                    if (!startDate) return true; 
                                    return (
                                        new Date(value) >= new Date(startDate) ||
                                        "End Date must be after Start Date"
                                    );
                                    },
                                })}
                                isInvalid={!!errors.endDate}
                            />
                            {errors.endDate && (
                                <div className="text-danger">{errors.endDate.message}</div>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-2">Service Location<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                {...register("serviceLocation",{required: "Service Location is required"})} 
                                isInvalid={!!errors.serviceLocation}
                            />
                            {errors.serviceLocation && (
                                <div className="text-danger">{errors.serviceLocation.message}</div>
                            )}
                        </Form.Group>
                        {disableProjectValue &&(
                            <Form.Group>
                                <Form.Label className="fs-5 fw-bolder pt-3">Project Value in ₹ with (GST) <span className="text-danger">*</span></Form.Label>
                                <div className="position-relative">
                                    <Controller
                                    name="projectValue"
                                    control={control}
                                   rules={{
                                        validate: (val) => {
                                        if (selectPaymentMethodOptions?.value === "Fixed Payment") {
                                            const raw = String(val).replace(/,/g, "");
                                            if (raw === "") return "Project Value is required";
                                            if (!/^\d+$/.test(raw)) return "Only numeric values are allowed";
                                        }
                                        return true; 
                                        },
                                    }}
                                    render={({
                                        field: { onChange, onBlur, value, ref },
                                        fieldState: { error },
                                    }) => {
                                        const formattedValue = value ? formatINRCurrency(value) : "";
                                        return (
                                        <>
                                            <Form.Control
                                            type="text"
                                            inputMode="numeric"
                                            className="form-control"
                                            isInvalid={!!error}
                                            ref={(el) => {
                                                ref(el);
                                                inputRef.current = el;
                                            }}
                                            placeholder="Project Value in ₹"
                                            value={formattedValue||""}
                                            onChange={(e) => {
                                                const input = e.target;
                                                const cursorPos = input.selectionStart;

                                                const rawDigits = e.target.value.replace(/[^0-9]/g, "");

                                                const oldFormatted = formatINRCurrency(value || "");
                                                const newFormatted = formatINRCurrency(rawDigits);

                                                const oldCommas = (oldFormatted.slice(0, cursorPos).match(/,/g) || []).length;
                                                const newCommas = (newFormatted.slice(0, cursorPos).match(/,/g) || []).length;
                                                const diff = newCommas - oldCommas;

                                                onChange(rawDigits);

                                                setTimeout(() => {
                                                const newPos = cursorPos + diff;
                                                input.setSelectionRange(newPos, newPos);
                                                }, 0);
                                            }}
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", "."].includes(e.key)) {
                                                e.preventDefault();
                                                }
                                            }}
                                            onBlur={onBlur}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {error?.message}
                                            </Form.Control.Feedback>
                                        </>
                                        );
                                    }}
                                    />
                                </div>
                            </Form.Group>
                        )}
                    </div>
                     {disableProjectValueYearly && (
                        <div className="mt-3">
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
                                <tr key={fieldData.yearRange || index}>
                                    <td className="align-middle">
                                    {fieldData.yearRange}
                                    <Controller
                                        name={`projectValueYearly[${index}].financialYear`}
                                        control={control}
                                        defaultValue={fieldData.yearRange}
                                        render={({ field }) => <input type="hidden" {...field} />}
                                    />
                                    </td>
                                    <td>
                                    <Controller
                                        name={`projectValueYearly[${index}].amount`}
                                        control={control}
                                        defaultValue={fieldData.value}
                                        render={({ field: { onChange, value, ref } }) => (
                                        <Form.Control
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
                                                (formatted.slice(0, cursorPosition).match(/,/g) || []).length;
                                            const commaDiff = newCommas - prevCommas;

                                            onChange(raw);

                                            setTimeout(() => {
                                                const newPos = cursorPosition + commaDiff;
                                                input.setSelectionRange(newPos, newPos);
                                            }, 0);
                                            }}
                                            ref={ref}
                                            onKeyDown={(e) => {
                                            if (["e", "E", "+", "-", "."].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                            }}
                                        />
                                        )}
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
                    <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-3">Primary Person Full Name<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                {...register("primaryPersonName",{required:"Name of Primary Person Required"})} 
                                isInvalid={!!errors.primaryPersonName}
                            />
                            {errors.primaryPersonName && (
                                <div className="text-danger">{errors.primaryPersonName.message}</div>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-3">Secondary Person Full Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                {...register("secondaryPersonName")} 
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-3">
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-3">
                                Primary Mobile Number <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                maxLength={10}
                                {...register("primaryPersonPhoneNo", {
                                required: "Mobile number is required",
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Mobile number must be exactly 10 digits",
                                },
                                })}
                                onKeyDown={(e) => {
                                if (
                                    ["e", "E", "+", "-", ".", ","].includes(e.key) ||
                                    (e.key.length === 1 && !/[0-9]/.test(e.key))
                                ) {
                                    e.preventDefault();
                                }
                                }}
                                className={errors.primaryPersonPhoneNo ? "is-invalid" : ""}
                            />
                            {errors.primaryPersonPhoneNo && (
                                <div className="invalid-feedback">
                                    {errors.primaryPersonPhoneNo.message}
                                </div>
                            )}
                            </Form.Group>
                        <Form.Group>
                        <Form.Label className="fs-5 fw-bolder pt-3">Secondary Mobile Number</Form.Label>
                            <Form.Control 
                                type="text"
                                maxLength={10} 
                                {...register("secondaryPrsonPhoneNo",{pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Mobile number must be exactly 10 digits",
                                }})}
                                 onKeyDown={(e) => {
                                if (
                                    ["e", "E", "+", "-", ".", ","].includes(e.key) ||
                                    (e.key.length === 1 && !/[0-9]/.test(e.key))
                                ) {
                                    e.preventDefault();
                                }
                                }}
                                className={errors.secondaryPrsonPhoneNo ? "is-invalid" : ""} 
                            />
                            {errors.secondaryPrsonPhoneNo && (
                                <div className="invalid-feedback">
                                    {errors.secondaryPrsonPhoneNo.message}
                                </div>
                            )}
                        </Form.Group>
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-3">
                    <Form.Group>
                        <Form.Label className="fs-5 fw-bolder pt-3">
                            Primary E-Mail <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control 
                            type="email" 
                            {...register("primaryPersonEmail", {
                            required: "Primary E-Mail is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Enter a valid email address",
                            },
                            })} 
                            className={errors.primaryPersonEmail ? "is-invalid" : ""} 
                        />
                        {errors.primaryPersonEmail && (
                            <div className="invalid-feedback">
                            {errors.primaryPersonEmail.message}
                            </div>
                        )}
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="fs-5 fw-bolder pt-3">Secondary E-Mail</Form.Label>
                        <Form.Control 
                            type="email" 
                            {...register("secondaryPersonEmail",{pattern: {
                                validate: (value) => {
                                if (!value) return true; // allow empty
                                if (value.toLowerCase() === "n/a") return true;
                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                return emailRegex.test(value) || "Enter a valid email address or N/A";
                                }
                            }})} 
                            className={errors.secondaryPersonEmail ? "is-invalid" : ""} 
                        />
                        {errors.secondaryPersonEmail && (
                            <div className="invalid-feedback">
                                {errors.secondaryPersonEmail.message}
                            </div>
                        )}
                        </Form.Group>
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-3">
                    <Form.Group>
                        <Form.Label className="fs-5 fw-bolder pt-3">Primary Role/Designation</Form.Label>
                        <Form.Control 
                            type="text" 
                            {...register("primaryRoleAndDesignation")} 
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="fs-5 fw-bolder pt-3">Secondary Role/Designation</Form.Label>
                        <Form.Control 
                            type="text" 
                            {...register("secondaryRoleAndDesignation")} 
                        />
                    </Form.Group>
                    </div>
                </div>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mt: 4, 
                    }}
                    >
                    
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading}
                        startIcon={!loading && <EditIcon  />}
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
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Update'}
                    </Button>
                    </Box>
            </form>
        </div>
    );
};

export default ProjectDetailsEdit;
