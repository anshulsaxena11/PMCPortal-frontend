import React, { useState } from 'react';
import {Box, Button, Container, TextField, Typography, InputAdornment, IconButton, Paper, CircularProgress } from '@mui/material'; 
import Swal from 'sweetalert2';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import changePasswordValidationSchema from '../../../validation/changePassworValidation';
import checkEmailValidationSchema from '../../../validation/checkEmailValidation'
import {checkEmail, paswordChangeRequest} from '../../../api/loginApi/loginApi';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NProgress from 'nprogress'

const ChangePassword = () => {
    const [emailExists,setEmailExists] = useState(false)
    const [checkEmails,setCheckMail]=useState(true)
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate();
    const schema = emailExists ? changePasswordValidationSchema : checkEmailValidationSchema;

    const {register, handleSubmit, formState: { errors }, setValue, trigger,setError} = useForm({
      resolver: yupResolver(schema) 
    });
    const togglePassword = () => setShowPassword((prev) => !prev);
    const handleEmailcheck = async (data) => {
        try {
        const payload ={
            username: data.username,
        }
        const response = await checkEmail(payload)
        if (response?.data?.statusCode === 200) {
            setEmailExists(true);
            setCheckMail(false)
            setValue('emailExists', true);
            trigger('newPassword');
        } else {
            setEmailExists(false);
            Swal.fire('Error', 'Email not found', 'error');
        }
        } catch (error) {
        Swal.fire('Error', error?.response?.data?.message, 'error');
        }
    };

    const handleLoginClick = () => {
        NProgress.start();              
        navigate('/login');   
    };

    const handlePasswordReset = async (data)=>{
      setLoading(true);
      try{
        if (data.password !== data.confirmPassword) {
          setError('password', { type: 'manual', message: 'Passwords must match' });
          setError('confirmPassword', { type: 'manual', message: 'Passwords must match' });
          return;
        } else {
          const payload = {
            username:data.username,
            newPassword: data.password,
            confirmPassword:data.confirmPassword 
          };
          const response = await paswordChangeRequest(payload)
          if(response?.statusCode === 200){
             Swal.fire('Success', response?.message, 'success').then(() => {
              navigate('/login');
            });;
          }
        }
      } catch(error){
        if(error?.response?.data?.statusCode === 401){
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error?.response?.data?.message || 'Something went wrong',
          });
        }else if(error?.response?.data?.statusCode === 400){
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error?.response?.data?.message || 'Something went wrong',
        });
        }
      } finally {
      setLoading(false);
    }
    }
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
                Change Password
                </Typography>
           <form onSubmit={handleSubmit(emailExists ? handlePasswordReset : handleEmailcheck)}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                {...register('username')}
                error={!!errors.username}
                helperText={errors.username?.message}
                autoComplete="username"
                disabled={emailExists}
              />
              {checkEmails && (
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                  Verify User Name
                </Button>
              )}
                {emailExists && (
                    <>
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
                  <TextField
                      fullWidth
                      label="Confirm Password"
                      variant="outlined"
                      margin="normal"
                      type={showPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      autoComplete="new-password"
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
                  </>
              )}
              {emailExists && (
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}  disabled={loading}>
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Change Password'
                  )}
                </Button>
              )}
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

export default ChangePassword;