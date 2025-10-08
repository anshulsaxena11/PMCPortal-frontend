import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { ToastContainer, toast } from 'react-toastify';
import DomainMasterSchema from '../../../validation/domainMaster'
import Form from "react-bootstrap/Form";
import {getType, postDomainSector } from "../../../api/clientSectorApi/clientSectorApi"
import { IoIosSave } from "react-icons/io";
import CircularProgress from '@mui/material/CircularProgress';
import Select from "react-select";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const ClentSectorMasterForm = () =>{
    const { control, handleSubmit, formState: { errors }, setValue,reset } = useForm({
        resolver: yupResolver(DomainMasterSchema),
        defaultValues: {},
      });
    const [type,setType] = useState([])
    const [selectType,setSelectedType] = useState([])
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();
    const handleBackClick = ()=>{
        navigate(`/Domain-Sector-Master`) 
    }

    // useEffect(()=>{
    //     const fetchType = async() =>{
    //       try{
    //         const response = await getType();
    //         if(response.data && Array.isArray(response.data.data)){
    //           const option = response.data.data.map((Type)=>({
    //             value:Type,
    //             label:Type
    //           }))
    //           setType(option)
    //         }else{
    //           console.log("Expect an Array")
    //         }
    //       }catch(error){
    //         console.error("Error fetching Type Of Work:");
    //       }
    //     }
    //     fetchType()
    // },[])

    // const handleType =(selected)=>{
    //     setSelectedType(selected)
    //     const typevalue = selected?.value
    //     setValue("type",typevalue)
    // }
    
    const handleButtonClick = (e) => {
        e.preventDefault();
        handleSubmit(handleFormdataSubmit)();
    };

    const handleFormdataSubmit = async (data) => {
        const payload = {
            // type:data.type,
            domain:data.domain,
        }
        setLoading(true);
        try{
            const response = await postDomainSector(payload)
            if (response?.data?.statusCode === 200) {
                reset({
                    // type:'',
                    domain:''
                })
                // setValue('type',"")
                // setSelectedType([])
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
                        Domain
                    </Typography>
                </Box>
            </div>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}/>
            <div className="container-fluid">
                <div className="row">
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            {/* <div className="col-sm-6 col-lg-6 col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="fs-5 fw-bolder">Type<span className="text-danger">*</span></Form.Label>
                                    <Controller
                                        name="type"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                options={type} 
                                                value={selectType}
                                                isDisabled={loading}
                                                placeholder="Select Type"
                                                onChange={handleType}
                                            />
                                        )}
                                    />
                                    {errors.type && <p className="text-danger">{errors.type.message}</p>}
                                </Form.Group>
                            </div> */}
                            <div className="col-sm-6 col-lg-6 col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label className="fs-5 fw-bolder">Domain<span className="text-danger">*</span></Form.Label>
                                        <Controller
                                        name="domain"
                                        control={control}
                                        render={({ field }) => <input {...field} className="form-control" placeholder="Enter Domain"/>}
                                    />
                                    {errors.domain && <p className="text-danger">{errors.domain.message}</p>}
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

export default ClentSectorMasterForm