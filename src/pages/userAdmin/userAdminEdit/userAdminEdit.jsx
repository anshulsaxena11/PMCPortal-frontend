import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom"
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { getUserDetailsById } from '../../../api/loginApi/loginApi'
import { Form} from "react-bootstrap";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { Controller } from "react-hook-form";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import CircularProgress from '@mui/material/CircularProgress';
import { TiArrowBack } from "react-icons/ti";
import EditIcon from '@mui/icons-material/Edit';
import {updateUserRegistration} from '../../../api/loginApi/loginApi'
import Swal from 'sweetalert2';

const UserAdminEdit = ({ ID }) => {
    const { id } = useParams();
    const userId = ID || id;
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const { register, handleSubmit, setValue, formState: { errors },control,trigger } = useForm();
    const [loading, setLoading] = useState(false);
    const roles = [
        { value: 'Admin', label: 'Admin' },
        { value: 'SubAdmin', label: 'Sub Admin' },
        { value: 'User', label: 'User' }
    ];

    useEffect(() => {
        const fetchuserDetails = async () => {
            try {
            const data = await getUserDetailsById(userId);
            const item = data?.data;

            if (item) {
                Object.entries(item).forEach(([key, value]) => {
                    setValue(key, value);  
                });

                const matchedRole = roles.find(role => role.value === item.role);
                if (matchedRole) {
                    setValue("role", matchedRole.value); 
                }
            }

            setUserDetails(item);
            } catch (error) {
            console.error("Error fetching project details:", error);
            }
        };
        fetchuserDetails();
        }, []);

        const handleBackClick = ()=>{
            navigate(`/register-list`) 
        }

        const onSubmit = async (formData) => {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'Do You Want To change the Role ?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, update it!',
                cancelButtonText: 'Cancel',
                customClass: {
                    popup: 'rounded-alert',
                },
            });

            if (!result.isConfirmed) return;

            try {
                const payload = {
                role: formData.role,
                };

                const response = await updateUserRegistration(userId, payload);

                if (response.statusCode === 401) {
                Swal.fire('Unauthorized', `${response.message}`, 'error');
                } else if (response.statusCode === 200) {
                Swal.fire('Success!', `${response.message}`, 'success');
                } else {
                Swal.fire('Failed', 'Unexpected response from server.', 'warning');
                }

                console.log(response); 
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('Error', `Request failed: ${error.message}`, 'error');
            }
        };

        const handleRole = (selected) => {
            setValue("role", selected?.value); 
            trigger("role"); 
        };

    return(
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
                <hr className="mt-3" style={{  width: '100%',height: '100%', backgroundColor: '#000', opacity: 1 }}></hr>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row ">
                        <div className="col-sm-6 col-md-6 col-lg-6 pt-4" >
                            <Form.Group className="pt-4">
                                <Form.Label className="fs-5 fw-bolder">Employee Id<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" {...register("empId")} readOnly disabled/>
                            </Form.Group>
                            <Form.Group className="pt-4">
                                <Form.Label className="fs-5 fw-bolder">Directorate<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" {...register("dir")} readOnly disabled/>
                            </Form.Group>
                            <Form.Group className="pt-4">
                                <Form.Label className="fs-5 fw-bolder">Employee Designation<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" {...register("edesg")} readOnly disabled/>
                            </Form.Group>
                            <Form.Group className="pt-4">
                                <Form.Label className="fs-5 fw-bolder">E-Mail<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" {...register("email")} readOnly disabled/>
                            </Form.Group>
                        </div>
                        <div className="col-sm-6 col-md-6 col-lg-6 pt-4" >
                            <Form.Group className="pt-4">
                                <Form.Label className="fs-5 fw-bolder">Employee Name<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" {...register("ename")} readOnly disabled/>
                            </Form.Group>
                            <Form.Group className="pt-4">
                                <Form.Label className="fs-5 fw-bolder">Centre<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" {...register("centre")} readOnly disabled/>
                            </Form.Group>
                            <Form.Group className="pt-4">
                                <Form.Label className="fs-5 fw-bolder">Employee Type<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" {...register("etpe")} readOnly disabled/>
                            </Form.Group >
                            <Form.Group className="pt-4">
                                <Form.Label className="fs-5 fw-bolder">Role<span className="text-danger">*</span></Form.Label>
                               <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={roles}
                                        value={roles.find(option => option.value === field.value)}
                                        onChange={(selectedOption) => {handleRole(selectedOption); }}
                                        placeholder="Select Role"
                                    />
                                )}
                                />
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
        </div>
    )

};

export default UserAdminEdit;