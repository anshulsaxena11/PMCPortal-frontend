import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Marquee from '../../../components/Marquee/Marquee';
import { yupResolver } from "@hookform/resolvers/yup";
import {getTypeOfWork} from '../../../api/typeOfWorkAPi/typeOfWorkApi'
import {postProjectTypeList} from "../../../api/projectTypeListApi/projectTypeListApi"
import { useForm, Controller } from "react-hook-form";
import scopeOfWorkSchema from '../../../validation/ScopeOfWorkValidation'
import Form from "react-bootstrap/Form";
import { IoIosSave } from "react-icons/io";
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import Select from "react-select";

const ScopeOfWorkForm = () => {
    const [typeOfWorkOption,setTypeOfWorkOption] = useState([]);
    const [selectedTypeOfWorkOptions, setSelectedTypeOfWorkOptions] = useState([]);
    const [loading, setLoading] = useState(false); 
    const { control, handleSubmit, formState: { errors }, setValue,reset,trigger } = useForm({
        resolver: yupResolver(scopeOfWorkSchema)});
    const navigate = useNavigate();
    const handleBackClick = ()=>{
        navigate(`/Scope-Of-Work-Master`) 
    }

    useEffect(()=>{
    const fetchTypeOfWork = async() =>{
        try{
        const response = await getTypeOfWork({});
        if(response.data && Array.isArray(response.data.data)){
            const option = response.data.data.map((TypeOfWork)=>({
            value:TypeOfWork.typeOfWork,
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

    const handleTypeOfWorkChange = (selected) =>{
        const selectedString = selected?.label || '';
        setSelectedTypeOfWorkOptions(selected)
        setValue('category',selectedString)
        trigger('category');
    }

    const handleButtonClick = (e) => {
        e.preventDefault();
        handleSubmit(handleFormdataSubmit)();
    };

    
  const handleFormdataSubmit = async (data) => {
    try{
        const payload = {
            category:data?.category,
            ProjectTypeName:data?.ProjectTypeName
        }
       const response = await postProjectTypeList(payload)
       const datas = response
       if(datas?.statusCode === 200){
        reset({
            category:null,
            ProjectTypeName:''
        })
        setValue('ProjectTypeName',"")
        setSelectedTypeOfWorkOptions("")
        toast.success(datas?.message, {
            className: 'custom-toast custom-toast-success',
        });
       }
       if(datas?.statusCode === 401){
            toast.error(datas?.message, {
                className: "custom-toast custom-toast-error",
            });
       }
    }catch(error){
        if(error?.statusCode === 400){
            toast.error(error?.message, {
                className: "custom-toast custom-toast-error",
            });
       }
    }
  }
    return(
        <div className='container-fluid'>
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
                     Scope Of Work
                    </Typography>
                </Box>
                <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}/>
            </div>
            <div className='row'>
                <Marquee
                    text=" ‼️If Type of Work is not Found in Dropdown, Please add from Type Of Work Master ‼️"
                    speed={10}
                    direction="left"
                    backgroundColor="#AAC9D5"
                    textColor="#rgba(0,0,0,0.15)"
                    fontSize="1.2rem"
                    stopInCenter={true}
                />
            </div>
            <Form onSubmit={handleSubmit}>
                <div className='row my-4'>
                    <div className='col-sm-6 col-md-6 col-lg-6'>
                        <Form.Group className="mb-3">
                            <Form.Label className="fs-5 fw-bolder">Type Of Work<span className="text-danger">*</span></Form.Label>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={typeOfWorkOption} 
                                        value={selectedTypeOfWorkOptions}
                                        isDisabled={loading}
                                        placeholder="Select Type Of Work"
                                        onChange={handleTypeOfWorkChange}
                                    />
                                    )}
                                />
                            {errors.category && <p className="text-danger">{errors.category.message}</p>}
                        </Form.Group>
                    </div>
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="mb-3">
                            <Form.Label className="fs-5 fw-bolder">Scope Of Work<span className="text-danger">*</span></Form.Label>
                            <Controller
                                name="ProjectTypeName"
                                control={control}
                                render={({ field }) => <input {...field} className="form-control" placeholder="Enter Scope Of Work"/>}
                            />
                            {errors.ProjectTypeName && <p className="text-danger">{errors.ProjectTypeName.message}</p>}
                        </Form.Group>
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
    )
}

export default ScopeOfWorkForm;