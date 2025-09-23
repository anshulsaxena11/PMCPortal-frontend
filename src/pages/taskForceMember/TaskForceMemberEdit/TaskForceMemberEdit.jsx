import React, { useState, useRef,useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useForm } from "react-hook-form";
import {getTaskForceDetailsById, updateTaskForceMember} from '../../../api/taskForceMemberApi/taskForceMemberApi'
import { ToastContainer, toast } from 'react-toastify';
import { Form,} from "react-bootstrap";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit' 
import {empList} from '../../../api/syncEmp/syncEmp'
import Select from 'react-select';

const TaskForceMemberEdit = () =>{
    const { register, handleSubmit, setValue, reset, getValues, control, formState: { errors }, } = useForm();
    const location = useLocation();
    const navigate = useNavigate();
    const [option, setOption] = useState([])
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [stateCordinator, setStateCordinator]= useState(null);
    const [loading, setLoading] = useState(true);
    const [TaskForce, setTaskForce] = useState({});
    const id = location.state?.id;

    const fetchTaskForceMember = async () => {
        try {
            const response = await getTaskForceDetailsById(id);
            const fetchData = response?.data;
            console.log(fetchData)
           const matchedTaskForceMember = option.find(
                (opt) => opt.raw?.ename === fetchData.taskForceMember
            );
            const taskForceMemberId = matchedTaskForceMember ? matchedTaskForceMember.value : "";
              const matchedStateCoordinator = option.find(
                (opt) => opt.raw?.ename === fetchData.stateCordinator
            );
            const stateCoordinatorId = matchedStateCoordinator ? matchedStateCoordinator.value : "";
            if (fetchData){
                reset({
                    ...fetchData,
                    taskForceMember:taskForceMemberId,
                    stateCordinator:stateCoordinatorId
                })
                setSelectedEmp(matchedTaskForceMember || null);
                setStateCordinator(matchedStateCoordinator || null);
            }
        } catch (error) {
            console.error('Error fetching project details:',);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchEmpList = async() =>{
            setLoading(true);
            try{
                const response = await empList()
                const fetchList = response?.data
                if(fetchList && Array.isArray(fetchList) ){
                    const option = fetchList.map((emp)=>({
                            label: `${emp.empid} - ${emp.ename}`,
                            value:emp._id,
                            raw:emp
                        }))
                    setOption(option)
                }
                }catch(error){
                    console.error('Failed to fetch employee list:');
                }
                    setLoading(false);
            }
        fetchEmpList()
    }, []); 

    useEffect(() => {
        fetchTaskForceMember();
    }, [id,option]);

    const handleBackClick = ()=>{
       navigate(`/Task-Force-member`); 
    }
    const handleFilter = (option, inputValue) => {
        const { empid = "", ename = "" } = option.data.raw || {};
        const search = inputValue.toLowerCase();
        return empid.toLowerCase().includes(search) || ename.toLowerCase().includes(search);
    };

    const handleFilterStateCordinator = (option, inputValue) => {
        const { empid = "", ename = "" } = option.data.raw || {};
        const search = inputValue.toLowerCase();
        return empid.toLowerCase().includes(search) || ename.toLowerCase().includes(search);
    };

    const handleEmp=(selected)=>{
        setSelectedEmp(selected);
        setValue("taskForceMember", selected?.raw?._id || "");
    }

    const handleStateCoordinator=(selected)=>{
        setStateCordinator(selected);
        setValue("stateCordinator", selected?.raw?._id || "");
    }

    const onSubmit = async (formData) => {
        setLoading(true);
        try{
            const formDataToSubmit = new FormData();
            const stateCordinator = formData.stateCordinator || getValues("stateCordinator");
            const taskForceMember = formData.taskForceMember || getValues("taskForceMember");

            formDataToSubmit.append("taskForceMember", taskForceMember);
            formDataToSubmit.append("stateCordinator", stateCordinator);

        
            const response = await updateTaskForceMember(id,formDataToSubmit)
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
                        Task Force Member
                    </Typography>
                </Box>
            </div>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="row pt-4">
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="pt-3">
                            <Form.Label className="fs-5 fw-bolder">State Name<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text" 
                                    {...register("stateName")}
                                    readOnly 
                                    disabled
                                />
                        </Form.Group>
                        <Form.Group className="pt-3">
                            <Form.Label className="fs-5 fw-bolder">State Coordinator<span className="text-danger">*</span></Form.Label>
                            <Select
                                name="stateCordinator"
                                options={option}
                                value={stateCordinator}
                                isLoading={loading} 
                                onChange={handleStateCoordinator}
                                isDisabled={loading} 
                                filterOption={handleFilterStateCordinator}
                            />
                        </Form.Group>
                    </div>
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group className="pt-3">
                            <Form.Label className="fs-5 fw-bolder">Task Force Member<span className="text-danger">*</span></Form.Label>
                             <Select
                                name="taskForceMember"
                                options={option}
                                value={selectedEmp}
                                isLoading={loading} 
                                onChange={handleEmp}
                                isDisabled={loading} 
                                filterOption={handleFilter}
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

export default TaskForceMemberEdit