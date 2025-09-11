import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Form,} from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PreviewModal from '../../../components/previewfile/preview'; 
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit' 
import { PiImagesSquareBold } from "react-icons/pi";
import {getCertificateDetailsById, updateCertificate} from '../../../api/certificateApi/certificate'

const CerificateEdit = ({ID}) => {
    const { register, handleSubmit, setValue, reset, getValues, control, formState: { errors }, } = useForm();
    const [oneTimeFull,setOneTimeFull]=useState(true)
    const [fileUrl, setFileUrl] = useState(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState("");
    const [previewFileType, setPreviewFileType] = useState("");
    const [fileError, setFileError] = useState("");
    const [file, setFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');
    const { id } = useParams();
    const certificateId = ID || id;
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCertificate();
    }, []);

    const fetchCertificate = async () => {
        try {
            const response = await getCertificateDetailsById(certificateId);
            const fetchData = response?.data
            console.log("data",fetchData)
            if(fetchData){
                const formattedIssuedDate = fetchData.issuedDate? fetchData.issuedDate.split("T")[0]: "";
                const formattedValidUpto = fetchData.validUpto? fetchData.validUpto.split("T")[0]: "";
                 reset({
                    ...fetchData,
                    issuedDate: formattedIssuedDate,
                    validUpto:formattedValidUpto
                });
                if (oneTimeFull && fetchData.certificateUrl) {
                    const isAbsolute = fetchData.certificateUrl.startsWith("http");
                    const fullUrl = isAbsolute
                        ? fetchData.certificateUrl
                        : `${window.location.origin}${fetchData.certificateUrl}`;
                    setFileUrl(fullUrl);
                    setFilePreviewUrl(fullUrl);
                }
                setOneTimeFull(false);
            }
        } catch (error) {
            console.error('Error fetching project details:',);
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = ({ID})=>{
        navigate(`/certificate`) 
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
      } else {
        return 'unknown';
      }
    };

     const onSubmit = async (formData) => {
        setLoading(true);
        try{
            const formDataToSubmit = new FormData();
            const certificateName = formData.certificateName || getValues("certificateName");
            const assignedPerson = formData.assignedPerson || getValues("assignedPerson");
            const issuedDate = formData.issuedDate || getValues("issuedDate");
            const validUpto = formData.validUpto || getValues("validUpto");

            formDataToSubmit.append("certificateName", certificateName);
            formDataToSubmit.append("assignedPerson", assignedPerson);
            formDataToSubmit.append("issuedDate", issuedDate);
            formDataToSubmit.append("validUpto", validUpto);

            if (file && file instanceof Blob) {
                formDataToSubmit.append("uploadeCertificate", file, file.name);
            }

            const response = await updateCertificate(certificateId,formDataToSubmit)
            console.log(response)
            if (response?.data?.statusCode ===200){
                toast.success(response?.data?.message, {
                    className: 'custom-toast custom-toast-success',
                });
            } else {
                toast.error(response?.data?.message, {
                    className: 'custom-toast custom-toast-error',
                });
            }

        }catch(error){
            toast.error(error, {
                className: 'custom-toast custom-toast-error',
            });
        }finally{
           setLoading(false);  
        }
     }

    return(
       <div className='comntainer-fluid'>
          <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
          <div className='row'>
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
                    Certificate
                </Typography>
            </Box>
          </div>
          <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
           <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="row pt-4" >
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Certificate Name<span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                {...register("certificateName", { required: "Certificate Name is required" })}
                                isInvalid={!!errors.certificateName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.certificateName?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <div className="row">
                            <div className="col-sm-6 col-md-6 col-lg-6">
                                <Form.Group className="pt-3">
                                    <Form.Label className="fs-5 fw-bolder">Issued Date<span className="text-danger">*</span></Form.Label>
                                    <div className="row">
                                        <div className='col-sm-11 col-md-11 col-lg-11'>
                                            <Form.Control
                                                type="date" 
                                                min={new Date().toISOString().split("T")[0]}
                                                {...register("issuedDate", {required: "Issued Date is required",})} 
                                                isInvalid={!!errors.issuedDate}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.issuedDate?.message}
                                            </Form.Control.Feedback>
                                        </div>
                                    </div>
                                </Form.Group>
                            </div>
                            <div className="col-sm-6 col-md-6 col-lg-6">
                                <Form.Group className="pt-3">
                                    <Form.Label className="fs-5 fw-bolder">Valid Upto<span className="text-danger">*</span></Form.Label>
                                    <div className="row">
                                        <div className='col-sm-11 col-md-11 col-lg-11'>
                                            <Form.Control
                                                type="date" 
                                                min={new Date().toISOString().split("T")[0]}
                                                {...register("validUpto", {required: "Valid Upto is required",})} 
                                                isInvalid={!!errors.validUpto}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.validUpto?.message}
                                            </Form.Control.Feedback>
                                        </div>
                                    </div>
                                </Form.Group>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Assigned Person Name<span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                {...register("assignedPerson", { required: "Assigned Person Name is required" })}
                                isInvalid={!!errors.assignedPerson}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.assignedPerson?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                         <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Certificate Upload (PDF, Image)<span className="text-danger">*</span></Form.Label>
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
           </Form>
       </div>
    )

}

export default CerificateEdit;