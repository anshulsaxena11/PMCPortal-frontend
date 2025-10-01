import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Typography, Button } from "@mui/material";
import { Table } from 'react-bootstrap';
import "react-tabs/style/react-tabs.css";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { getProjectNameList, getProjectTypeList } from '../../api/ProjectDetailsAPI/projectDetailsApi';
import { getDeviceReportList } from '../../api/deviceListAPI/decicelistApi'
import { getFullReport } from '../../api/reportApi/reportApi'
import { getRoundList } from '../../api/roundApi/round'
import { ToastContainer, toast } from 'react-toastify';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import Form from 'react-bootstrap/Form';
import Select from 'react-select';
import MSWordPreview from "../../components/Document/WordDocumentGenerator"
import "./reportGenerator.css";

const ReportPdfGenerator = () => {
  const [value, setValue] = useState(0);
  const [error, setError] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState(""); 
  const [loading, setLoading] = useState(false); 
  const [ProjectName, setProjectName] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [ProjectType, setProjectType] = useState("");
  const [isSectionBEnabled, setIsSectionBEnabled] = useState(false); 
  const [isSectionBEnabledTwo, setIsSectionBEnabledTwo] = useState(false); 
  const [isSectionBEnabledThree, setIsSectionBEnabledThree] = useState(false); 
  const [deviceOption, setDeviceOption] = useState([])
  const [selectedDevice, setSelectedDevice] = useState()
  const [selectedDeviceReport, setSelectedDeviceReport] = useState()
  const [round, setRound] = useState([])
  const [selectedRound, setSelectedRound] = useState("")
  const [projectDetailsReport, setProjectDetailsReport] = useState([])
  const [fullReport, setFullReport] = useState([])

  const { control, handleSubmit, watch, setValue: setFormValue, formState: { errors } } = useForm({
    resolver: yupResolver(),
  });

  useEffect(() => {
    const fetchProjectNameList = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProjectNameList();

        if (data && data.statusCode === 200 && Array.isArray(data.data)) {
          setProjectName(data.data);
        } else {
          throw new Error("Unexpected data format or empty project list");
        }
      } catch (err) {
        setError(`Failed to fetch project types: ${err.message}`);
        console.error("Error fetching project types:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectNameList();
  }, []);


  useEffect(() => {
    const fetchProjectTypes = async () => {
      if (selectedProjectName) {
        setLoading(true);
        setError("");

        try {
          const selectedProjectId = selectedProjectName; 

          const data = await getProjectTypeList(selectedProjectId);

          if (data && data.statusCode === 200 && Array.isArray(data.data)) {
            setSelectedTypes(data.data);
          } else {
            throw new Error("Unexpected data format or empty project types");
          }
        } catch (err) {
          setError(`Failed to fetch project types: ${err.message}`);
          console.error("Error fetching project types:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProjectTypes();
  }, [selectedProjectName]);

  useEffect(() => {
  const fetchDevice = async () => {
    setLoading(true);
    setError(false);
    try {
      if (selectedProjectName && ProjectType) {
        const projectName = selectedProjectName;
        const projectType = ProjectType;

        const data = await getDeviceReportList(projectName, projectType);
        const response = data.data;

        if (response && response.statusCode === 200 &&Array.isArray(response.data)) {
          const options = response.data.map((device) => ({
            value: device,
            label: device,
          }));
          setDeviceOption(options)
        } else {
          throw new Error("Unexpected data format or empty device list");
        }
      }
    } catch (err) {
      setError(`Failed to fetch devices: ${err.message}`);
      console.error("Error fetching devices:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchDevice();
}, [selectedProjectName, ProjectType]);

  useEffect(()=>{
    const fetchRound = async () => {
      setLoading(true);
      setError(true);
      try{
        if((selectedProjectName && ProjectType)||(selectedDeviceReport && selectedProjectName && ProjectType)){
        const projectName = selectedProjectName;
        const projectType = ProjectType
        const devices = selectedDeviceReport
        const data = await getRoundList(projectName,projectType,devices);
        const response = data.data.data;
      
        if (data.data && data.data.statusCode === 200 && Array.isArray(response)) {
          setRound(response);
        } else {
          throw new Error("Unexpected data format or empty Round");
        }
      }
      }catch(err){
        setError(`Failed to fetch Round: ${err.message}`);
        console.error("Error fetching Round:", err);
      }

    }
    fetchRound()
  },[selectedProjectName,ProjectType,selectedDeviceReport])

  useEffect(()=>{
    const fechFullReport = async ()  =>{
      setLoading(true);
      setError(true);
      if((selectedProjectName && ProjectType && selectedRound)|| (selectedProjectName && ProjectType && selectedRound && selectedDeviceReport)){
        const projectName = selectedProjectName;
        const projectType = ProjectType
        const round = selectedRound
        const devices = selectedDeviceReport
        const data = await getFullReport(projectName,projectType,round,devices)
        console.log(data.data.response);
        // console.log(data.data.data)
        if(data.data && data.data.statusCode === 200){
          // console.log(data.data.data)
          setProjectDetailsReport(data.data.data)
          setFullReport(data.data.response)
        }
      }
    }
    fechFullReport();
  },[selectedProjectName,ProjectType,selectedRound,selectedDeviceReport])

  const handleNext = () => {
    if (!selectedProjectName || !ProjectType || !round) {
       toast.error('Please fill all required fields.', {
          className: 'custom-toast custom-toast-error',
        });
      return;
    }
    setIsSectionBEnabled(true);
    setValue(1);
  };
  const handleNexttwo = () => {
   
    setIsSectionBEnabledTwo(true);
    setValue(2);
  };
  const formattedStartDate = projectDetailsReport?.[0]?.startDate 
    ? dayjs(projectDetailsReport[0].startDate).format('DD/MM/YYYY') 
    : " ";

  const formattedEndDate = projectDetailsReport?.[0]?.endDate
    ? dayjs(projectDetailsReport[0].endDate).format('DD/MM/YYYY')
    : " ";

  const handleNextthree = () => {
   
    setIsSectionBEnabledThree(true);
    setValue(3);
  };
  const handleDeviceChange = (selected)=>{
    setSelectedDevice(selected)
    setSelectedRound(null)
    const selectedDevice = selected?.label
    setSelectedDeviceReport(selectedDevice)
  }

  return (
    
    <Box className="tabs-container">
      {/* Tabs */}
    <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={(event, newValue) => {
          if (newValue === 1 && !isSectionBEnabled) return;
          if (newValue === 2 && !isSectionBEnabledTwo) return;
          if (newValue === 3 && !isSectionBEnabledThree) return;
          setValue(newValue);
        }}
    >
    <Tab label="Section A" className="tab-text" />
    <Tab label="Section B" className="tab-text" />
    {/* <Tab label="Section C" className="tab-text" />
    <Tab label="Section D" className="tab-text" /> */}
    </Tabs>

      {/* Tab Panels */}
      <Box className="tab-panel">
        {value === 0 && (
          <Typography>
            <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <div className='container-fluid'>
              <div className='row'>
                <Form>
                  <div className='row'>
                    <div className='col-sm-3 col-md-3 col-lg-3'>
                      <Form.Group>
                        <Form.Label className='fs-5 fw-bolder'>Project Name<span className="text-danger">*</span></Form.Label>
                        <Controller
                          name="selectedProjectName"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={
                                field.value
                                  ? {
                                      value: field.value, 
                                      label: ProjectName.find(p => p._id === field.value)?.projectName || "Select a project",
                                    }
                                  : null
                              }
                              options={ProjectName.map(({ _id, projectName }) => ({
                                value: _id, 
                                label: projectName,
                              }))}
                              isLoading={loading}
                              isSearchable
                              placeholder="Select a project"
                              onChange={(selectedOption) => {
                                field.onChange(selectedOption?.value); 
                                setSelectedProjectName(selectedOption?.value);
                              }}
                            />
                          )}
                        />
                      </Form.Group>
                    </div>
                    <div className='col-sm-3 col-md-3 col-lg-3'>
                      <Form.Group className="mb-3">
                        <Form.Label className="fs-5 fw-bolder">Project Type<span className="text-danger">*</span></Form.Label>
                        <Controller
                          name="ProjectType"
                          control={control}
                          rules={{ required: "Project Type is required" }} 
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={selectedTypes.find(type => type === field.value) ? { value: field.value, label: field.value } : null}
                              options={selectedTypes.map(type => ({
                                value: type,  
                                label: type,  
                              }))}
                              isLoading={loading}
                              isSearchable
                              placeholder="Select Project Type"
                              onChange={(selectedOption) => {
                                const selection = selectedOption ? selectedOption.label : "";
                                field.onChange(selection);
                                setProjectType(selection);
                                setFormValue("ProjectType", selectedOption.label);
                                if (selection !== "Network Devices") {
                                  setSelectedDevice(null); 
                                }
                              }}
                            />
                          )}
                        />
                      </Form.Group>
                    </div>
                    {ProjectType === "Network Devices" && (
                    <div className='col-sm-3 col-md-3 col-lg-3'>
                      <Form.Group>
                        <Form.Label className="fs-5 fw-bolder">Devices<span className="text-danger">*</span></Form.Label>
                        <Select
                          options={deviceOption}
                          value={selectedDevice}
                          onChange={handleDeviceChange}
                          isLoading={loading}
                          placeholder="Select Devices"
                        />

                      </Form.Group>
                    </div>
                    )}
                    <div className='col-sm-3 col-md-3 col-lg-3'>
                      <Form.Group>
                        <Form.Label className="fs-5 fw-bolder">Round<span className="text-danger">*</span></Form.Label>
                        <Controller
                          name="round"
                          control={control}
                          rules={{ required: "Round Type is required" }} 
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={
                                round.find(type => type === field.value) 
                                  ? { value: field.value, label: `Round ${field.value}` } 
                                  : null
                              }
                              options={round.map(type => ({
                                value: type,  
                                label: `Round ${type}`  
                              }))}
                              isLoading={loading}
                              isSearchable
                              placeholder="Select Round"
                              onChange={(selectedOption) => {
                                field.onChange(selectedOption.value); 
                                setSelectedRound(selectedOption.value)
                              }}
                            />
                          )}
                        />
                      </Form.Group>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-3">
                    <Button variant="contained" color="primary" onClick={handleNext}>
                      Next
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </Typography>
        )}
        {/* {value === 1 && (
          <Typography>
            <h4>Section B Content</h4>
             <div className="d-flex justify-content-end mt-3">
                <Button variant="contained" color="primary" onClick={handleNexttwo}>
                  Next
                </Button>
              </div>
          </Typography>
        )} */}
        {value === 1 && projectDetailsReport && fullReport && Object.keys(projectDetailsReport).length > 0 && (
          <Typography>
            <div className='container my-3' >
              <div className='row'>
                <div className='col-sm-3 col-md-3 col-lg-3'>
                  <div>
                    <strong>Work Order Number:</strong>{" "}<span>{projectDetailsReport?.[0]?.workOrderNo}</span>
                  </div>
                  <div>
                    <strong>Organisation Name:</strong>{" "}<span>{projectDetailsReport?.[0]?.orginisationName}</span>
                  </div>
                  <div>
                    <strong>Project Manager:</strong>{" "}<span>{projectDetailsReport?.[0]?.projectManager}</span>
                  </div>
                </div>
                <div className='col-sm-3 col-md-3 col-lg-3'>
                  <div>
                    <strong>Project Name:</strong>{" "}<span>{projectDetailsReport?.[0]?.projectName}</span>
                  </div>
                  <div>
                    <strong>Start Date:</strong>{" "}<span>{formattedStartDate}</span>
                  </div>
                  <div>
                    <strong>Project Value(INR):</strong>{" "}<span>{projectDetailsReport?.[0]?.projectValue}</span>
                  </div>
                </div>
                <div className='col-sm-3 col-md-3 col-lg-3'>
                  <div>
                    <strong>Order Type:</strong>{" "}<span>{projectDetailsReport?.[0]?.orderType}</span>
                  </div>
                  <div>
                    <strong>End Date:</strong>{" "}<span>{formattedEndDate}</span>
                  </div>
                  <div>
                    <strong>Servive Location:</strong>{" "}<span>{projectDetailsReport?.[0]?.serviceLocation}</span>
                  </div>
                </div>
                <div className='col-sm-3 col-md-3 col-lg-3'>
                  <div>
                    <strong>Type:</strong>{" "}<span>{projectDetailsReport?.[0]?.type}</span> 
                  </div>
                  <div>
                    <strong>ProjectType:</strong>{" "}<span>{fullReport?.[0]?.projectType}</span>
                  </div>
                  <div>
                    <strong>Directorates:</strong>{" "}<span>{projectDetailsReport?.[0]?.directrate}</span>
                  </div>
                </div>
              </div>
              <div className=' pt-3'>
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                  {fullReport?.map((item, index) => {
                    let bgColor = "inherit";
                    let textColor = "black";

                    if (item.sevirty === "High") {
                      bgColor = "red";
                      textColor = "white";
                    } else if (item.sevirty === "Medium") {
                      bgColor = "orange";
                      textColor = "black";
                    } else if (item.sevirty === "LOW") {
                      bgColor = "green";
                      textColor = "white";
                    }else if (item.sevirty === "INFO") {
                      bgColor = "#0000FF";
                      textColor = "black";
                    }

                    return (
                      <div key={index} style={{ marginBottom: "60px" }}> 
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th colSpan={2} style={{ backgroundColor:"#b6dde8" }}>
                                Vulnerability No {index + 1}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                             <tr>
                              <td style={{ backgroundColor:"#b6dde8" }}>Project Type</td>
                              <td>{item.projectType}</td>
                            </tr>
                            
                            {item.projectType === 'Network Devices' && (
                              <>
                              <tr>
                                <td style={{ backgroundColor: "#b6dde8" }}>Device Type</td>
                                <td>{item.devices}</td>
                              </tr>
                              <tr>
                                <td style={{ backgroundColor: "#b6dde8" }}>Device Name</td>
                                <td>{item.Name}</td>
                              </tr>
                              <tr>
                                <td style={{ backgroundColor: "#b6dde8" }}>Device IP</td>
                                <td>{item.ipAddress}</td>
                              </tr>
                              </>
                            )}

                            <tr>
                              <td style={{ backgroundColor:"#b6dde8" }}>Vulnerability Name/Type</td>
                              <td>{item.vulnerabilityName}</td>
                            </tr>
                            <tr>
                              <td style={{ backgroundColor:"#b6dde8" }}>Severity</td>
                              <td style={{ backgroundColor: bgColor, color: textColor, fontWeight: "bold" }}>
                                {item.sevirty}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ backgroundColor:"#b6dde8" }}>Description</td>
                              <td>{item.description}</td>
                            </tr>
                            <tr>
                              <td style={{ backgroundColor:"#b6dde8" }}>Location</td>
                              <td>{item.path}</td>
                            </tr>
                            <tr>
                              <td style={{ backgroundColor:"#b6dde8" }}>Impact</td>
                              <td>{item.path}</td>
                            </tr>
                            
                            <tr>
                              <td style={{ backgroundColor:"#b6dde8" }}>Vulnerable Parameter</td>
                              <td>{item.vulnerableParameter}</td>
                            </tr>
                            <tr>
                              <td style={{ backgroundColor:"#b6dde8" }}>References</td>
                              <td>{item.references}</td>
                            </tr>
                            <tr>
                              <td style={{ backgroundColor:"#b6dde8" }}>Proof of Concept and Steps of Verification of Vulnerability</td>
                              <td>
                                {item.proofOfConcept && item.proofOfConcept.length > 0 ? (
                                  <ul>
                                    {item.proofOfConcept
                                      .filter(proof => proof.description.trim() || proof.proof.trim()) 
                                      .map((proof, index) => (
                                        <li key={proof._id}>
                                          {proof.noOfSteps} <br />
                                          {proof.description && <> {proof.description} <br /></>}
                                          {proof.proof && (
                                          <>
                                            <img 
                                              src={proof.proof} 
                                              alt={`Proof of Concept ${index + 1}`} 
                                              style={{
                                                width: 'auto',  
                                                height: 'auto', 
                                                objectFit: 'cover', 
                                                border: '1px solid #ccc',
                                                marginTop: '10px'
                                              }} 
                                            />
                                            <br />
                                          </>
                                        )}
                                        </li>
                                      ))
                                    }
                                  </ul>
                                ) : (
                                  "No Proof of Concept Available"
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ backgroundColor:"#b6dde8" }}>Recommendation</td>
                              <td>{item.recomendation}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="d-flex justify-content-end mt-3">
                {/* <Button variant="contained" color="primary" onClick={handleNextthree}>
                  Next
                </Button> */}
                <MSWordPreview 
                  fullReport={fullReport} 
                  projectDetailsReport ={projectDetailsReport}
                />
              </div>
            </div>
            
          </Typography>
        )}
         {/* {value === 3 && (
          <Typography>
            <h4>Section D Content</h4>
            <WordDocumentGenerator 
              projectDetails={projectDetailsReport} 
            />
          </Typography>
        )} */}
      </Box>
    </Box>
  );
}

export default ReportPdfGenerator;