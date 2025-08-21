import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { useNavigate } from 'react-router-dom';
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "react-bootstrap/Form";
import { useForm, Controller } from "react-hook-form";
import typeOfWorkMasterValidation from "../../../validation/toolsAndHardwareMasterValidation"
import { TiArrowBack } from "react-icons/ti";
import { IoIosSave } from "react-icons/io";
import CircularProgress from '@mui/material/CircularProgress';

const TypesOfWorkMasterForm = () =>{
    const { control, handleSubmit, formState: { errors }, setValue,reset,trigger } = useForm({resolver: yupResolver(typeOfWorkMasterValidation),defaultValues: {},});
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); 
    const handleBackClick = ()=>{
        navigate(`/type-of-work-master-list`) 
    }
    const handleButtonClick = (e) => {
        e.preventDefault();
        handleSubmit(handleFormdataSubmit)();
    };
      const handleFormdataSubmit = async (data) => {
        const payload = {
         typeOfWork:data.typeOfWork
        };
     
        setLoading(true);
        try{
       
         
           
         
      
        
        }catch(error){
         
        }
        setLoading(false);
    };
    return(
        <div className="container-fluid">
            <h1>On Development</h1>
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
                    Types Of Work
                </Typography>
            </Box>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}/>
            <div className="container-fluid">
                <Form onSubmit={handleSubmit}>
                    <div className='row'>
                        <div className='col-sm-4 col-md-4 col-lg-4'>
                            <Form.Label className="fs-5 fw-bolder">Type Of Work<span className="text-danger">*</span></Form.Label>
                            <Controller
                                name="typeOfWork"
                                control={control}
                                render={({ field }) => <input {...field} className="form-control" placeholder="Enter Type Of Work"/>}
                            />
                            {errors.typeOfWork && <p className="text-danger">{errors.typeOfWork.message}</p>}
                        </div>
                        <div className="py-3">
                            <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mt: 4, 
                            }}
                            >
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleBackClick}
                                    startIcon={<TiArrowBack />}
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
                                    BACK
                                </Button>
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
                    </div>
                </Form>
            </div>
        </div>
    )

}

export default TypesOfWorkMasterForm;