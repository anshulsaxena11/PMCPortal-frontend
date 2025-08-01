import React, { useState } from 'react';
import { Box, Container, Paper, Typography, TextField, Button } from '@mui/material';
import Swal from 'sweetalert2';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import forgetPasswordValidationSchema from '../../../validation/forgotPasswordValidation';
import {postForgetPassword} from '../../../api/loginApi/loginApi';
import { useNavigate } from 'react-router-dom';
import NProgress from 'nprogress'

const ForgotPassword = () => {
  const navigate = useNavigate();
   const {register, handleSubmit, formState: { errors },} = useForm({
      resolver: yupResolver(forgetPasswordValidationSchema) 
    });

  const onSubmit = async (data) => {
    try {
      const payload ={
        username: data.username,
      }
      const response = await postForgetPassword(payload)
      if (response?.data?.statusCode === 200) {
        Swal.fire('Success', response?.data?.message, 'success');
      }
    } catch (error) {
      Swal.fire('Error', error?.response?.data?.message, 'error');
    }
  };
   const handleLoginClick = () => {
      NProgress.start();              
      navigate('/login');   
    };

  return (
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
          <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
            <Typography
              variant="h5"
              align="center"
              sx={{ fontWeight: 'bold', mb: 3 }}
            >
               Forgot Password
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
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                  Reset Password
                </Button>
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
                  onClick={handleLoginClick}
                >
                  Sign In?
                </Typography>
              </form>
            </Paper>
          </Container>
        </Box>
      </Box>
    );
  };

export default ForgotPassword;