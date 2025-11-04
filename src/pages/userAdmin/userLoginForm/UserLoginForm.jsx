import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { IoIosSave } from "react-icons/io";
import Form from 'react-bootstrap/Form';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import Select from 'react-select';
import {postRegister} from "../../../api/loginApi/loginApi"
import {empList} from '../../../api/syncEmp/syncEmp'
import { yupResolver } from '@hookform/resolvers/yup';
import userRegistrationValidation from '../../../validation/userRegistrationValidation';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2'

const UserLoginForm = () => {

    const { handleSubmit, control, formState: { errors }} = useForm({
        resolver: yupResolver(userRegistrationValidation)
    });

    const [loading, setLoading] = useState(false);
    const [option, setOption] = useState([])
    const [selectedEmp, setSelectedEmp] = useState(null);
    const MySwal = withReactContent(Swal);
    const navigate = useNavigate(); 

    const roles = [
        { value: 'Admin', label: 'Admin' },
        { value: 'SubAdmin', label: 'Sub Admin' },
        { value: 'User', label: 'User' }
    ];

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

    const handleFormSubmit = async(data) => {
        const payload = {
            empId:selectedEmp._id,
            role: data.role.value
        };
        console.log(payload)
        setLoading(true);
        try{
            const response = await postRegister(payload)
            if (response.data.statusCode === 200){
                MySwal.fire({
                    icon: 'success',
                    title: 'Login Has Been Created',
                    text: response.message,
                    timer: 1500,
                    showConfirmButton: false,
                });
            } 
        }catch(error){
            if (error.response?.data?.statusCode === 409) {
                const msg = error?.response?.data?.message || 'Something went wrong!';
                MySwal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: msg,
                });
            }else if (error.response?.data?.statusCode === 400) {
                const msg = error?.response?.data?.message || 'Something went wrong!';
                MySwal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: msg,
                });
            }
        }
        setLoading(false);
    };

    const handleButtonClick = (e) => {
        e.preventDefault();
        handleSubmit(handleFormSubmit)();
    };

   const handleFilter = (option, inputValue) => {
        const { empid = "", ename = "" } = option.data.raw || {};
        const search = inputValue.toLowerCase();
        return empid.toLowerCase().includes(search) || ename.toLowerCase().includes(search);
    };

    const handleChange = (selectedOption, fieldOnChange) => {
        setSelectedEmp(selectedOption?.raw || null);
        fieldOnChange(selectedOption);
    }

    const handleBackClick = ()=>{
        navigate(`/register-list`) 
    }


    return(
        <div>
            <div className='container-fluid'>
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
                                         User Details
                                       </Typography>
                                   </Box>
                </div>
                <hr></hr>
                <div className="container-fluid">
                    <Form onSubmit={handleSubmit}>
                        <div className='row'>
                            <div className='col-sm col-md col-lg'>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fs-5 fw-bolder">STPI Employee ID<span className="text-danger">*</span></Form.Label>
                                    <Controller
                                        name="empId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                options={option}
                                                isLoading={loading}
                                                value={field.value}
                                                placeholder="Search By EmpId or Name"
                                                filterOption={handleFilter}
                                                onChange={(selected) => handleChange(selected, field.onChange)}
                                                isClearable
                                            />
                                        )}
                                    />
                                    {/* <Form.Control type="email" {...register('username')} placeholder="Enter username" /> */}
                                    {errors.empId && <p className="text-danger">{errors.empId.message}</p>}
                                </Form.Group>
                            </div>
                        </div>
                        {selectedEmp && (
                            <div className='row pt-3'>
                                <div className='col-sm-6 col-md-6 col-lg-6'>
                                     <Form.Group className='pb-3'>
                                        <Form.Label className="fs-5 fw-bolder">Directorates</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedEmp?.dir || ""}
                                            readOnly   
                                            disabled 
                                            style={{ cursor: "not-allowed" }}
                                        />
                                    </Form.Group>
                                    <Form.Group className='pb-3'>
                                        <Form.Label className="fs-5 fw-bolder">Employee Designation</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedEmp?.edesg || ""}
                                            readOnly   
                                            disabled
                                            style={{ cursor: "not-allowed" }} 
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label className="fs-5 fw-bolder">Email</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedEmp?.email || ""}
                                            readOnly   
                                            disabled
                                            style={{ cursor: "not-allowed" }} 
                                        />
                                    </Form.Group>
                                </div>
                                <div className='col-sm-6 col-md-6 col-lg-6'>
                                    <Form.Group >
                                        <Form.Label className="fs-5 fw-bolder">Centre</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedEmp?.centre || ""}
                                            readOnly   
                                            disabled
                                            style={{ cursor: "not-allowed" }} 
                                        />
                                    </Form.Group>
                                    <Form.Group className='py-3'>
                                        <Form.Label className="fs-5 fw-bolder">Employee Type</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedEmp?.etpe || ""}
                                            readOnly   
                                            disabled
                                            style={{ cursor: "not-allowed" }} 
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label className="fs-5 fw-bolder">Role<span className="text-danger">*</span></Form.Label>
                                        <Controller
                                            name="role"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={roles}
                                                    placeholder="Select role"
                                                    isClearable
                                                />
                                            )}
                                        />
                                        {errors.role && <p className="text-danger">{errors.role.message}</p>}
                                    </Form.Group>
                                </div>
                            </div>   
                        )}
                    </Form>
                    {selectedEmp && (
                        <div className='pt-3'>
                           <Box
                                                      sx={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                        mt: 4, 
                                                      }}
                                                    >
                                                      
                                      
                                                      {/* SAVE Button on the right */}
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
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserLoginForm;