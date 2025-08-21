import React,{ useState, useEffect }  from 'react'
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {getTypesOfWorkId,editTypeOfWork} from '../../../api/typeOfWorkAPi/typeOfWorkApi'
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'
import { Form } from "react-bootstrap";
import { TiArrowBack } from "react-icons/ti";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';

const TypesOfWorkMasterEdit = ({ID})=>{
    const { register, handleSubmit, setValue, reset, getValues, control,formState: { errors }, } = useForm();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const typeofwork = ID || id;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await getTypesOfWorkId(typeofwork);
                const fetchedData = response?.data?.data;
                 reset({
                        ...fetchedData,
                    });
            } catch (error) {
                console.error("Error fetching project details:", error);
            }finally {
                setLoading(false);
            }
        };
            if (typeofwork) fetchProject();
    }, [typeofwork]);

    const handleBackClick = ()=>{
        navigate(`/type-of-work-master-list`) 
    }
    const onSubmit = async (formData) => {
        setLoading(true);
        try{
            const formDataToSubmit = new FormData();
            const typeOfWork = formData.typeOfWork || getValues("typeOfWork")

            formDataToSubmit.append("typeOfWork",typeOfWork)
            console.log(formDataToSubmit)

            const response = await editTypeOfWork(typeofwork, formDataToSubmit);
            if(response?.data?.statusCode === 200 ){
                 toast.success(response?.data?.message, {
                        className: 'custom-toast custom-toast-success',
                    });
            } else if(response?.data?.statusCode === 401 || response?.data?.statusCode === 404 ){
                toast.error(response?.data?.message, {
                    className: "custom-toast custom-toast-error",
                });
            }

        } catch (error){
            

        } finally{

            setLoading(false)
        }
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
                    Types of work
                    </Typography>
                </Box>
            </div>
        <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
        <form onSubmit={handleSubmit(onSubmit)} className="edit-project-form">
            <div className="row pt-4" >
                <div className="col-sm-4 col-md-4 col-lg-4">
                    <Form.Group>
                        <Form.Label className="fs-5 fw-bolder">Type Of Work<span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                {...register("typeOfWork", { required: "Type Of Work is required" })}
                                isInvalid={!!errors.typeOfWork}
                            />
                            {errors.workOrderNo && (
                                <div className="text-danger">{errors.typeOfWork.message}</div>
                            )}
                    </Form.Group>
                </div>
            </div>
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
        </form>
     
    </div>
 )
}

export default TypesOfWorkMasterEdit;