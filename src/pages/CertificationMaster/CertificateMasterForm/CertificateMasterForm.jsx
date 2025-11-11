import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { ToastContainer, toast } from 'react-toastify';
import PopupForm from '../../../components/PopBoxForm/PopupBoxForm'
import Form from "react-bootstrap/Form";
import { IoIosSave } from "react-icons/io";
import CircularProgress from '@mui/material/CircularProgress';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {postCertificateTypeMaster,getCertificateTypeMasterList} from "../../../api/certificateTypeMasterApi/certificateTypeMaster"
import CertificateMasterSchema from "../../../validation/certificateMaster"
import {postCertificateMaster} from "../../../api/certificateMaster/certificateMaster"

const CertificateMasterForm = () =>{
    const { control, handleSubmit, formState: { errors }, setValue,reset } = useForm({
        resolver: yupResolver(CertificateMasterSchema),
        defaultValues: {},
    });
    const [loading, setLoading] = useState(false);
    const [showModalCertificateType, setShowModalCertificateType] = useState(false);
    const [certificateTypeInput, setCertificateTypeInput] = useState('');
    const [certificateTypeError, setCertificateTypeError] = useState('');
    const [selectCertificateTypeOption, setSelectedCertificateTypeOption] = useState([]);
    const [certificateTypeOptions, setCertificateTypeOptions] = useState([]);
    const navigate = useNavigate();
    const handleBackClick = ()=>{
        navigate(`/Certificate-Master`) 
    }
    const handleButtonClick = (e) => {
        e.preventDefault();
        handleSubmit(handleFormdataSubmit)();
    };
     useEffect(() => {
        const fetchCertificateType = async () => {
          setLoading(true);  
          try {
              const response = await getCertificateTypeMasterList({});
              const certificateTypes = response.data;

              const options = certificateTypes.map(certType => ({
                value: certType._id,  
                label: certType.certificateType,  
              }));

              setCertificateTypeOptions(options);   

          } catch (error) {
            console.error('Error fetching vulnerabilities:', error);
          } finally {
            setLoading(false); 
          }
        };
    
        fetchCertificateType();
      }, []);
    const handleFormdataSubmit = async (data) => {
        const payload = {
            certificateName:data.certificateName,
            certificateType:data.certificateType,
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
    const handleCloseModal = () => setShowModalCertificateType(false);

    const handleCertificateTypeSubmit = async () => {
        const value = (certificateTypeInput || '').trim();
        if (!value) {
            setCertificateTypeError('Certificate Type is required');
            return;
        }
        setCertificateTypeError('');
        setLoading(true);
        try{
            const payload = { certificateType: value };
            const response = await postCertificateTypeMaster(payload);
            if (response?.data?.statusCode === 200) {
                toast.success('Certificate Type added successfully!', {
                    className: 'custom-toast custom-toast-success',
                });
                setCertificateTypeInput('');
                setShowModalCertificateType(false);
            } else {
                toast.error(response?.data?.message || 'Failed to add', {
                    className: 'custom-toast custom-toast-error',
                });
            }
        }catch(error){
            toast.error(error?.response?.data?.message || error.message || 'Server error', {
                className: 'custom-toast custom-toast-error',
            });
        } finally {
            setLoading(false);
        }
    };
    const handleCertificateTypeChange = (selectedOption) => {
        setSelectedCertificateTypeOption(selectedOption);
        setValue('certificateType', selectedOption ? selectedOption.value : '');
    }
    return(
        <div>
            <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <PopupForm show={showModalCertificateType} handleClose={handleCloseModal} title="Certificate Type" showFooter={true} handleAdd={handleCertificateTypeSubmit} addButtonText={"Submit"}  dialogClassName="modal-xl" >
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-lg-12">
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-5 fw-bolder">Certificate Type<span className="text-danger">*</span></Form.Label>
                                <input
                                    type="text"
                                    className={`form-control ${certificateTypeError ? 'is-invalid' : ''}`}
                                    placeholder="Enter Certificate Type"
                                    value={certificateTypeInput}
                                    onChange={(e) => { setCertificateTypeInput(e.target.value); setCertificateTypeError(''); }}
                                />
                                {certificateTypeError && <div className="invalid-feedback d-block">{certificateTypeError}</div>}
                            </Form.Group>
                        </div>
                    </div>
                </div>
            </PopupForm>
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
                            <div className="col-sm-6 col-md-6 col-lg-6">
                                <Form.Group className="mb-3">
                                    <div className="row">
                                        <div className="col-sm col-md col-lg">
                                           <Form.Label className="fs-5 fw-bolder">Certificate Type <span className="text-danger">*</span></Form.Label>
                                        </div>
                                        <div className="col-sm col-md col-lg text-end">
                                            <Button variant="contained" size="small" onClick={() => setShowModalCertificateType(true)}>
                                                Add Certificate Type
                                            </Button>
                                        </div>
                                        <Controller
                                            name="certificateType"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={certificateTypeOptions}
                                                    value={selectCertificateTypeOption}
                                                    isClearable
                                                    placeholder="Select Certificate Type"
                                                    onChange={handleCertificateTypeChange}
                                                />
                                            )}
                                        />
                                        {errors.certificateType && <p className="text-danger">{errors.certificateType.message}</p>}

                                    </div>
                                </Form.Group>
                            </div>
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