import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom"
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { getUserDetailsById } from '../../../api/loginApi/loginApi'
import { Form} from "react-bootstrap";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { Controller } from "react-hook-form";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

const UserAdminEdit = ({ ID }) => {
    const { id } = useParams();
    const userId = ID || id;
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const { register, handleSubmit, setValue, formState: { errors },control } = useForm();
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
                    setValue("role", matchedRole.value); // only value is stored
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
            try{
                const payload = {
                    id: userId,
                    role: formData.role
                };
                console.log(payload,"data")
            }catch(error){

            }

        }

        const handleRole =(selected)=>{
            console.log(selected)
        }

    return(
        <div className='container-fluid'>
            <h1 className='text-danger'>Table under working but you can create user</h1>
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
                <hr className="my-3" style={{  width: '100%',height: '100%', backgroundColor: '#000', opacity: 1 }}></hr>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row pt-4">
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
                                    onChange={(selectedOption) => {
                                        if (userDetails?.role !== 'Admin') {
                                         handleRole(selectedOption);  
                                        }
                                    }}
                                    isDisabled={userDetails?.role === 'Admin'} // disable if role is Admin
                                    placeholder="Select Role"
                                    />
                                )}
                                />
                            </Form.Group>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )

};

export default UserAdminEdit;