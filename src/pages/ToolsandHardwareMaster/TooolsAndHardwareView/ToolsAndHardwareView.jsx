import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Form, Button, Spinner} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { editToolsAndHardware } from "../../../api/toolsAndHardware/toolsAndHardware"
import { TiArrowBack } from "react-icons/ti";

const ToolsAndHardwareMappingView = ({ID}) => {
        const { register, setValue, reset,  } = useForm();
        const { id } = useParams();
        const projectId = ID || id;
        const navigate = useNavigate();
        const handleBackClick = ()=>{
            navigate(`/Tools-Hardware-Master-List`) 
        }

         useEffect(() => {
                const fetchProject = async () => {
                    try {
                        const response = await editToolsAndHardware(projectId, {});
                        const fetchedData = response?.data?.projectDetails;
                        if (fetchedData) {
                            reset({
                                ...fetchedData,
                            });
                        }
                    } catch (error) {
                        console.error("Error fetching project details:", error);
                    }
                };
            
                if (projectId) fetchProject();
            }, [projectId, reset, setValue]);

        
    return(
        <div>
            <div className="row">
                <div className="col-sm-10 col-md-10 col-lg-10">
                    <h1>View Tools And Hardware</h1>
                </div>
                <div className="col-sm-2 col-md-2 col-lg-2">
                    <Button variant="danger" className='btn btn-success ' onClick={handleBackClick}>
                        <TiArrowBack />BACK
                    </Button>
                </div>
                <hr></hr>
                <form className="edit-project-form">
                    <div className="row pt-4" >
                        <div className="col-sm-6 col-md-6 col-lg-6">
                            <Form.Group>
                                <Form.Label className="fs-5 fw-bolder">Type<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text" 
                                    readOnly
                                    {...register("toolsAndHardwareType")} 
                                />
                            </Form.Group>
                        </div>
                        <div className="col-sm-6 col-md-6 col-lg-6">
                            <Form.Group>
                                <Form.Label className="fs-5 fw-bolder">Tool Name<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text" 
                                    readOnly
                                    {...register("tollsName")} 
                                />
                            </Form.Group>
                        </div>
                    </div>
                </form>
            </div>
        </div> 

    )
}

export default ToolsAndHardwareMappingView;