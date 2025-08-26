import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { editProjectDetails } from "../../../api/ProjectDetailsAPI/projectDetailsApi";
import { getProjectTypeList } from "../../../api/projectTypeListApi/projectTypeListApi";
import { getdirectrate } from "../../../api/directrateAPI/directrate";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {getTypeOfWork} from '../../../api/typeOfWorkAPi/typeOfWorkApi'
import { useNavigate } from 'react-router-dom';
import { Controller } from "react-hook-form";
import PreviewModal from '../../../components/previewfile/preview';  
import Select from "react-select";
import { TiArrowBack } from "react-icons/ti";
import { PiImagesSquareBold } from "react-icons/pi";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import EditIcon from '@mui/icons-material/Edit';
import './projectDetailsEdit'

const ProjectDetailsEdit = ({ ID, onClose }) => {
    const { register, handleSubmit, setValue, reset, getValues, control,formState: { errors }, } = useForm();
    const [file, setFile] = useState(null);
    const [valueINR, setValueINR] = useState("");
    const [projectTypes, setProjectTypes] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedTypeOfWorkOptions, setSelectedTypeOfWorkOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState("");
    const [fileError, setFileError] = useState("");
    const [directrateList, setDirectrateList] = useState([]);
    const [previewFileType, setPreviewFileType] = useState('');
    const [selectedDirectorate, setSelectedDirectorate] = useState(null);
    const [typeOfWorkOption,setTypeOfWorkOption] = useState([]);
    const [typeValue, setTypeValue] = useState()
    const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');
    const inputRef = useRef(null);

    const { id } = useParams();
    const projectId = ID || id;
    const navigate = useNavigate();

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
                const response = await editProjectDetails(projectId, {}, null);
                const fetchedData = response?.data?.projectDetails;
                const fileUrl = response?.data?.filePreviewUrl
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
                    });
    
                    setFile(fetchedData.workOrder || null);
    
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
    }, [projectId, reset, setValue]);
    

    const onSubmit = async (formData) => {
        setLoading(true); 
        try {
            const formDataToSubmit = new FormData();
            const workOrderNo = formData.workOrderNo || getValues("workOrderNo")
            const type = typeValue || getValues("type")
            const orginisationName = formData.orginisationName || getValues("orginisationName")
            const projectName = formData.projectName || getValues("projectName");
            const startDate = formData.startDate || getValues("startDate");
            const orderType = formData.orderType || getValues("orderType");
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
            let projectTypeIds = [];
            if (Array.isArray(projectType) && projectType.every(item => item._id)) {
                projectTypeIds = projectType.map(item => item._id);
            } else {
                projectTypeIds = projectType;
            }

            formDataToSubmit.append("workOrderNo",workOrderNo)
            formDataToSubmit.append("type",type)
            formDataToSubmit.append("orginisationName",orginisationName)
            formDataToSubmit.append("projectName", projectName);
            formDataToSubmit.append("endDate", endDate);
            formDataToSubmit.append("startDate", startDate);
            formDataToSubmit.append("orderType", orderType);
            formDataToSubmit.append("projectValue", projectValue);
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
            if (file && file instanceof Blob) {
                formDataToSubmit.append("workOrder", file, file.name);
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
    const handleType =(value)=>{
        const selectedValue = value
        console.log(selectedValue)
        setTypeValue(selectedValue)
    } 
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
                    <div className="col-sm-4 col-md-4 col-lg-4">
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
                    <div className="col-sm-4 col-md-4 col-lg-4">
                        <Form.Group controlId="orderType">
                            <Form.Label className="fs-5 fw-bolder">Order Type<span className="text-danger">*</span> </Form.Label>
                                <div className="row">
                                    <div className="col-sm-3 col-md-3 col-lg-3">
                                    <Form.Check
                                        type="radio"
                                        label="GeM"
                                        value="GeM" 
                                        {...register("orderType")}
                                        Check={getValues("orderType") === "GeM"} 
                                        onChange={() => setValue("orderType", "GeM")} 
                                    />
                                </div>
                                <div className="col-sm-6 col-md-6 col-lg-6">
                                    <Form.Check
                                        type="radio"
                                        label="Nomination"
                                        value="Nomination" 
                                        {...register("orderType")}
                                        Check={getValues("orderType") === "Nomination"} 
                                        onChange={() => setValue("orderType", "Nomination")}
                                    />
                                </div>
                            </div>
                        </Form.Group>
                    </div>
                    <div className="col-sm col-md col-lg">
                            <Form.Label className="fs-5 fw-bolder"> Type<span className="text-danger">*</span> </Form.Label>
                            <div className='row'>
                            <div className="col-sm-3 col-md-3 col-lg-3">
                                <Form.Check
                                    type="radio"
                                    label="PSU"
                                    value="PSU" 
                                    {...register("type")}
                                    Check={getValues("type") === "PSU"} 
                                    onChange={()=>handleType("PSU")} 
                                />
                            </div>
                            <div className="col-sm-3 col-md-3 col-lg-3">
                                <Form.Check
                                    type="radio"
                                    label="Govt"
                                    value="Govt" 
                                    {...register("type")}
                                    Check={getValues("type") === "Govt"} 
                                    onChange={()=>handleType("Govt")}
                                />
                            </div>
                            <div className="col-sm-3 col-md-3 col-lg-3">
                                <Form.Check
                                    type="radio"
                                    label="Private"
                                    value="Private" 
                                    {...register("type")}
                                    Check={getValues("type") === "Private"} 
                                    onChange={()=>handleType("Private")}   
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row pt-3">
                    <div className="col-md-6 col-lg-6 col-sm-6">
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
                        <div className="row pt-3">
                            <div className="col-sm-6 col-md-6 col-lg-6">
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
                            </div>
                            <div className="col-sm-6 col-md-6 col-lg-6">
                                <Form.Group controlId="endDate">
                                <Form.Label className="fs-5 fw-bolder">
                                End Date<span className="text-danger">*</span>
                                </Form.Label>
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
                            </div>
                        </div>
                         <Form.Group>
                         <Form.Label className="fs-5 fw-bolder ">Scope Of Work<span className="text-danger">*</span></Form.Label>
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
                            <Form.Label className="fs-5 fw-bolder pt-3">
                                Project Value ₹ (GST) <span className="text-danger">*</span>
                            </Form.Label>
                           <div className="position-relative">
                                <Controller
      name="projectValue"
      control={control}
      rules={{
        required: "Project Value is required",
        validate: (val) => {
          const raw = String(val).replace(/,/g, "");
          if (raw === "") return "Value in INR is required";
          if (!/^\d+$/.test(raw)) return "Only numeric values are allowed";
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
              value={formattedValue}
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
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-5">Service Location<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                {...register("serviceLocation",{required: "Service Location is required"})} 
                                isInvalid={!!errors.serviceLocation}
                            />
                            {errors.serviceLocation && (
                                <div className="text-danger">{errors.serviceLocation.message}</div>
                            )}
                        </Form.Group>
                    </div>
                    <div className="col-sm-6 col-md-6 col-lg-6">
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
                            <Form.Label className="fs-5 fw-bolder pt-3">Directorates<span className="text-danger">*</span></Form.Label> 
                            <Select
                                name="directrate"
                                options={directrateList}
                                value={selectedDirectorate}
                                onChange={handleDirectoreteChange}
                                isLoading={loading}
                                />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-3">Work Order<span className="text-danger">*</span></Form.Label>
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
                                <div className="col-md-6 ">
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
