import React, { useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { Button, Spinner, InputGroup  } from 'react-bootstrap';
import { IoIosSave } from "react-icons/io";
import Form from 'react-bootstrap/Form';
import { TiArrowBack } from "react-icons/ti";
import Select from 'react-select';
import {postRegister} from "../../../api/loginApi/loginApi"
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { yupResolver } from '@hookform/resolvers/yup';
import userRegistrationValidation from '../../../validation/userRegistrationValidation';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2'

const UserLoginForm = () => {

    const {register, handleSubmit, control,reset, formState: { errors }} = useForm({
        resolver: yupResolver(userRegistrationValidation)
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const MySwal = withReactContent(Swal); 

    const roles = [
        { value: 'Admin', label: 'Admin' },
        { value: 'SubAdmin', label: 'Sub Admin' },
        { value: 'User', label: 'User' }
    ];

    const handleFormSubmit = async(data) => {
        const payload = {
            username: data.username,
            password: data.password,
            role: data.role.value
        };
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

    const handleBackClick = ()=>{
        // navigate(`/report`) 
    }


    return(
        <div>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-10 col-md-10 col-lg-10'>
                        <h1>User Registration</h1>
                    </div>
                    <div className='col-sm-2 col-md-2 ol-lg-2'>
                        {/* <Button variant="danger" className='btn btn-success ' onClick={handleBackClick}>
                            <TiArrowBack />BACK
                        </Button> */}
                    </div>
                </div>
                <hr></hr>
                <div className="container-fluid">
                    <Form onSubmit={handleSubmit}>
                        <div className='row'>
                            <div className='col-sm-4 col-md-4 col-lg-4'>
                                <Form.Group className="mb-3">
                                <Form.Label className="fs-5 fw-bolder">User Name<span className="text-danger">*</span></Form.Label>
                                <Form.Control type="email" {...register('username')} placeholder="Enter username" />
                                {errors.username && <p className="text-danger">{errors.username.message}</p>}
                                </Form.Group>
                            </div>
                            <div className='col-sm-4 col-md-4 col-lg-4'>
                                <Form.Group className="mb-3">
                                <Form.Label className="fs-5 fw-bolder">Password<span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter password"
                                        {...register('password')}
                                    />
                                    <InputGroup.Text onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                                        {showPassword ? <BsEyeSlash /> : <BsEye />}
                                    </InputGroup.Text>
                                </InputGroup>
                                {errors.password && <p className="text-danger">{errors.password.message}</p>}
                                </Form.Group>
                            </div>
                             <div className='col-sm-4 col-md-4 col-lg-4'>
                                <Form.Group></Form.Group>
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
                             </div>
                        </div>
                    </Form>
                    <div className='pt-3'>
                        <Button variant="primary" onClick={handleButtonClick} type="submit" disabled={loading}>
                            {loading ? (
                            <Spinner animation="border" size="sm" />
                            ) : (
                            <>
                                <IoIosSave /> SAVE
                            </>
                            )}
                        </Button>
                        {/* <Button variant="danger" className='btn btn-success mx-4' onClick={handleBackClick}>
                            <TiArrowBack /> BACK
                        </Button> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserLoginForm;