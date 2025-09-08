import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {getScopeOfWorkId,editScopeOfWork} from '../../../api/projectTypeListApi/projectTypeListApi'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import Marquee from '../../../components/Marquee/Marquee';
import {getTypeOfWork} from '../../../api/typeOfWorkAPi/typeOfWorkApi'
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import Select from "react-select";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { Form } from "react-bootstrap";
import { useParams } from "react-router-dom";

const ScopeOfWorkEdit = ({ID}) =>{
    const { register, handleSubmit, setValue, reset, getValues, control,formState: { errors }, } = useForm();
    const [typeOfWorkOption,setTypeOfWorkOption] = useState([]);
    const [selectedTypeOfWorkOptions, setSelectedTypeOfWorkOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const Scopeofwork = ID || id;
    const navigate = useNavigate();
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await getScopeOfWorkId(Scopeofwork);
                const fetchedData = response?.data?.data;
                if(fetchedData){
                    reset({
                        ...fetchedData
                    })
                    
                    const selectedTypeOfWork = Array.isArray(fetchedData.category) 
                    ? fetchedData.category
                    : [fetchedData.category]

                    const matchedTypeOfWork =  selectedTypeOfWork.map(type=>({
                        label:type
                    }));
                
                    setSelectedTypeOfWorkOptions(matchedTypeOfWork || null);
                }
            } catch (error) {
                console.error("Error fetching project details:", error);
            }finally {
                setLoading(false);
            }
        };
        if (Scopeofwork) fetchProject();
    }, [Scopeofwork]);

    useEffect(()=>{
        const fetchTypeOfWork = async() =>{
            try{
            const response = await getTypeOfWork({});
            if(response.data && Array.isArray(response.data.data)){
                const option = response.data.data.map((TypeOfWork)=>({
                value:TypeOfWork._id,
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

    const handleBackClick = ()=>{
        navigate(`/Scope-Of-Work-Master`) 
    }

    const onSubmit = async (formData) => {
        setLoading(true);
        try{
            const formDataToSubmit = new FormData();
            const ProjectTypeName = formData.ProjectTypeName || getValues("ProjectTypeName");
            const category = formData.category || getValues('category')

            formDataToSubmit.append("ProjectTypeName",ProjectTypeName)
            formDataToSubmit.append("category",category)

            const response = await editScopeOfWork(Scopeofwork,formDataToSubmit)
            console.log(response?.data?.statusCode )
            if(response?.data?.statusCode === 200){
                toast.success(response?.data?.message, {
                    className: 'custom-toast custom-toast-success',
                });
            } else if(response?.data?.statusCode === 401){
                toast.error(response?.data?.message, {
                   className: 'custom-toast custom-toast-error',
                });
            }
        } catch(error){
            toast.error('Failed to submit the form.',error, {
                className: 'custom-toast custom-toast-error',
            });
        }
        setLoading(false)
    }

    const handleTypeOfWorkChange = (selected) =>{
        setSelectedTypeOfWorkOptions(selected)
        const selectedString = selected && selected.label ? String(selected.label) : '';
        setValue('category',selectedString)
    }

    return(
        <div className='container-fluid'>
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
                        Scope Of Work
                    </Typography>
                </Box>
            </div>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
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
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row pb-4">
                    <div className="col-sm-6 col-md-6 vol-lg-6">
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-4">Type Of Work<span className="text-danger">*</span></Form.Label>
                            <Select
                                name="category"
                                options={typeOfWorkOption}
                                value={selectedTypeOfWorkOptions} 
                                onChange={handleTypeOfWorkChange}
                                isDisabled={loading} 
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder pt-4">Scope Of Work<span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                {...register("ProjectTypeName", { required: "Scope of work is required" })}
                                isInvalid={!!errors.ProjectTypeName}
                            />
                            {errors.ProjectTypeName && (
                                <div className="text-danger">{errors.ProjectTypeName.message}</div>
                            )}
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
                            color="success"
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading}
                            startIcon={!loading && <EditIcon  />}
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
                </div>
            </form>
        </div>
    )
}

export default ScopeOfWorkEdit;