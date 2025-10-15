import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { ToastContainer, toast } from 'react-toastify';
import DomainMasterSchema from '../../../validation/domainMaster'
import Form from "react-bootstrap/Form";
import { IoIosSave } from "react-icons/io";
import CircularProgress from '@mui/material/CircularProgress';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import CertificateMasterSchema from "../../../validation/certificateMaster"
import {postCertificateMaster} from "../../../api/certificateMaster/certificateMaster"

const CertificateMasterForm = () =>{
    const { control, handleSubmit, formState: { errors }, setValue,reset } = useForm({
        resolver: yupResolver(CertificateMasterSchema),
        defaultValues: {},
    });
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();
    const handleBackClick = ()=>{
        navigate(`/Certificate-Master`) 
    }
    const handleButtonClick = (e) => {
        e.preventDefault();
        handleSubmit(handleFormdataSubmit)();
    };
    const handleFormdataSubmit = async (data) => {
        const payload = {
            certificateName:data.certificateName,
        }
        setLoading(true);
        try{
            const response = await postCertificateMaster(payload)
            if (response?.data?.statusCode === 200) {
                reset({
                    certificateName:'certificateName'
                })
                toast.success('Form submitted successfully!', {
                    className: 'custom-toast custom-toast-success',
                });
            }else if(response?.data?.statusCode === 400 ){
                toast.error(response?.data?.message, {
                    className: "custom-toast custom-toast-error",
                });}
        }catch(error){
            toast.error(error?.response?.data?.message, {
                className: 'custom-toast custom-toast-error',
            });
        }finally{
            setLoading(false) 
        }
    }
    return(
        <div>
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
                        Certificate Master
                    </Typography>
                </Box>
            </div>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}/>
            <div className="container-fluid">
                <div className="row">
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-sm-6 col-lg-6 col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="fs-5 fw-bolder">Certificate Name<span className="text-danger">*</span></Form.Label>
                                    <Controller
                                        name="certificateName"
                                        control={control}
                                        render={({ field }) => <input {...field} className="form-control" placeholder="Enter Certificate Name"/>}
                                    />
                                    {errors.certificateName && <p className="text-danger">{errors.certificateName.message}</p>}
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
    )
}

export default CertificateMasterForm