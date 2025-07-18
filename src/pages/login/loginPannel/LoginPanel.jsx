import React, { useState } from 'react';
import {Box, Button, Container, TextField, Typography, InputAdornment, IconButton, Paper} from '@mui/material'; 
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import Swal from 'sweetalert2'
import { postLogin } from "../../../api/loginApi/loginApi"
import loginValidationSchema from '../../../validation/loginValidation';
import { useNavigate } from 'react-router-dom';
import NProgress from 'nprogress';


const LoginPanel = () =>{
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate();
    const {register, handleSubmit, formState: { errors },} = useForm({
            resolver: yupResolver(loginValidationSchema) 
        });
    const togglePassword = () => setShowPassword((prev) => !prev);

    const onSubmit = async(data)=>{
        try{
            const payload = {
                username: data.username,
                password: data.password,
            };
        const response = await postLogin(payload)
        if(response?.data?.statusCode === 200){
            const userRole = response?.data?.user?.role;
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', userRole);
             Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: response.data.message,
                timer: 100,
                showConfirmButton: false
            }).then(() => {
                navigate('/',{replace:true}); 
            });
        }
        }catch(error){
            Swal.fire('Error', error?.response?.data?.message || 'Login failed', 'error');
        }
    }

    const handleForgotPasswordClick = () => {
        NProgress.start();              
        navigate('/forgot-password');   
    };

    return( 
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(to right, #283E51, #485563)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
            }}
        >
        <Container maxWidth="sm">
            <Paper elevation={6} sx={{p: 4, borderRadius: 3,backgroundColor: '#fdfdfd',boxShadow: '0 8px 24px rgba(0,0,0,0.1)',animation: 'fadeIn 0.6s ease-in-out',}}>
                <Typography variant="h5" align="center" gutterBottom  sx={{ fontWeight: 'bold', color: '#1976d2' }}>PMC Login</Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        margin="normal"
                        {...register('username')}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                        autoComplete="username"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        variant="outlined"
                        margin="normal"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        autoComplete="current-password"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={togglePassword} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button fullWidth variant="contained" color="primary" type="submit"  sx={{ mt: 3, py: 1.5, fontWeight: 600 }}>
                        Login
                    </Button>
                    <Typography
                        variant="body2"
                        align="right"
                        sx={{ mt: 3, mb: 1, cursor: 'pointer', color: '#1976d2', '&:hover': { textDecoration: 'underline' } }}
                        onClick={handleForgotPasswordClick}
                    >
                        Forgot Password?
                    </Typography>
                </form>
            </Paper>
        </Container>
        </Box>
    )
}

export default LoginPanel;