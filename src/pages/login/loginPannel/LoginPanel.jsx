import React, { useState } from 'react';
import {Box, Button, Container, TextField, Typography, InputAdornment, IconButton, Paper,CircularProgress} from '@mui/material'; 
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
    const [loading, setLoading] = useState(false);

    const onSubmit = async(data)=>{
        setLoading(true);
        try{
            const payload = {
                username: data.username,
                password: data.password,
            };
        const response = await postLogin(payload)
        if(response?.data?.statusCode === 200){
            const userRole = response?.data?.user?.role;
            const userName = response?.data?.user?.name;
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('userName', userName);
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
        }finally {
             setLoading(false);
        }
    }

    const handleForgotPasswordClick = () => {
        NProgress.start();              
        navigate('/forgot-password');   
    };

    const handleChangePasswordClick = () => {
        NProgress.start();              
        navigate('/change-password');  
    }

    return( 
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(to right, #283E51, #485563)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >   
            <Box
                sx={{
                    height: 64,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 4,
                    backgroundColor: '#2c3e50',
                    color: '#ecf0f1',
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    PMC Portal
                </Typography>
                <Typography variant="subtitle1">STPI</Typography>
            </Box>
            <Box
                sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={6}
                        sx={{
                        p: 4,
                        borderRadius: 3,
                        backgroundColor: '#fdfdfd',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        animation: 'fadeIn 0.6s ease-in-out',
                        }}
                    >
                    <Typography
                    variant="h5"
                    align="center"
                    gutterBottom
                    sx={{ fontWeight: 'bold', color: '#1976d2' }}
                    >
                    PMC Login
                    </Typography>
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
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
                            disabled={loading}
                        >
                             {loading ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                                ) : (
                                'Login'
                                )}
                        </Button>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography
                                variant="body2"
                                align="left"
                                sx={{
                                    mt: 3,
                                    mb: 1,
                                    cursor: 'pointer',
                                    color: '#1976d2',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                                onClick={handleChangePasswordClick}
                            >
                                Change Password?
                            </Typography>
                            <Typography
                                variant="body2"
                                align="right"
                                sx={{
                                    mt: 3,
                                    mb: 1,
                                    cursor: 'pointer',
                                    color: '#1976d2',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                                onClick={handleForgotPasswordClick}
                            >
                                Forgot Password?
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </Box>
    </Box>
    )
}

export default LoginPanel;