import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import {getClientSectorById, getType, updateType} from '../../../api/clientSectorApi/clientSectorApi'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form,} from "react-bootstrap";
import { useForm } from "react-hook-form";
import Select from 'react-select';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit' 

const ClientSectorMasterEdit = () =>{
    const { register, handleSubmit, setValue, reset, getValues, control, formState: { errors }, } = useForm();
    const [loading, setLoading] = useState(true);
    const [selectedTypeOption, setSelectedTypeOption] = useState([])
    const navigate = useNavigate();
    const [type,setType] = useState([])
    const location = useLocation();
    const id = location.state?.id;
    const handleBackClick = ()=>{
        navigate(`/Client-Sector-Master`) 
    }
    useEffect(()=>{
        const fetchType = async() =>{
            try{
            const response = await getType();
            if(response.data && Array.isArray(response.data.data)){
                const option = response.data.data.map((Type)=>({
                    value:Type,
                    label:Type
                }))
                setType(option)
            }else{
                console.log("Expect an Array")
            }
            }catch(error){
            console.error("Error fetching Type Of Work:");
            }
        }
        fetchType()
    },[])
    const fetchClientSector = async () => {
        try {
        const response = await getClientSectorById(id);
        const fetchdata=response?.data
        const matchedType = type.find(opt => opt.value === fetchdata.type);
        const typeId = matchedType ? matchedType.value : "";
            if(fetchdata){
                reset({
                    ...fetchdata,
                    type:typeId
                })
                setSelectedTypeOption(matchedType)
            }
        } catch (error) {
            console.error('Error fetching project details:',);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchClientSector();
    }, [id,type]);

    const onSubmit = async (formData) => {
        setLoading(true);
        try{
            const formDataToSubmit = new FormData();
            const type = formData.type || getValues("type");
            const clientType = formData.clientType || getValues("clientType");

            formDataToSubmit.append("type", type);
            formDataToSubmit.append("clientType", clientType);

            const response = await updateType(id,formDataToSubmit)
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
    const handleType = (selected) =>{
        setSelectedTypeOption(selected)
        const selectedString = selected && selected.value ? String(selected.value) : '';
        setValue('type',selectedString)
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
                        Client Sector
                    </Typography> 
                </Box>
            </div>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="row pt-4">
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Type<span className="text-danger">*</span></Form.Label>
                             <Select
                                name="type"
                                options={type}
                                value={selectedTypeOption}
                                isLoading={loading} 
                                onChange={handleType}
                                isDisabled={loading} 
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="pt-4">
                            <Form.Label className="fs-5 fw-bolder">Client Sector<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="tesxt" 
                                    {...register("clientType", {required: "Client Sector is required",})} 
                                    isInvalid={!!errors.clientType}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.clientType?.message}
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

export default ClientSectorMasterEdit