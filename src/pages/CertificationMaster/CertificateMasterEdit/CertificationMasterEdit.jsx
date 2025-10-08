import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import {getCertificateMasterById,updateCertificate} from '../../../api/certificateMaster/certificateMaster'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form,} from "react-bootstrap";
import { useForm } from "react-hook-form";
import Select from 'react-select';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit' 

const CertificateMasterEdit = () =>{
    const { register, handleSubmit, reset, getValues, formState: { errors }, } = useForm();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const id = location.state?.id;
    const handleBackClick = ()=>{
        navigate(`/Certificate-Master`) 
    }
  
    const fetchCertificateSector = async () => {
        try {
        const response = await getCertificateMasterById(id);
        const fetchdata=response?.data
            if(fetchdata){
                reset({
                    ...fetchdata,
                })
            }
        } catch (error) {
            console.error('Error fetching project details:',);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCertificateSector();
    }, [id]);

    const onSubmit = async (formData) => {
        setLoading(true);
        try{
            const formDataToSubmit = new FormData();
            const certificateName = formData.certificateName || getValues("certificateName");

            formDataToSubmit.append("certificateName", certificateName);

            const response = await updateCertificate(id,formDataToSubmit)
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
        <div className='container-fluid'>
            <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <div className='row'>
                <Box display="flex" justifyContent="center" alignItems="center" position="relative" mb={3}>
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
                        Certificate Master
                    </Typography> 
                </Box>
            </div>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="row pt-4">
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Certificate Name<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text" 
                                    {...register("certificateName", {required: "Certificate Name is required",})} 
                                    isInvalid={!!errors.certificateName}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.certificateName?.message}
                                </Form.Control.Feedback>
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

export default CertificateMasterEdit;