import React, { useState } from 'react';
import Form from "react-bootstrap/Form";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toolsAndHardwareMasterValidation from '../../../validation/toolsAndHardwareMasterValidation'
import { Spinner } from 'react-bootstrap'; 
import { ToastContainer, toast } from 'react-toastify';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import CircularProgress from '@mui/material/CircularProgress';
import {postToolsAndHardwareMappping} from '../../../api/toolsAndHardware/toolsAndHardware'
import Select from "react-select";
import 'react-toastify/dist/ReactToastify.css'; 
import "bootstrap/dist/css/bootstrap.min.css";
import { IoIosSave } from "react-icons/io";
import { useNavigate } from 'react-router-dom';



const ToolsAndHardwareMapping = () =>{
    const { control, handleSubmit, formState: { errors },reset } = useForm({
        resolver: yupResolver(toolsAndHardwareMasterValidation),
        defaultValues: {},
      });
      const selectTypeOption = [
        { value: 'Software', label: 'Software' },
        { value: 'Hardware', label: 'Hardware' },
      ];
        const [loading, setLoading] = useState(false); 
        const navigate = useNavigate();

       const handleButtonClick = (e) => {
        e.preventDefault();
          handleSubmit(handleFormdataSubmit)();
      };
      const handleBackClick = ()=>{
        navigate(`/Tools-Hardware-Master-List`) 
      }
      const handleFormdataSubmit = async (data) => {
        const payload={
            tollsName:data.tollsName,
            toolsAndHardwareType:data.toolsAndHardwareType
        }
        setLoading(true)
        try{
            const response = await postToolsAndHardwareMappping(payload);
            if(response.data.statusCode === 200){
                reset({
                    tollsName:'',
                    quantity:'',
                    toolsAndHardwareType:''
                })
                toast.success('Form submitted successfully!', {
                    className: 'custom-toast custom-toast-success',
                });
            }else if(response.data.statuscode === 400 && response.message.includes("Tools And Hardware already exist")){
                toast.error(response.message, {
                    className: "custom-toast custom-toast-error",
                });
            }
        }catch(error){
            toast.error(error, {
                className: "custom-toast custom-toast-error",
            });
        }
        setLoading(false);
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
                      Tools/Hardware Master
                    </Typography>
                  </Box>
                 </div>
           <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
            <div className='row'>
                <Form onSubmit={handleSubmit}>
                    <div className='row'>
                        <div className='col-sm-6 col-md-6 col-lg-6'>
                        <Form.Group className="mb-3" >
                            <Form.Label className="fs-5 fw-bolder">Type<span className="text-danger">*</span></Form.Label>
                                <Controller
                                    name="toolsAndHardwareType"
                                    control={control}
                                    render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={selectTypeOption} 
                                        value={selectTypeOption.find(option => option.label === field.value) || null}
                                        isClearable
                                        isDisabled={loading}
                                        placeholder="Select Type"
                                        onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.label : "")}
                                        />
                                    )}
                                />
                                {errors.toolsAndHardwareType && <p className="text-danger">{errors.toolsAndHardwareType.message}</p>}
                            </Form.Group>
                        </div>
                        <div className='col-sm-6 col-md-6 col-lg-6'>
                            <Form.Group className="mb-3">
                                <Form.Label className="fs-5 fw-bolder">Software/Hardware Name<span className="text-danger">*</span></Form.Label>
                                <Controller
                                    name="tollsName"
                                    control={control}
                                    render={({ field }) => <input {...field} className="form-control"  placeholder="Enter Name"/>}
                                />
                                {errors.tollsName && <p className="text-danger">{errors.tollsName.message}</p>}
                            </Form.Group>
                        </div>
                    </div>                   
                            <>
                                <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            mt: 4, 
                                            }}
                                              >
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
                            </>
                                          
                </Form>
            </div>
        </div>
    );
};

export default ToolsAndHardwareMapping;
