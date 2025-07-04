import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Form, Button, Spinner} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { editToolsAndHardware } from "../../../api/toolsAndHardware/toolsAndHardware"
import { FaEdit } from "react-icons/fa";
import { TiArrowBack } from "react-icons/ti";
import Select from "react-select";

const ToolsAndHardwareMappingEdit = ({ID}) => {
        const { register, handleSubmit, setValue, reset, getValues } = useForm();
        const [loading, setLoading] = useState(false);
        const [selectedOptions, setSelectedOptions] = useState([]);
        const { id } = useParams();
        const projectId = ID || id;
        const navigate = useNavigate();
        const handleBackClick = ()=>{
            navigate(`/Tools-Hardware-Master-List`) 
        }

        const selectTypeOption = [
            { value: 'Software', label: 'Software' },
            { value: 'Hardware', label: 'Hardware' },
          ];

         useEffect(() => {
                const fetchProject = async () => {
                    try {
                        const response = await editToolsAndHardware(projectId, {});
                        const fetchedData = response?.data?.projectDetails;
                        if (fetchedData) {
                            reset({
                                ...fetchedData,
                            });               
                            if (fetchedData?.toolsAndHardwareType && selectTypeOption.length > 0) {
                                const selectToolsAndHardware = Array.isArray(fetchedData.toolsAndHardwareType) ? fetchedData.toolsAndHardwareType : [fetchedData.toolsAndHardwareType];
                                const matchedToolsAndHardware = selectToolsAndHardware
                                    .map((ToolsAndHardware) => selectTypeOption.find((item) => item.value === ToolsAndHardware));
                
                                setSelectedOptions(matchedToolsAndHardware);
                                setValue("toolsAndHardwareType",fetchedData?.toolsAndHardwareType)
                            }
             
                        }
                    } catch (error) {
                        console.error("Error fetching project details:", error);
                    }
                };
            
                if (projectId) fetchProject();
            }, [projectId, reset, setValue]);

        const onSubmit = async (formData) => {
            setLoading(true); 
            try{
                const formDataToSubmit = new FormData();
                const tollsName = formData.tollsName || getValues("tollsName")
                const toolsAndHardwareType = formData.toolsAndHardwareType || getValues("toolsAndHardwareType")

                formDataToSubmit.append("tollsName",tollsName)
                formDataToSubmit.append("toolsAndHardwareType",toolsAndHardwareType)

                await editToolsAndHardware(projectId, formDataToSubmit);
                toast.success('Form Updated successfully!', {
                    className: 'custom-toast custom-toast-success',
                });
            }catch(error){
                 console.error("Update failed:", error);
                    toast.error('Failed to submit the form.',error, {
                        className: 'custom-toast custom-toast-error',
                    });
            }
             setLoading(false)
        }

        const handleToolsAndHardwareChange=(selected) =>            
        {
            setSelectedOptions(selected);
            const toolsAndHardwareType = selected.value
            setValue('toolsAndHardwareType',toolsAndHardwareType)    
        }
        
    return(
        <div>
           <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <div className="row">
                <div className="col-sm-11 col-md-11 col-lg-11">
                    <h1>Edit Tools And Hardware</h1>
                </div>
                <div className="col-sm-1 col-md-1 col-lg-1">
                    <Button variant="danger" className='btn btn-success ' onClick={handleBackClick}>
                        <TiArrowBack />BACK
                    </Button>
                </div>
                <hr></hr>
                <form onSubmit={handleSubmit(onSubmit)} className="edit-project-form">
                    <div className="row pt-4" >
                        <div className="col-sm-6 col-md-6 col-lg-6">
                            <Form.Group>
                                <Form.Label className="fs-5 fw-bolder">Type<span className="text-danger">*</span></Form.Label>
                                <Select
                                    name="toolsAndHardwareType"
                                    options={selectTypeOption}
                                    value={selectedOptions}
                                    onChange={handleToolsAndHardwareChange}
                                    isLoading={loading}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-sm-6 col-md-6 col-lg-6">
                            <Form.Group>
                                <Form.Label className="fs-5 fw-bolder">Tool Name<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text" 
                                    {...register("tollsName")} 
                                />
                            </Form.Group>
                        </div>
                    </div>
                    <Button type="submit" className="mt-4 ml-4" variant="primary" onClick={onSubmit} disabled={loading}>
                        {loading ? (
                            <Spinner animation="border" size="sm" />
                            ) : (
                                <>
                                <FaEdit /> Save
                            </>
                            )}
                    </Button>
                    <Button variant="danger" className='mt-4 mx-4' onClick={handleBackClick}>
                       <TiArrowBack /> BACK
                    </Button>
                </form>
            </div>
        </div> 

    )
}

export default ToolsAndHardwareMappingEdit;