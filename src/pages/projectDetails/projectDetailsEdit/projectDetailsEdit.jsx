import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Spinner} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { editProjectDetails } from "../../../api/ProjectDetailsAPI/projectDetailsApi";
import { getProjectTypeList } from "../../../api/projectTypeListApi/projectTypeListApi";
import { getdirectrate } from "../../../api/directrateAPI/directrate";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {getTypeOfWork} from '../../../api/typeOfWorkAPi/typeOfWorkApi'
import { useNavigate } from 'react-router-dom';
import PreviewModal from '../../../components/previewfile/preview';  
import Select from "react-select";
import { TiArrowBack } from "react-icons/ti";
import { PiImagesSquareBold } from "react-icons/pi";
import './projectDetailsEdit'

const ProjectDetailsEdit = ({ ID, onClose }) => {
    const { register, handleSubmit, setValue, reset, getValues } = useForm();
    const [file, setFile] = useState(null);
    const [projectTypes, setProjectTypes] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedTypeOfWorkOptions, setSelectedTypeOfWorkOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState("");
    const [directrateList, setDirectrateList] = useState([]);
    const [previewFileType, setPreviewFileType] = useState('');
    const [selectedDirectorate, setSelectedDirectorate] = useState(null);
    const [typeOfWorkOption,setTypeOfWorkOption] = useState([]);
    const [typeValue, setTypeValue] = useState()
    const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');

    const { id } = useParams();
    const projectId = ID || id;
    const navigate = useNavigate();

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

            if (file && file instanceof Blob) {
                formDataToSubmit.append("workOrder", file, file.name);
            } 
           await editProjectDetails(projectId, formDataToSubmit);
           toast.success('Form Updated successfully!', {
                className: 'custom-toast custom-toast-success',
            });
        } catch (error) {
            console.error("Update failed:", error);
            toast.error('Failed to submit the form.',error, {
                className: 'custom-toast custom-toast-error',
            });
        }
        setLoading(false)
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
        setValue("projectType", selectedValues); // Update form state with selected values
    }

    const handleDirectoreteChange =(selected) => {
        setSelectedDirectorate(selected)
        const selectedString = selected && selected.label ? String(selected.label) : '';
        setValue('directrate',selectedString)
    }

  const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (!selectedFile) return;
      setFile(selectedFile);

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
                <div className="col-sm-10 col-md-10 col-lg-10">
                    <h1 className="fw-bolder">Update Project Details</h1>
                </div>
                <div className="col-sm-2 col-md-2 col-lg-2">
                    <Button variant="danger" className='btn btn-success ' onClick={handleBackClick}>
                        <TiArrowBack />BACK
                    </Button>
                </div>
            </div>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
            <form onSubmit={handleSubmit(onSubmit)} className="edit-project-form">
                <div className="row pt-4" >
                    <div className="col-sm-4 col-md-4 col-lg-4">
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder">Work Order Number<span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text" 
                                {...register("workOrderNo")} 
                            />
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
                                {...register("orginisationName")} 
                            />
                        </Form.Group>
                        <div className="row pt-3">
                            <div className="col-sm-6 col-md-6 col-lg-6">
                                 <Form.Group className="mb-3" controlId="StartDate">
                                     <Form.Label className="fs-5 fw-bolder">Start Date<span className="text-danger">*</span></Form.Label>
                                     <Form.Control 
                                        type="date"
                                        {...register("startDate")}                      
                                    />
                                 </Form.Group>
                            </div>
                            <div className="col-sm-6 col-md-6 col-lg-6">
                                <Form.Group controlId="endDate">
                                <Form.Label className="fs-5 fw-bolder">End Date<span className="text-danger">*</span></Form.Label>
                                <Form.Control 
                                    type="date"
                                    {...register("endDate")} 
                                />
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
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-3">Project value in Numeric<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="number" 
                                {...register("projectValue")} 
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-3">Service Location<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                {...register("serviceLocation")} 
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-6 col-md-6 col-lg-6">
                    <Form.Group>
                          <Form.Label className="fs-5 fw-bolder">Project Name<span className="text-danger">*</span></Form.Label>
                          <Form.Control 
                                type="text" 
                                {...register("projectName")} 
                            />
                        </Form.Group>
                        <Form.Group>
                         <Form.Label className="fs-5 fw-bolder pt-3">Type Of Work<span className="text-danger">*</span></Form.Label>
                         <Select
                            name="TypeOfWork"
                            options={typeOfWorkOption}
                            value={selectedTypeOfWorkOptions} 
                            onChange={handleTypeOfWorkChange} 
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
                        />
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
			</div>
                </div>
                <h1 className="pt-5 fw-bolder">Contact Details Of Client</h1>
                <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
                <div className="row">
                    <div className="col-sm-4 col-md-4 col-lg-4">
                    <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-3">Primary Person Full Name<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                {...register("primaryPersonName")} 
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-3">Secondary Person Full Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                {...register("secondaryPersonName")} 
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-3">Project Manager<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                {...register("projectManager")} 
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-4 col-md-4 col-lg-4">
                    <Form.Group>
                           <Form.Label className="fs-5 fw-bolder pt-3">Primary Mobile Number<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="number" 
                                {...register("primaryPersonPhoneNo")} 
                            />
                        </Form.Group>
                        <Form.Group>
                        <Form.Label className="fs-5 fw-bolder pt-3">Secondary Mobile Number</Form.Label>
                            <Form.Control 
                                type="number" 
                                {...register("secondaryPrsonPhoneNo")} 
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-4 col-md-4 col-lg-4">
                    <Form.Group>
                         <Form.Label className="fs-5 fw-bolder pt-3">Primary E-Mail<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="email" 
                                {...register("primaryPersonEmail")} 
                            />
                        </Form.Group>
                        <Form.Group>
                        <Form.Label className="fs-5 fw-bolder pt-3">Secondary E-Mail</Form.Label>
                            <Form.Control 
                                type="email" 
                                {...register("secondaryPersonEmail")} 
                            />
                        </Form.Group>
                    </div>
                </div>
                    <Button type="submit" className="mt-4 ml-4" variant="primary" onClick={onSubmit} disabled={loading}>
                       {loading ? (
                            <Spinner animation="border" size="sm" />
                            ) : (
                            'Save'
                            )}
                    </Button>
                    <Button variant="danger" className='mt-4 mx-4' onClick={handleBackClick}>
                        <TiArrowBack />BACK
                    </Button>
            </form>
        </div>
    );
};

export default ProjectDetailsEdit;
