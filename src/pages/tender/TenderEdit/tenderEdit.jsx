import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Spinner} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import PreviewModal from '../../../components/previewfile/preview';  
import Select from "react-select";
import { TiArrowBack } from "react-icons/ti";
import { PiImagesSquareBold } from "react-icons/pi";
import {getTrackingById,updateTenderById,updatetendermessage} from '../../../api/TenderTrackingAPI/tenderTrackingApi'
import { getStateList } from '../../../api/stateApi/stateApi';
import { getEmpList } from '../../../api/TenderTrackingAPI/tenderTrackingApi';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2'

const TenderTrackingEdit =({ID}) =>{
    const { register, handleSubmit, setValue, reset, getValues } = useForm();
    const [loading, setLoading] = useState(false); 
    const [stateOption,setStateOption] =useState([])
    const [selectedStateOption, setSelectedStateOption] = useState([])
    const [empListOption, setEmpListOption] =useState([])
    const [selectedEmpList, setSelectedEmpList] =useState([])
    const [slectedStatus, setSelectedStatus] = useState([])
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState("");
    const [previewFileType, setPreviewFileType] = useState("");
    const [oneTime,setOneTime]=useState(true)
    const [oneTimeStatus,setOneTimeStatus]=useState(true)
    const [oneTimeTaskForce,setOneTimeTaskForce]=useState(true)
    const [oneTimeFull,setOneTimeFull]=useState(true)
    const [showModal, setShowModal] = useState(false);
   const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');
    const MySwal = withReactContent(Swal);
    const StatusOption =[
        {value:"Upload",label:"Upload"},
        {value:"Bidding",label:"Bidding"},
        {value:"Not Bidding",label:"Not Bidding"},
    ]

    const { id } = useParams();
    const trackingId = ID || id;
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmpList();
        fetchStateList();
    }, []);

    useEffect(() => {
        if (
            oneTimeFull &&
            empListOption.length > 0 &&
            stateOption.length > 0
        ) {
            fetchTrackingTenderDetails();
            setOneTimeFull(false);
        }
    }, [empListOption, stateOption, oneTimeFull]);


        const fetchEmpList = async() =>{
          setLoading(true);
          try{
            const data = await getEmpList()
            const response=data.data
            if(response.statusCode === 200 && response.data && Array.isArray(response.data)){
              const option = response.data.map((state)=>({
                value:state._id,
                label:state.ename
              }))
              setEmpListOption(option)
            }
    
          }catch(error){
    
          }finally{
            setLoading(false);
          }
        }
 
        const fetchStateList = async() =>{
        setLoading(true);
        try{
            const response = await getStateList();
            if(response.data && Array.isArray(response.data.data)){
            const option = response.data.data.map((state)=>({
                value:state._id,
                label:state.stateName
            }))
            setStateOption(option)
            }else{
            console.log("Expect an Array")
            }
        }catch(error){
            console.error("Error fetching State:");
			Swal.fire({
			  icon: 'error',
			  title: 'Oops...',
			  text: 'Error fetching State!',
			});
        } finally{
            setLoading(false);
        }
        }


    const fetchTrackingTenderDetails = async () => {
        setLoading(true);
        try {
            const response = await getTrackingById(trackingId);
            const fetchedData = response.data;

            if (fetchedData) {
                const formattedLastDate = fetchedData.lastDate
                    ? fetchedData.lastDate.split("T")[0]
                    : "";

                reset({
                    ...fetchedData,
                    lastDate: formattedLastDate,
                });

                if (oneTimeFull && fetchedData.tenderDocument) {
                    const isAbsolute = fetchedData.tenderDocument.startsWith("http");
                    const fullUrl = isAbsolute
                        ? fetchedData.tenderDocument
                        : `${window.location.origin}${fetchedData.tenderDocument}`;
                    setFileUrl(fullUrl);
                    setFilePreviewUrl(fullUrl);
                }

                const handleSelectField = (fieldValue, optionsList, setSelectedFn, fieldName) => {
                    const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
                    const matched = values
                        .map((val) => optionsList.find((opt) => opt.label === val))
                        .filter(Boolean);

                    setSelectedFn(matched);
                    setValue(fieldName, fieldValue);
                };
                if (fetchedData.taskForce && empListOption.length > 0) {
                    handleSelectField(fetchedData.taskForce, empListOption, setSelectedEmpList, "taskForce");
                }
                if (fetchedData.state ) {
                    
                    console.log(setSelectedStateOption)
                    handleSelectField(fetchedData.state, stateOption, setSelectedStateOption, "state");
                }
                if (fetchedData.status && StatusOption.length > 0) {
                    handleSelectField(fetchedData.status, StatusOption, setSelectedStatus, "status");
                }
                setOneTimeFull(false);
            }
        } catch (error) {
            console.error("Error fetching project details:", error);
			Swal.fire({
			  icon: 'error',
			  title: 'Oops...',
			  text: 'Error fetching project details',
			});
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = ()=>{
        navigate(`/tender-list`) 
    }

    const onSubmit = async (formData) => {
  setLoading(true);
  try {
    const formDataToSubmit = new FormData();
    const tenderName = formData.tenderName || getValues("tenderName");
    const organizationName = formData.organizationName || getValues("organizationName");
    const state = formData.state || getValues("state");
    const taskForce = formData.taskForce || getValues("taskForce");
    const valueINR = formData.valueINR || getValues("valueINR");
    const status = formData.status || getValues("status");
    const lastDate = formData.lastDate || getValues("lastDate");
    const tenderid = getValues("_id");

    formDataToSubmit.append("tenderName", tenderName);
    formDataToSubmit.append("organizationName", organizationName);
    formDataToSubmit.append("state", state);
    formDataToSubmit.append("taskForce", taskForce);
    formDataToSubmit.append("valueINR", valueINR);
    formDataToSubmit.append("status", status);
    formDataToSubmit.append("lastDate", lastDate);

    if (file && file instanceof Blob) {
      formDataToSubmit.append("tenderDocument", file, file.name);
    }

    if (status === "Not Bidding") {
      const messageResult = await Swal.fire({
        title: "Submit your Message",
        input: "text",
        inputAttributes: {
          autocapitalize: "off",
        },
        showCancelButton: true,
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true,
        preConfirm: async (message) => {
          if (!message || message.trim() === "") {
            Swal.showValidationMessage("Message is required");
            return false;
          }
          try {
            const response = await updatetendermessage(tenderid, message); // Axios call
            if (response.status !== 200 && response.status !== 201) {
              Swal.showValidationMessage(`Error: ${response.statusText}`);
              return false;
            }
            return response.data;
          } catch (error) {
            Swal.showValidationMessage(
              `Request failed: ${error?.response?.data?.message || error.message}`
            );
            return false;
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (messageResult.isDismissed) {
        console.log("User cancelled");
        setLoading(false);
        return false;
      }

      if (messageResult.isConfirmed) {
        Swal.fire({
          title: "Message submitted successfully!",
          text: messageResult.value?.message || "Your message was recorded.",
          icon: "success",
        });
      }
    }

    const response = await updateTenderById(trackingId, formDataToSubmit);
    if (response.data.statusCode === 200) {
      setOneTimeFull(true);
      setOneTime(true);
      Swal.fire({
        icon: "success",
        title: "Form Updated successfully!!",
        text: response.message,
        timer: 1500,
        showConfirmButton: false,
      });
       navigate(`/tender-list`); 
    } else {
      setOneTimeFull(true);
      setOneTime(true);
      Swal.fire({
      icon: 'error',
      title: 'Failed to submit the form',
      text: 'Something went wrong!',
    });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Submission error',
      text: error?.message || 'Something went wrong!',
    });
    console.error("Submission error:", error);
	Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Submission error',
    });
  } finally {
    setLoading(false);
  }
}

    const handleState =(selected)=>{
        setSelectedStateOption(selected)
        const selectedValues = selected?.label
        setValue("state", selectedValues || '');
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

    const handlePreviewClick = (url, type = '') => {
      const fileType = type || getFileTypeFromUrl(url);
      setFilePreviewUrl(url);
      setPreviewFileType(fileType);
      setShowModal(true);
    };
    const getFileTypeFromUrl = (url) => {
      if (!url) return 'unknown';

      const match = url.match(/\.([a-zA-Z0-9]+)$/);
      const extension = match ? match[1].toLowerCase() : null;

      if (!extension) return 'unknown';

      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
        return 'image/';
      } else if (extension === 'pdf') {
        return 'application/pdf';
      } else if (extension === 'docx') {
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (extension === 'doc') {
        return 'application/msword';
      } else {
        return 'unknown';
      }
    };
    const handleTaskForcwMemberChange = (selected)=>{
      setSelectedEmpList(selected)
      const selectedValues = selected?.label
      setValue("taskForce", selectedValues);
    }

    const handleStatusChange = (selected) =>{
        setSelectedStatus(selected)
        const selectedValues = selected?.label
        setValue("status", selectedValues);
    }

    return(
        <div className="container-fluid">
            <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <div className="row">
                <div className="col-sm-10 col-md-10 col-lg-10">
                     <h1 className="fw-bolder">Tender Tracking Edit</h1>
                </div>
                <div className="col-sm-2 col-md-2 col-lg-2">
                    <Button variant="danger" className='btn btn-success ' onClick={handleBackClick}>
                        <TiArrowBack />BACK
                    </Button>
                </div>
            </div>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row pt-4" >
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Tender Name<span className="text-danger">*</span></Form.Label>
                             <Form.Control
                                type="text" 
                                {...register("tenderName")} 
                            />
                        </Form.Group>
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Organization Name<span className="text-danger">*</span></Form.Label>
                             <Form.Control
                                type="text" 
                                {...register("organizationName")} 
                            />
                        </Form.Group>
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">State<span className="text-danger">*</span></Form.Label>
                             <Select
                                options={stateOption}
                                value={selectedStateOption}
                                isClearable
                                isDisabled={loading}
                                placeholder="Select State"
                                onChange={handleState}
                            />
                        </Form.Group>
                        <Form.Group className="pt-5 ">
                            <Form.Label className="fs-5 fw-bolder">Task Force Member<span className="text-danger">*</span></Form.Label>
                             <Select
                                options={empListOption}
                                value={selectedEmpList}
                                placeholder="Select Tak Force Member"
                                onChange ={handleTaskForcwMemberChange}
                                isClearable
                                isDisabled={loading}
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="pt-4">
                             <Form.Label className="fs-5 fw-bolder">Value (INR)<span className="text-danger">*</span></Form.Label>
                             <Form.Control
                                type="text" 
                                {...register("valueINR")} 
                            />
                        </Form.Group>
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Status<span className="text-danger">*</span></Form.Label>
                            <Select
                                options={StatusOption}
                                value={slectedStatus}
                                placeholder="Select Statusr"
                                onChange ={handleStatusChange}
                                isClearable
                                isDisabled={loading}
                            />
                        </Form.Group>
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Tender Document Upload (PDF, DOC, Image)<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                            type="file" 
                            accept=".jpg,.png,.pdf,.doc,.docx" 
                            onChange={handleFileChange}
                        />
                         {(uploadedPreviewUrl || fileUrl) && (
                          <div className="mt-2" style={{ cursor: "pointer" }}>
                            <h6
                              onClick={() =>
                                uploadedPreviewUrl
                                  ? handlePreviewClick(uploadedPreviewUrl, previewFileType)
                                  : handlePreviewClick(fileUrl) 
                              }
                            >
                              <PiImagesSquareBold style={{ marginRight: "8px" }} />
                              Preview Uploaded File
                            </h6>
                          </div>
                        )}
                        <PreviewModal
                            show={showModal}
                            onHide={() => setShowModal(false)}
                            preview={filePreviewUrl}
                            fileType={previewFileType}
                        />

                        </Form.Group>                         <Form.Group className="pt-3">
                             <Form.Label className="fs-5 fw-bolder">Last Date<span className="text-danger">*</span></Form.Label>
                             <Form.Control
                                type="date" 
								min={new Date().toISOString().split("T")[0]}
                                {...register("lastDate")} 
                            />
                        </Form.Group>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-3 ">
                <Button type="submit" className=" my-5 ml-4" variant="primary" onClick={onSubmit} disabled={loading}>
                    {loading ? (
                        <Spinner animation="border" size="sm" />
                        ) : (
                        'Save'
                        )}
                </Button>
                <Button variant="danger" className='btn btn-success my-5' onClick={handleBackClick}>
                    <TiArrowBack />BACK
                </Button>
                </div>
            </form>
        </div>
    )
}

export default TenderTrackingEdit