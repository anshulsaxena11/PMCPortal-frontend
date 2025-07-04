import React, { useState } from 'react';
import Form from "react-bootstrap/Form";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toolsAndHardwareMasterValidation from '../../../validation/toolsAndHardwareMasterValidation'
import { Button, Spinner } from 'react-bootstrap'; 
import { ToastContainer, toast } from 'react-toastify';
import {postToolsAndHardwareMappping} from '../../../api/toolsAndHardware/toolsAndHardware'
import Select from "react-select";
import 'react-toastify/dist/ReactToastify.css'; 
import "bootstrap/dist/css/bootstrap.min.css";
import { IoIosSave } from "react-icons/io";
import { TiArrowBack } from "react-icons/ti";
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

        }
        setLoading(false);
      }
    return(
        <div className='container-fluid'>
            <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <div className='row'>
                <div className="col-sm-10 col-md-10 col-lg-10">
                    <h1>Tools/Hardware Master</h1>
                </div>
                <div className='col-sm-2 col-md-2 ol-lg-2'>
                    <Button variant="danger" className='btn btn-success ' onClick={handleBackClick}>
                        <TiArrowBack />BACK
                    </Button>
                </div>
            </div>
            <hr></hr>
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
                    <Button variant="primary" onClick={handleButtonClick} type="submit" disabled={loading}>
                        {loading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <>
                                <IoIosSave /> SAVE
                            </>
                        )}
                    </Button>
                    <Button variant="danger" className='btn btn-success mx-4' onClick={handleBackClick}>
                        <TiArrowBack /> BACK
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default ToolsAndHardwareMapping;
