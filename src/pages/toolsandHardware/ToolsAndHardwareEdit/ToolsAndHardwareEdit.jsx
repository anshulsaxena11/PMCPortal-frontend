import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Form, Spinner} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { putToolsAndHardware, getToolsAndHardwareMappping } from "../../../api/toolsAndHardware/toolsAndHardware"
import { directoratesList, srpiEmpTypeListActive } from '../../../api/syncEmp/syncEmp'
import EditIcon from '@mui/icons-material/Edit';
import Select from "react-select";
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

const ToolsAndHardwareEdit = ({ID}) => {
        const { register, handleSubmit, setValue, reset, getValues } = useForm();
        const [loading, setLoading] = useState(false);
        const [empData,setEmpData] = useState([])
        const [selectedEmp, setSelectedEmp] = useState(null);
        const [isUserDir, setIsUserDir] = useState(false)
        const [isFirstUsed, setIsFirstUsed] = useState(false)
        const [data,setData] = useState([])
        const [selectedDir, setSelectedDir] = useState();
        const [dirOptions, setDirOptions] = useState([]);
        const [selectedTool, setSelectedTool] = useState(null);
        const [typeOfTool, setTypeOfTool] = useState()
        const { id } = useParams();
        const projectId = ID || id;
        const navigate = useNavigate();
        const handleBackClick = ()=>{
            navigate(`/Tools-Hardware-list`) 
        }
        useEffect(() => {
            fetchEmpList();
        }, [selectedDir,isFirstUsed,setSelectedDir]);

        useEffect(() => {
            fetchData();
        }, []); 

         useEffect(() => {
                const fetchProject = async () => {
                    try {
                        const response = await putToolsAndHardware(projectId, {});
                        const fetchedData = response?.data?.projectDetails;
                        if (fetchedData) {
                            const formattedStartDate = fetchedData.startDate
                            ? fetchedData.startDate.split("T")[0]
                            : "";
        
                             const formattedEndDate = fetchedData.endDate
                                ? fetchedData.endDate.split("T")[0]
                                : "";
                            reset({
                                ...fetchedData,
                                startDate: formattedStartDate,
                                endDate: formattedEndDate,
                            });
                            if (fetchedData?.tollsName && data.length > 0) {
                                const selectToolsAndHardware = Array.isArray(fetchedData.tollsName) ? fetchedData.tollsName : [fetchedData.tollsName];
                                const matchedToolsAndHardware = selectToolsAndHardware
                                    .map((tollsName) => data.find((item) => item.label === tollsName));
                
                                setSelectedTool(matchedToolsAndHardware);
                                setTypeOfTool(matchedToolsAndHardware[0].type)
                                setValue("tollsName",fetchedData?.tollsName)
                            }
                            if ( !isUserDir && fetchedData?.directorates && dirOptions.length > 0) {
                                const selectToolsAndHardware = Array.isArray(fetchedData.directorates) ? fetchedData.directorates : [fetchedData.directorates];
                                const matchedToolsAndHardware = selectToolsAndHardware
                                    .map((directorates) => dirOptions.find((item) => item.label === directorates));
                
                                setSelectedDir(matchedToolsAndHardware);
                                setValue("directorates",fetchedData?.directorates)
                            }
                            
                            if ( fetchedData?.assignedTo && empData.length > 0) {
                                const selectToolsAndHardware = Array.isArray(fetchedData.assignedTo) ? fetchedData.assignedTo : [fetchedData.assignedTo];
                                const matchedToolsAndHardware = selectToolsAndHardware
                                    .map((assignedTo) => empData.find((item) => item.label === assignedTo));
                
                                setSelectedEmp(matchedToolsAndHardware);
                                setValue("assignedTo",fetchedData?.assignedTo)
                            }
             
                        }
                    } catch (error) {
                        console.error("Error fetching project details:", error);
                    }
                };
            
                if (!loading && projectId && data.length > 0) { fetchProject();}
            }, [projectId, reset, setValue,data,dirOptions,loading,isUserDir]);

             useEffect(() => {
                    const fetchDiretoratesData = async () => {
                      setLoading(true);
                        try {
                            const response = await directoratesList();
                            const options = response.data.data.map((dir) => ({
                                value: dir,
                                label: dir,
                            }));
                            setDirOptions(options);
                        } catch (error) {
                            console.error('Error fetching Directorates list:', error);
                        } finally {
                          setLoading(false);
                        }
                    };
                    fetchDiretoratesData();
                }, []);

            const fetchData = async () => {
                setLoading(true);
                try {
                    const response = await getToolsAndHardwareMappping();
                    const fetchDatas = response.data; 
                    if (fetchDatas && Array.isArray(fetchDatas)){
                    const option = fetchDatas.map((item)=>({
                        value:item._id,
                        label:item.tollsName,
                        type:item.toolsAndHardwareType,
                    }))            
                    setData(option);
                    } 
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            };

        const onSubmit = async (formData) => {
            setLoading(true); 
            try{
                const formDataToSubmit = new FormData();
                const tollsName = formData.tollsName || getValues("tollsName")
                const quantity = formData.quantity || getValues("quantity")
                const startDate = formData.startDate || getValues("startDate")
                const endDate = formData.endDate || getValues("endDate")
                const directorates = selectedDir?.label || formData.directorates || getValues("directorates")
                const purchasedOrder = formData.purchasedOrder || getValues("purchasedOrder")
                const description = formData.description || getValues("description")
                const assignedTo = formData.assignedTo || getValues('assignedTo')

                formDataToSubmit.append("tollsName",tollsName)
                formDataToSubmit.append("quantity",quantity)
                formDataToSubmit.append("startDate",startDate)
                formDataToSubmit.append("endDate",endDate)
                formDataToSubmit.append("directorates",directorates)
                formDataToSubmit.append("purchasedOrder",purchasedOrder)
                formDataToSubmit.append("description",description)
                formDataToSubmit.append("assignedTo",assignedTo)

                await putToolsAndHardware(projectId, formDataToSubmit);
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

          const fetchEmpList = async() =>{
            setLoading(true);
            try{
                const dirValue = Array.isArray(selectedDir) ? selectedDir[0]?.value : selectedDir?.value;
                if(!isFirstUsed && dirValue){
                const response = await srpiEmpTypeListActive({dir:dirValue })
                  const options = response.dropEdit
                  .map((dir) => ({
                    value: dir.ename,
                    label: dir.ename,
                  }));
                  setEmpData(options);
                  setIsFirstUsed(true)
                } 
              
                }catch(error){
                    console.error('Failed to fetch employee list:', error);
                }
                setLoading(false);  
            } 

        const handleToolsAndHardwareChange=(selected) =>{
            const selectedTool=selected?.type
            setTypeOfTool(selectedTool)
            setSelectedTool(selected);
            const toolsAndHardwareName = selected.label
            setValue('tollsName',toolsAndHardwareName)
        }

        const handleDir = (selected)=>{
            setIsFirstUsed(false)
            setSelectedDir(selected)
            setIsUserDir(true)
            const directorates = selected.label
            setValue("directorates",directorates)
        }

        const handleEmp = (selected)=>{
            setSelectedEmp(selected)
            setIsUserDir(true)
            const assignedTo = selected.value
            setValue("assignedTo",assignedTo )  
        }
        
    return(
        <div>
           <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <div className="row">
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
                  Tools/Hardware Mapping
                </Typography>
              </Box>
             </div>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}></hr>
                <form onSubmit={handleSubmit(onSubmit)} className="edit-project-form">
                    <div className="row pt-4" >
                        <div className="col-sm-4 col-md-4 col-lg-4">
                            <Form.Group>
                                <Form.Label className="fs-5 fw-bolder">Type<span className="text-danger">*</span></Form.Label>
                                <Select
                                    name="tollsName"
                                    options={data}
                                    value={selectedTool}
                                    onChange={handleToolsAndHardwareChange}
                                    isLoading={loading}
                                />
                            </Form.Group>
                            <Form.Group className='pt-4'>
                                <Form.Label className="fs-5 fw-bolder">Assigned Directorates<span className="text-danger">*</span></Form.Label>
                                <Select
                                    name="directorates"
                                    options={dirOptions}
                                    value={selectedDir}
                                    onChange={handleDir}
                                    isLoading={loading}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-sm-4 col-md-4 col-lg-4">
                            <Form.Group>
                                <Form.Label className="fs-5 fw-bolder">Quantity<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text" 
                                    {...register("quantity")} 
                                />
                            </Form.Group>
                            <Form.Group className='pt-4'>
                            <Form.Label className="fs-5 fw-bolder">Assigned Officer<span className="text-danger">*</span></Form.Label>
                                <Select
                                    name="assignedTo"
                                    options={empData}
                                    value={selectedEmp}
                                    onChange={handleEmp}
                                    isLoading={loading}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-sm-4 col-md-4 col-lg-4">
                            <div className="row ">
                                <div className="col-sm-6 col-md-6 col-lg-6">
                                        <Form.Group className="mb-3" controlId="StartDate">
                                           <Form.Label className="fs-5 fw-bolder">
                                            {typeOfTool?.toLowerCase().includes('software')
                                                ? 'License Start Date'
                                                : typeOfTool?.toLowerCase().includes('warranty') || typeOfTool?.toLowerCase().includes('hardware')
                                                ? 'Warranty Start Date'
                                                : 'Start Date'}
                                            <span className="text-danger">*</span>
                                        </Form.Label>
                                            <Form.Control 
                                            type="date"
                                            {...register("startDate")}                      
                                        />
                                        </Form.Group>
                                </div>
                                <div className="col-sm-6 col-md-6 col-lg-6">
                                    <Form.Group controlId="endDate">
                                    <Form.Label className="fs-5 fw-bolder">
                                        {typeOfTool?.toLowerCase().includes('software')
                                            ? 'License End Date'
                                            : typeOfTool?.toLowerCase().includes('warranty') || typeOfTool?.toLowerCase().includes('hardware')
                                            ? 'Warranty End Date'
                                            : 'End Date'}
                                        <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control 
                                        type="date"
                                        {...register("endDate")} 
                                    />
                                        </Form.Group>
                                </div>
                                <Form.Group className='pt-2'>
                                <Form.Label className="fs-5 fw-bolder">Purchased Order<span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text" 
                                    {...register("purchasedOrder")} 
                                />
                            </Form.Group>
                            </div>
                        </div>
                            <Form.Group className='pt-4'>
                                <Form.Label className="fs-5 fw-bolder">Description<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                    type="text" 
                                    as='textarea'
                                    {...register("description")} 
                                />
                            </Form.Group>
                    </div>
                    <Box
                                               sx={{
                                                 display: 'flex',
                                                 justifyContent: 'flex-end',
                                                 mt: 4, 
                                               }}
                                             >
                                               
                               
                                               {/* SAVE Button on the right */}
                                               <Button
                                                 variant="contained"
                                                 color="success"
                                                 onClick={onSubmit}
                                                 disabled={loading}
                                                 startIcon={!loading && <EditIcon />}
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
                                                 {loading ? <CircularProgress size={24} color="inherit" /> : 'Update'}
                                               </Button>
                                             </Box>
                </form>
            </div>
        </div> 

    )
}

export default ToolsAndHardwareEdit;