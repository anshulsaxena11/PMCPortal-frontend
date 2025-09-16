import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form,} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Controller } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import PreviewModal from '../../../components/previewfile/preview';  
import Select from "react-select";
import { TiArrowBack } from "react-icons/ti";
import { PiImagesSquareBold } from "react-icons/pi";
import {getTrackingById,updateTenderById,updatetendermessage} from '../../../api/TenderTrackingAPI/tenderTrackingApi'
import { getStateList } from '../../../api/stateApi/stateApi';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { getEmpList } from '../../../api/TenderTrackingAPI/tenderTrackingApi';
import withReactContent from 'sweetalert2-react-content';
import CircularProgress from '@mui/material/CircularProgress';
import Table from "react-bootstrap/Table";
import EditIcon from '@mui/icons-material/Edit'
import { useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Swal from 'sweetalert2'

const TenderTrackingEdit =({ID}) =>{
    const { register, handleSubmit, setValue, reset, getValues, control, formState: { errors }, } = useForm();
    const [loading, setLoading] = useState(false); 
    const [stateOption,setStateOption] =useState([])
    const [comments,setComments] = useState([])
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
    const [valueINR, setValueINR] = useState("");
    const [taskForceError, setTaskForceError] = useState("");
    const [fileError, setFileError] = useState("");
    const [statusError, setStatusError] = useState("");
    const [stateError, setStateError] = useState("");
    const MySwal = withReactContent(Swal);
    const location = useLocation();
    const StatusOption =[
        {value:"Upload",label:"Upload"},
        {value:"Bidding",label:"Bidding"},
        {value:"Not Bidding",label:"Not Bidding"},
    ]

    const { id } = useParams();
    const trackingId = ID || location.state?.id;
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
            setValueINR(new Intl.NumberFormat("en-IN").format(fetchedData.valueINR || ''));
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
                if (fetchedData.comment && fetchedData.comment.length > 0) {
                  const sortedComments = [...fetchedData.comment].sort(
                      (a, b) => new Date(b.commentedOn) - new Date(a.commentedOn)
                    );
                    setComments(sortedComments);
                } else {
                  setComments([]);
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
    if (!selectedStateOption || Object.keys(selectedStateOption).length === 0) {
      setStateError("State is required");
      setLoading(false);
      return;
    }
    if (!selectedEmpList || Object.keys(selectedEmpList).length === 0) {
      setTaskForceError("Task Force Member is required");
      setLoading(false);
      return;
    }
    if (!slectedStatus || Object.keys(slectedStatus).length === 0) {
      setStatusError("Status is required");
      setLoading(false);
      return;
    }
    const formDataToSubmit = new FormData();
    const tenderName = formData.tenderName || getValues("tenderName");
    const organizationName = formData.organizationName || getValues("organizationName");
    const state = formData.state || getValues("state");
    const taskForce = formData.taskForce || getValues("taskForce");
    const valueINR = formData.valueINR || getValues("valueINR");
    const status = formData.status || getValues("status");
    const lastDate = formData.lastDate || getValues("lastDate");
    const comments = formData.comments
    const tenderid = getValues("_id");

    formDataToSubmit.append("tenderName", tenderName);
    formDataToSubmit.append("organizationName", organizationName);
    formDataToSubmit.append("state", state);
    formDataToSubmit.append("taskForce", taskForce);
    formDataToSubmit.append("valueINR", valueINR);
    formDataToSubmit.append("status", status);
    formDataToSubmit.append("lastDate", lastDate);
    formDataToSubmit.append("comments", comments);

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
        setStateError(""); 
    }

     const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (!selectedFile) return;
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError("File size should not exceed 5MB");
        setFile(null);
        return;
      }
      setFileError(""); 
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
      setTaskForceError("");
    }

    const handleStatusChange = (selected) =>{
        setSelectedStatus(selected)
        const selectedValues = selected?.label
        setValue("status", selectedValues);
        setStatusError("");
    }

    return(
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
                Sales Tracking
                </Typography>
              </Box>
            </div>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row pt-4" >
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Tender Name<span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              {...register("tenderName", { required: "Tender Name is required" })}
                              isInvalid={!!errors.tenderName}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.tenderName?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Organization Name<span className="text-danger">*</span></Form.Label>
                             <Form.Control
                                type="text" 
                                {...register("organizationName", { required: "organizationName Name is required" })} 
                                isInvalid={!!errors.organizationName}
                            />
                             <Form.Control.Feedback type="invalid">
                                {errors.organizationName?.message}
                              </Form.Control.Feedback>
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
                                className={stateError ? "is-invalid" : ""}
                            />
                              {stateError && (
                                <div className="invalid-feedback d-block">{stateError}</div>
                              )}
                        </Form.Group>
                        <Form.Group className="pt-5 ">
                            <Form.Label className="fs-5 fw-bolder">Task Force Member<span className="text-danger">*</span></Form.Label>
                             <Select
                                options={empListOption}
                                value={selectedEmpList}
                                placeholder="Select Task Force Member"
                                onChange ={handleTaskForcwMemberChange}
                                isClearable
                                isDisabled={loading}
                                className={taskForceError ? "is-invalid" : ""}
                            />
                             {taskForceError && (
                                <div className="invalid-feedback d-block">{taskForceError}</div>
                              )}
                        </Form.Group>
                        <Form.Group className="pt-3">
                            <Form.Label className="fs-5 fw-bolder">New Comments</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                placeholder="Enter your comments here..."
                                {...register("comments")} 
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="pt-4">
                          <Form.Label className="fs-5 fw-bolder">
                            Value ₹ (GST)<span className="text-danger">*</span>
                          </Form.Label>
                          <Controller
                            name="valueINR"
                            control={control}
                            rules={{
                              validate: (val) => {
                                const raw = String(val).replace(/,/g, "");
                                if (raw === "") return "Value in INR is required";
                                if (!/^\d+$/.test(raw)) return "Only numeric values are allowed";
                                return true;
                              },
                            }}
                            render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
                              const formatINR = (val) => {
                                if (!val) return "";
                                const numStr = val.toString().replace(/,/g, "");
                                const len = numStr.length;
                                if (len <= 3) return numStr;
                                const last3 = numStr.slice(-3);
                                const rest = numStr.slice(0, -3);
                                return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
                              };

                              const formattedValue = value ? formatINR(value) : "";

                              return (
                                <>
                                  <Form.Control
                                    type="text"
                                    inputMode="numeric"
                                    className="form-control"
                                    isInvalid={!!error}
                                    value={formattedValue}
                                    ref={ref}
                                    placeholder="Value in ₹"
                                    onChange={(e) => {
                                      const input = e.target;
                                      const cursorPos = input.selectionStart;

                                      const raw = e.target.value.replace(/[^0-9]/g, "");

                                      const oldFormatted = formatINR(value || "");
                                      const newFormatted = formatINR(raw);

                                      const oldCommas = (oldFormatted.slice(0, cursorPos).match(/,/g) || []).length;
                                      const newCommas = (newFormatted.slice(0, cursorPos).match(/,/g) || []).length;
                                      const commaDiff = newCommas - oldCommas;

                                      onChange(raw);

                                      setTimeout(() => {
                                        const newCursor = cursorPos + commaDiff;
                                        input.setSelectionRange(newCursor, newCursor);
                                      }, 0);
                                    }}
                                    onBlur={onBlur}
                                    onKeyDown={(e) => {
                                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                                        e.preventDefault();
                                      }
                                    }}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {error?.message}
                                  </Form.Control.Feedback>
                                </>
                              );
                            }}
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
                                className={statusError ? "is-invalid" : ""}
                            />
                            {statusError && (
                              <div className="invalid-feedback d-block">{statusError}</div>
                            )}
                        </Form.Group>
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Tender Document Upload (PDF, DOC, Image)<span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                            type="file" 
                            accept=".jpg,.png,.pdf,.doc,.docx" 
                            onChange={handleFileChange}
                            className={fileError ? "is-invalid" : ""}
                        />
                         {fileError && <div className="invalid-feedback d-block">{fileError}</div>}
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

                        </Form.Group>                         
                        <Form.Group className="pt-3">
                             <Form.Label className="fs-5 fw-bolder">Last Date<span className="text-danger">*</span></Form.Label>
                             <Form.Control
                                type="date" 
                                min={new Date().toISOString().split("T")[0]}
                                {...register("lastDate", {required: "Last Date is required",})} 
                                isInvalid={!!errors.lastDate}
                            />
                              <Form.Control.Feedback type="invalid">
                                {errors.lastDate?.message}
                              </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="pt-3">
                          <Form.Label className="fs-5 fw-bolder">Old Comments</Form.Label>
                           <div style={{ overflowX: "auto", height:'130px' }}>
                            {comments && comments.length > 0 ? (
                              <Table striped bordered hover responsive>
                                <thead>
                                  <tr>
                                    <th>S.NO</th>
                                    <th>Comment</th>
                                    <th>Commented By</th>
                                    <th>Commented On</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {comments.map((c, index) => (
                                    <tr key={c._id || index}>
                                      <td>{index + 1}</td>
                                      <td>{c.comments}</td>
                                      <td>{c.displayName}</td>
                                      <td>{new Date(c.commentedOn).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            ) : (
                              <p className="mt-3 text-muted">No comments available</p>
                            )}
                          </div>
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
                      startIcon={!loading && <EditIcon />}
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
    )
}

export default TenderTrackingEdit