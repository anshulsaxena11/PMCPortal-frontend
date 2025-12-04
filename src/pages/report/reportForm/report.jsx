import React, { useState, useEffect, useRef,useCallback   } from 'react';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import reportValidationSchema from '../../../validation/reportValidationSchema';
import {postReport,getVulListSpecific,searhName } from '../../../api/reportApi/reportApi'
import 'react-quill/dist/quill.snow.css'; 
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import {getDeviceList} from '../../../api/deviceListAPI/decicelistApi'
import { Table } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getVulnerabilityList } from '../../../api/vulnerabilityApi/vulnerability'
import Select from 'react-select';
import PreviewModal from "../../../components/previewfile/preview"
import { PiImagesSquareBold } from "react-icons/pi";
import { getProjectNameList, getProjectTypeList } from '../../../api/ProjectDetailsAPI/projectDetailsApi'
import {getAllRound, postAddRound} from '../../../api/roundApi/round'
import PopupForm from '../../../components/PopBoxForm/PopupBoxForm'
import { CiViewList } from "react-icons/ci";
import { IoIosSave,IoMdAdd } from "react-icons/io";
import { CgPlayListRemove } from "react-icons/cg";
import { MdOutlineAddModerator } from "react-icons/md";
import { TbPlaylistAdd } from "react-icons/tb"; 
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { FaEye } from "react-icons/fa";
import debounce from 'lodash.debounce';
import { FcDocument } from 'react-icons/fc'; 
import'./report.css'

const ReportPage = () => {
  const { control, handleSubmit, watch, formState: { errors }, setValue,getValues } = useForm({
    resolver: yupResolver(reportValidationSchema),
  
  });
  
  const [vulnerabilityOptions, setVulnerabilityOptions] = useState([]);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [showModalVul, setShowModalVul] = useState(false);
  const [showModalVulFull, setShowModalVulFull] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [ProjectType, setProjectType] = useState("");
  const [selectedVulnerabilityPoc, setSelectedVulnerabilityPoc] = useState(null);
  const [round, setRound] = useState('');
  const [addVulnerability,setAddVulnerability] = useState();
  const [device, setDevice] = useState([]);
  const [vulnerabilityData, setVulnerabilityData] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [ProjectName, setProjectName] = useState([]);
  const [selectedProjectName, setSelectedProjectName] = useState(""); 
  const [selectedProjectNameAdd,setSelectedProjectNameAdd] = useState('')
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [proofs, setProofs] = useState([]);
  const severityOptions = [
    {value:"Critical",label:"Critical"},
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "LOW", label: "LOW" },
    { value: "INFO", label: "INFO" },
  ];
  const [proofOfConcepts, setProofOfConcepts] = useState([
    { text: "", file: null, preview: null },
    { text: "", file: null, preview: null },
    { text: "", file: null, preview: null }
  ]);
  const [selectDevice, setSelectDevice] = useState([])
  const navigate = useNavigate();
  const [disableDevices, setDisableDevices] = useState("")
  const fileInputRefs = useRef([]); 
  const [roundOptions, setRoundOptions] = useState([]);
  const [showModalPoc, setShowModalPoc] = useState(false);  
  const [showModalVulList, setShowModalVulList] = useState(false); 
  const [showVulLisst,setShowVulList] = useState([])
  const roundValue = watch("round");
  const name = watch("name");
  const deviceValue = watch("device");
  const ipAddress = watch('ipAddress')
  const [filePreview, setFilePreview] = useState('');
  const [previewFileType, setPreviewFileType] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

 
 useEffect(() => {
  setValue("Path", ipAddress); // â† This would cause what you're describing
  setValue("VulnerableParameter", ipAddress); // â† This would cause what you're describing
}, [ipAddress]); 

  const savedSelectedProjectName = localStorage.getItem("selectedProjectName");
  const savedRoundValue = localStorage.getItem("roundValue");
  const savedName = localStorage.getItem("name");
  const savedSelectedProjectNameAdd = localStorage.getItem("selectedProjectNameAdd");
  const savedDeviceValue = localStorage.getItem("deviceValue");
  const savedIpAddress = localStorage.getItem("ipAddress");
  const fetchVulList = async () => {
    setLoading(true);
    try {
      const projectName = selectedProjectName || savedSelectedProjectName;
      const round = roundValue || savedRoundValue;
      const Name = name || savedName;
      const projectType = selectedProjectNameAdd || savedSelectedProjectNameAdd;
      const devices = deviceValue || savedDeviceValue;
      const ip = ipAddress || savedIpAddress;

       if (projectName || round || Name || projectType || devices || ip) {
        const response = await getVulListSpecific({
          projectName: selectedProjectName,
          projectType: selectedProjectNameAdd,
          round: roundValue,
          devices: deviceValue,
          Name: name,
          ipAddress: ipAddress,
        });
        setShowVulList(response.data); 
      }
    } catch (error) {
      console.error("Error fetching vulnerabilities:");
    } finally {
      setLoading(false);
    }
  };

  const handlePasteOnIndex = (e, index) => {
  const items = e.clipboardData?.items;
  if (items) {
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        const preview = URL.createObjectURL(file);
        const updatedProofs = [...proofs];
        updatedProofs[index] = { ...updatedProofs[index], preview, file };
        setProofs(updatedProofs);
      }
    }
  }
};

// Handles file upload from input type="file"
const handleFileUpload = (e, index) => {
  const file = e.target.files[0];
  if (file) {
    const preview = URL.createObjectURL(file);
    const updatedProofs = [...proofs];
    updatedProofs[index] = { ...updatedProofs[index], preview, file };
    setProofs(updatedProofs);
  }
};

  useEffect(() => {
    loadRounds();
  }, []);
  
  useEffect(() => {
    const fetchVulnerabilities = async () => {
      setLoading(true);  // Start loading
      try {
        if (ProjectType && (ProjectType !== "Network Devices" || selectDevice)){
          const projectType = ProjectType === 'Network Devices' && selectDevice ? selectDevice.label : ProjectType;
          const response = await getVulnerabilityList({ProjectType:projectType});
          const vulnerabilities = response.data;
          setVulnerabilityData(vulnerabilities)
  
          const options = vulnerabilities.map(vuln => ({
            value: vuln._id,  
            label: vuln.vulnerabilityTypes,  
          }));
  
          setVulnerabilityOptions(options);   
        } else {
          setVulnerabilityOptions()
        }
      } catch (error) {
        console.error('Error fetching vulnerabilities:');
      } finally {
        setLoading(false); 
      }
    };

    fetchVulnerabilities();
  }, [ProjectType,selectDevice]);

  const handleVulnerabilityChange = (selectedOption) => {
    setSelectedVulnerability(selectedOption); 
    setValue('selectedVulnerability', selectedOption.label);  
    const selectedVuln = vulnerabilityData.find((vuln) => vuln._id === selectedOption?.value);
    if (selectedVuln) {
      setValue("Description", selectedVuln.description); 
      setValue("Impact",selectedVuln.impact)
      setValue("VulnerableParameter",selectedVuln.vulnarabilityParameter)
      setValue("Referance",selectedVuln.references)
      setValue("Recomendation",selectedVuln.recommendation)
      const severityValue = severityOptions.find((option) => option.value === selectedVuln.severity);
      setValue("severity", severityValue ? severityValue.value : "");
    } else {
      setValue("Description", "");
      setValue("Impact", ""); 
      // setValue("VulnerableParameter", ""); 
      setValue("Referance", ""); 
      setValue("Recomendation", "");  
      setValue("severity", null);
    }
 
  };

  useEffect(() => {
    setValue("selectedProjectName", ""); 
    localStorage.removeItem("selectedProjectName"); 
  }, [setValue]);

  useEffect(()=>{
    const fetchDevices = async () => {
      setLoading(true)
      setError("")
      try{
        const data = await getDeviceList()
        const deviceOption = data.data
        if (deviceOption && Array.isArray(deviceOption)){
          const option = deviceOption.map((item)=>({
            value:item._id,
            label:item.devicesName
          }))
          setDevice(option)   
          } else {
            throw new Error("Unexpected data format or empty project list");
          }
      } catch(error){
        setError(`Failed to fetch project types: ${error.message}`);
        console.error("Error fetching project types:", error);
      } finally{
        setLoading(false);
      }
    };
    fetchDevices()
  },[])
  
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
        console.error("Error fetching project types:");
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
            throw new Error("Unexpected data format or empty VAPT types");
          }
        } catch (err) {
          setError(`Failed to fetch VAPT types: ${err.message}`);
          console.error("Error fetching VAPT types:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProjectTypes();
  }, [selectedProjectName]);

  const loadRounds = async () => {
    try {
      const res = await getAllRound();
      const options = res.data.data || [];
      const withAddOption = [
        ...options,
        { label: "âž• Add Round", value: "add_round", isAddOption: true },
      ];
      setRoundOptions(withAddOption);
    } catch (err) {
      console.error("Error loading rounds:", err);
    }
  };

  const addNewRound = async () => {
    try {
      const res = await postAddRound();
      loadRounds();
      toast.success(res.data.message || 'Round added successfully!');
      return res.data.data;
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add round');
        console.error(err);
        return null;
    }
  };

const handleAddStep = () => {
  setProofOfConcepts([...proofOfConcepts, { text: "", file: null, preview: null }]);
};

const handleRemoveStep = (index) => {
  setProofOfConcepts(proofOfConcepts.filter((_, i) => i !== index));
};

const handleTextChange = (index, value) => {
  if (index > 0 && !proofOfConcepts[index - 1].text.trim()) {
    toast.error(`Please fill Step ${index} before proceeding.`,{
      className: 'custom-toast custom-toast-error',
    });
    return;
  }
  const updatedProofs = [...proofOfConcepts];
  updatedProofs[index].text = value;
  setProofOfConcepts(updatedProofs);
};

const handleFileChange = (index, event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedProofs = proofOfConcepts.map((proof, i) => {
        if (i === index) {
          return {
            ...proof,
            file: file, 
            preview: reader.result, 
            fileType: file.type 
          };
        }
        return proof;
      });

      setProofOfConcepts(updatedProofs);
    };
    reader.readAsDataURL(file);
  }
};
  

  const handleFormSubmit = async (data) =>{
    const formattedProofOfConcept = proofOfConcepts.map((proof, index) => ({
      noOfSteps: `Step ${index + 1}`,
      description: proof.text,
      proof: proof.file ? proof.file : "",
    }));

    const payload={
      projectName:data.selectedProjectName,
      projectType:data.ProjectType,
      Name:data.name,
      ipAddress:data.ipAddress,
      round:data.round,
      vulnerabilityName:data.selectedVulnerability,
      sevirty:data.severity,
      description:data.Description,
      path:data.Path,
      impact:data.Impact,
      vulnerableParameter:data.VulnerableParameter,
      references:data.Referance,
      recomendation:data.Recomendation,
      proofOfConcept: formattedProofOfConcept,
      devices:selectDevice?.label || null,
      proof: formattedProofOfConcept.map((item) => item.proof),
    }
    
    setLoading(true);
    try{
    await postReport(payload);
      setValue("selectedVulnerability", null);
      // setValue("ProjectType",null);
      setValue("Description", "");
      setValue("Impact", "");
      // setValue("device",null)
      setValue("VulnerableParameter", "");
      setValue("Referance", "");
      setValue("Recomendation", "");
      setValue("severity", null);
      // setValue("selectedProjectName", null)
      // setValue("Path","")
      // setValue("round",null)
      setRoundOptions(null)
      setSelectedVulnerability(null);
      // setSelectDevice(null);
      setShowModalVul(false)
      setProofOfConcepts([
        { text: "", file: null, preview: null },
        { text: "", file: null, preview: null },
        { text: "", file: null, preview: null }
      ]);
      fileInputRefs.current.forEach((input) => {
        if (input) input.value = "";
      });
      toast.success('Form submitted successfully!', {
        className: 'custom-toast custom-toast-success',
      });
      fetchVulList()
    } catch(error){
      const message = error?.response?.data?.message || "Something went wrong";
      toast.error(message, {
        className: 'custom-toast custom-toast-error',
      });
    }
    setLoading(false);
  }
  const handleDevice = (selected) =>{
    setValue("selectedVulnerability", null);
    setValue("Description", "");
    setValue("Impact", "");
    // setValue("VulnerableParameter", "");
    setValue("Referance", "");
    setValue("Recomendation", "");
    setValue("severity", null);
    setSelectedVulnerability(null);
    setSelectDevice(selected)
    const selectedOption = selected.label
    setValue("device",selectedOption)
  }

  const handleButtonClick = (e) => {
    e.preventDefault();
      handleSubmit(handleFormSubmit)();
  };
 
  const handleround=(selected)=>{
    if (selected?.isAddOption) {
      addNewRound();
    } else {
      setValue("round",selected.value)
    }
  }

  useEffect(() => {
    if (ProjectName) {
      setProjectName(ProjectName);
    }
  }, [ProjectName]);
  
  const handleBackClick = ()=>{
    navigate(`/report`) 
  }


 const handleShowModal = () => {
  const selectedProject = getValues("selectedProjectName");
  const selectedRound = getValues("round");
  const selectedDevice = getValues("device");
  const selectedProjectType = getValues("ProjectType");
  const enteredName = getValues("name");
  const ipAddress = getValues('ipAddress')
    if (selectedProject && selectedRound && selectedDevice && selectedProjectType === 'Network Devices' && enteredName && ipAddress) {
      setShowModalVul(true);
    } 
    else if(selectedProject && selectedRound && selectedProjectType !== 'Network Devices'){
      setShowModalVul(true);
    }
    else {
      toast.error('All field must be filed', {
        className: 'custom-toast custom-toast-error',
      });
    }
  }

  const handleShowModalVulList =()=>{
    const selectedProject = getValues("selectedProjectName");
    const selectedRound = getValues("round");
    const selectedDevice = getValues("device");
    const selectedProjectType = getValues("ProjectType");
    const enteredName = getValues("name");
    const ipAddress = getValues('ipAddress')
    if (selectedProject && selectedRound && selectedDevice && selectedProjectType && enteredName && ipAddress) {
      fetchVulList()
      setShowModalVulList(true)
    }
    else{
      toast.error('All field must be filed', {
        className: 'custom-toast custom-toast-error',
      });
    }
  }
  const handleShowModalVulListFull =(vulnerabilityName)=>{
    setSelectedVulnerabilityPoc(vulnerabilityName)
    setShowModalVulFull(true)
  }
  useEffect(() => {
  const handlePaste = (e) => {
    const clipboardItems = e.clipboardData.items;
    for (const item of clipboardItems) {
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        const url = URL.createObjectURL(blob);
        // Add pasted image to the last step (or first empty)
        setProofOfConcepts((prev) => {
          const updated = [...prev];
          const targetIndex = updated.findIndex((p) => !p.preview);
          if (targetIndex !== -1) {
            updated[targetIndex] = { ...updated[targetIndex], file: blob, preview: url };
          } else {
            updated.push({ text: "", file: blob, preview: url });
          }
          return updated;
        });
        break;
      }
    }
  };

  document.addEventListener("paste", handlePaste);
  return () => document.removeEventListener("paste", handlePaste);
}, []);

  const handleCloseModal = () => setShowModalVulList(false);

  const handleCloseModelFull = () => setShowModalVulFull(false)

  const handleDeleteImage = (indexToDelete) => {
  const updatedProofs = [...proofOfConcepts];
  if (updatedProofs[indexToDelete]) {
    updatedProofs[indexToDelete].preview = null; // or undefined
  }
  setProofOfConcepts(updatedProofs);
};

const handlePreviewClick = (url) => {
    const fileType = getFileTypeFromUrl(url);
    setFilePreview(url); // Directly set the URL for preview
    setPreviewFileType(fileType);
    setShowModalPoc(true);
  };

  const getFileTypeFromUrl = (url) => {
    const extension = url?.split('.').pop(); 

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image/'; 
    } else if (extension === 'pdf') {
      return 'application/pdf'; 
    } else {
      return 'unknown';
    }
  };

const handleDropOnIndex = (e, targetIndex) => {
  e.preventDefault();
  setIsDragging(false);

  const files = e.dataTransfer.files;
  if (files.length === 0) return;

  const file = files[0];
  if (file.type.startsWith("image/")) {
    const url = URL.createObjectURL(file);
    setProofOfConcepts((prev) => {
      const updated = [...prev];
      updated[targetIndex] = { ...updated[targetIndex], file, preview: url };
      return updated;
    });
  }
};

 const fetchSuggestions = useCallback(
    debounce(async (value) => {
      if (!value.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const results = await searhName  ({ search: value });
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  
  return (
    <div className="report-page">
     <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
     <PreviewModal 
        show={showModalPoc} 
        onHide={() => setShowModalPoc(false)} 
        preview={filePreview} 
        fileType={previewFileType} 
      />
     <PopupForm show={showModalVulList} handleClose={handleCloseModal} title="Vulnerability List" showFooter={false}  dialogClassName="modal-xl" dimmed={showModalVulFull}>
        <div>
          {showVulLisst.length > 0 ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto',maxWidth:'1200px'}}>
                <Table striped bordered hover responsive style={{ maxWidth: '1200px', margin: 'auto' }}>
                  <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Vulnerability Name</th>
                        <th>severity</th>
                        <th>Description</th>
                        <th>Path</th>
                        <th>Impact</th>
                        <th>Vulnerable Parameter</th>
                        <th>Referance</th>
                        <th>Recomendation</th>
                        <th>Proof Of Concept</th>
                      </tr>
                  </thead>
                  <tbody>
                    {showVulLisst.map((vulnerabilityName, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{vulnerabilityName.vulnerabilityName}</td>
                        <td>{vulnerabilityName.sevirty}</td>
                        <td>{vulnerabilityName.description}</td>
                        <td>{vulnerabilityName.path}</td>
                        <td>{vulnerabilityName.impact}</td>
                        <td>{vulnerabilityName.vulnerableParameter}</td>
                        <td>{vulnerabilityName.references}</td>
                        <td>{vulnerabilityName.recomendation}</td>
                        <td><FaEye style={{ cursor: 'pointer' }} onClick={()=>handleShowModalVulListFull(vulnerabilityName)}/></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
            </div>
          ):(
            <p>No Vulnerability mapped for this project.</p>
          )}
        </div>
     </PopupForm>
      <PopupForm show={showModalVulFull} handleClose={handleCloseModelFull} title="Proof Of Concept" showFooter={false} dialogClassName="modal-xl" >
         {selectedVulnerabilityPoc?.proofOfConcept?.length > 0 ? (
          <Table bordered hover>
            <thead>
              <tr>
                <th>No. of Steps</th>
                <th>Description</th>
                <th>Proof</th>
              </tr>
            </thead>
            <tbody>
              {selectedVulnerabilityPoc.proofOfConcept.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.noOfSteps || "N/A"}</td>
                  <td>{item.description || "N/A"}</td>
                  <td>
                    {item.proof ? (
                      <a href="#" onClick={(e) => {e.preventDefault();handlePreviewClick(item.proof);}}className="btn btn-link">
                        {getFileTypeFromUrl(item.proof).startsWith("image/") ? (
                          <PiImagesSquareBold style={{ marginRight: "8px" }} />
                        ) : (
                          <FcDocument style={{ marginRight: "8px" }} />
                        )}
                        Preview
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No Proof of Concept available.</p>
        )}
      </PopupForm>
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
          Vulnerabilities
        </Typography>
      </Box>
     </div>
      <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}/>
      <div className="container-fluid">
        <div className="row">
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-sm-6 col-md-6 col-lg-6">
              <Form.Group className="mb-3" controlId="ProjectType">
                <Form.Label className="fs-5 fw-bolder">Project Name<span className="text-danger">*</span></Form.Label>
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
                        setValue("selectedVulnerability", null);
                        setValue("ProjectType",null);
                        setValue("Description", "");
                        setValue("Impact", "");
                        // setValue("VulnerableParameter", "");
                        setValue("Referance", "");
                        setValue("Recomendation", "");
                        setValue("severity", null);
                        setSelectedVulnerability(null);
                        field.onChange(selectedOption?.value); 
                        setSelectedProjectName(selectedOption?.value); 
                      }}
                    />
                  )}
                />
                {errors.selectedProjectName && <p className="text-danger">{errors.selectedProjectName.message}</p>}
              </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Round<span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="round"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={roundOptions?.find((option) => option.value === field.value)}
                        options={roundOptions}
                        placeholder="Select Round"
                        onChange={handleround}
                      />
                    )}
                  />
                  {errors.round && <p className="text-danger">{errors.round.message}</p>}
                </Form.Group>
                {disableDevices === "Network Devices" && (
                <Form.Group>
                    <Form.Label className="fs-5 fw-bolder">Devices Name<span className="text-danger">*</span>
                    </Form.Label>
                      <Controller
                      name="name"
                      control={control}
                      rules={{ required: 'Device name is required' }}
                      render={({ field }) => (
                        <div style={{ position: 'relative' }}>
                          <input
                            {...field}
                            className="form-control"
                            placeholder="Enter Name"
                            autoComplete="off"
                            onChange={(e) => {
                              field.onChange(e);
                              fetchSuggestions(e.target.value);
                            }}
                            onBlur={() => {
                              // Delay hiding suggestions so click works
                              setTimeout(() => setShowSuggestions(false), 200);
                            }}
                            onFocus={() => {
                              if (suggestions.length) setShowSuggestions(true);
                            }}
                          />

                          {showSuggestions && suggestions.length > 0 && (
                            <ul
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: 'white',
                                border: '1px solid #ccc',
                                maxHeight: '150px',
                                overflowY: 'auto',
                                margin: 0,
                                padding: 0,
                                listStyle: 'none',
                                zIndex: 9999,
                              }}
                            >
                              {suggestions.map((item, idx) => (
                                <li
                                  key={idx}
                                  style={{ padding: '8px', cursor: 'pointer' }}
                                  onMouseDown={() => {
                                    field.onChange(item.Name || item.name || ''); // adapt to your API response
                                    setShowSuggestions(false);
                                  }}
                                >
                                  {item.Name || item.name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    />
                      {errors.name && <p className="text-danger">{errors.name.message}</p>}
                  </Form.Group>
                )}
                
              </div>
              <div className="col-sm-6 col-md-6 col-lg-6">
              <Form.Group className="mb-3">
                <Form.Label className="fs-5 fw-bolder">Project Type<span className="text-danger">*</span></Form.Label>
                <Controller
                  name="ProjectType"
                  control={control}
                  rules={{ required: "Project Type is required" }} 
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={selectedTypes.find(type => type === field.value) ? { value: field.value, label: field.value } : null} // Ensure selected value is structured correctly
                      options={selectedTypes.map(type => ({
                        value: type,  
                        label: type,  
                      }))}
                      isLoading={loading}
                      isSearchable
                      placeholder="Select Project Type"
                      onChange={(selectedOption) => {
                        const selection = selectedOption ? selectedOption.label : "";
                        setValue("selectedVulnerability", null);
                        setValue("Description", "");
                        // setValue("device",null)
                        setValue("Impact", "");
                        // setValue("VulnerableParameter", "");
                        setValue("Referance", "");
                        setValue("Recomendation", "");
                        setValue("severity", null);
                        setSelectedVulnerability(null);
                        field.onChange(selection);
                        setProjectType(selection);
                        setDisableDevices(selection);
                        setSelectedProjectNameAdd(selectedOption?.label)
                        setValue("ProjectType",selectedOption.label)
                      }}
                    />
                  )}
                />
                {errors.ProjectType && <p className="text-danger">{errors.ProjectType.message}</p>}
              </Form.Group>
              {disableDevices === "Network Devices" && (
                  <Form.Group>
                    <Form.Label className="fs-5 fw-bolder">Devices<span className="text-danger">*</span>
                    </Form.Label>
                    <Controller
                      name="device"
                      control={control}
                      rules={{ required: disableDevices === "Network Devices" ? "Device is required" : false }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          id="device"
                          options={device}
                          value={selectDevice}
                          onChange={handleDevice}
                          isLoading={loading}
                          isSearchable={true}
                          onInputChange={(newValue) => setSearchQuery(newValue)}
                        />
                      )}
                    />
                      {errors.device && <p className="text-danger">{errors.device.message}</p>}
                  </Form.Group>
                )}
                   {disableDevices === "Network Devices" && (
                <Form.Group>
                    <Form.Label className="fs-5 fw-bolder pt-3">IP Address<span className="text-danger">*</span>
                    </Form.Label>
                     <Controller
                        name="ipAddress"
                        control={control}
                        render={({field})=>(
                          <input {...field} className="form-control"  placeholder="Enter IPAddress"/>
                        )}
                      />
                      {errors.ipAddress && <p className="text-danger">{errors.ipAddress.message}</p>}
                  </Form.Group>
                   )}
              </div>
            </div>
            <div className="row">
              <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 4, 
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleShowModalVulList}
                    startIcon={<CiViewList />}
                    sx={{
                      paddingX: 3,
                      paddingY: 0.5,
                      fontWeight: 'bold',
                      borderRadius: 3,
                      fontSize: '1rem',
                      letterSpacing: '0.5px',
                      boxShadow: 3,
                    }}
                  >
                   List Of Vulnerability
                  </Button>
  
                  {/* SAVE Button on the right */}
                   {!showModalVul && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleShowModal}
                      disabled={loading}
                      startIcon={!loading && <MdOutlineAddModerator  />}
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
                     Add Vulnerability
                    </Button>

                   )}
                </Box>
            </div>
            {showModalVul && (
            <div className="row pt-5">
              <div className='col-sm-6 col-md-6 col-lg-6'>
                  <Form.Group className="mb-3">
                  {/* <div className='row'>
                    <div className='col-sm-10 col-md-10 col-lg-10'> */}
                  <Form.Label className={`fs-5 fw-bolder ${disableDevices === "Network Devices" ? "pt-3" : ""}`}>Vulnerability Name/Type<span className="text-danger">*</span></Form.Label>
                      <Controller
                        name="selectedVulnerability"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            id="vulnerability"
                            options={vulnerabilityOptions}
                            value={selectedVulnerability}  
                            onChange={handleVulnerabilityChange}  
                            placeholder="Select a vulnerability"
                            isSearchable={true}
                            onInputChange={(newValue) => setSearchQuery(newValue)}
                            isLoading={loading}
                          />
                        )}
                      />
                      {errors.selectedVulnerability && <p className="text-danger">{errors.selectedVulnerability.message}</p>} 
                      {/* </div>
                      <div className='col-sm-2 col-md-2 col-lg-2'>
                          <Button variant="success" className="button-middle" onClick={handleShow}><IoMdAdd className="fs-3" /></Button>
                      </div>
                    </div> */}
                  </Form.Group>
              </div>
              <div className='col-sm-6 col-md-6 col-lg-6'>
                  <Form.Group className="mt-3">
                  <Form.Label className="fs-5 fw-bolder">Severity<span className="text-danger">*</span></Form.Label>
                  <Controller
                  name="severity"
                  control={control}
                  render={({field})=>(
                    <Form.Control  {...field}
                      className='form-control'
                      placeholder="Enter Severity"
                      readOnly
                      disabled
                  />
                  )}
                />
                   {errors.severity && <p className="text-danger">{errors.severity.message}</p>}
                </Form.Group>
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="fs-5 fw-bolder">Description<span className="text-danger">*</span></Form.Label>
                <Controller
                  name="Description"
                  control={control}
                  render={({field})=>(
                    <textarea  {...field}
                      className='form-control'
                      placeholder="Enter Description"
                  />
                  )}
                />
                {errors.Description && <p className="text-danger">{errors.Description.message}</p>}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fs-5 fw-bolder">Location<span className="text-danger">*</span></Form.Label>
                <Controller
                  name="Path"
                  control={control}
                  render={({field})=>(
                    <textarea  {...field}
                      className='form-control'
                      placeholder="Enter Path"
                  />
                  )}
                />
                {errors.Path && <p className="text-danger">{errors.Path.message}</p>}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fs-5 fw-bolder">Impact<span className="text-danger">*</span></Form.Label>
                <Controller
                  name="Impact"
                  control={control}
                  render={({field})=>(
                    <textarea  {...field}
                      className='form-control'
                      placeholder="Enter Impact"
                  />
                  )}
                />
                {errors.Impact && <p className="text-danger">{errors.Impact.message}</p>}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fs-5 fw-bolder">Vulnerable Parameter<span className="text-danger">*</span></Form.Label>
                <Controller
                  name="VulnerableParameter"
                  control={control}
                  render={({field})=>(
                    <textarea  {...field}
                      className='form-control'
                      placeholder="Enter Vulnerable Parameter"
                  />
                  )}
                />
                {errors.VulnerableParameter && <p className="text-danger">{errors.VulnerableParameter.message}</p>}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fs-5 fw-bolder">References (CVE/ Bug / OWASP 2017)<span className="text-danger">*</span></Form.Label>
                <Controller
                  name="Referance"
                  control={control}
                  render={({field})=>(
                    <textarea  {...field}
                      className='form-control'
                      placeholder="Enter Referance"
                  />
                  )}
                />
                {errors.Referance && <p className="text-danger">{errors.Referance.message}</p>}
              </Form.Group>
              <Form.Group className="mb-3" controlId="ProofOfConcept">
              <Form.Label className="fs-5 fw-bolder">Proof Of Concept<span className="text-danger">*</span></Form.Label>
              <div className="container-fluid border py-4" style={{ maxHeight: "350px", overflowY: "auto" }}>
                {proofOfConcepts.map((proof, index) => (
                  <div className="row mb-3" key={index}>
                    <div className="col-12 d-flex justify-content-between align-items-center">
                      <Form.Label className="fs-6 fw-bolder">Step {index + 1}</Form.Label>
                      {proofOfConcepts.length > 3 && (

                        <Button
                          color="error"
                          variant="contained"
                          disabled={loading}
                          size="small"
                          startIcon={!loading && <CgPlayListRemove  />}
                          onClick={() => handleRemoveStep(index)}
                          className="mt-2"
                        >Remove</Button>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter Proof Of Concept"
              value={proof.text}
              onChange={(e) => handleTextChange(index, e.target.value)}
              style={{
                resize: "none",
                borderRadius: "8px",
                borderColor: "#ccc",
                backgroundColor: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            />
          </div>
          <div className="col-md-6">
            {proof.preview ? (
              <div
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  height: "210px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  padding: "6px",
                  background: "#f9f9f9",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={proof.preview}
                  alt={`Pasted ${index}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: "4px",
                    backgroundColor: "white",
                  }}
                />
                <button
                  onClick={() => handleDeleteImage(index)}
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                    lineHeight: "20px",
                    textAlign: "center",
                  }}
                  title="Remove"
                >
                  &times;
                </button>
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "100px",
                  border: "2px dashed #ccc",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                  backgroundColor: "#f8f9fa",
                  transition: "border-color 0.2s ease-in-out, background-color 0.2s",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnIndex(e, index)}
              >
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onPaste={(e) => handlePasteOnIndex(e, index)}
                  style={{
                    outline: "none",
                    width: "100%",
                    textAlign: "center",
                    color: "#888",
                    fontStyle: "italic",
                    userSelect: "none",
                    cursor: "text",
                  }}
                  title="Click here and press Ctrl+V or Right Click â†’ Paste"
                >
                  Paste or Drag Image Here
                </div>
              </div>
            )}
          </div>

{/* <div className="col-md-6">
  {proof.preview ? (
    <div
      style={{
        width: "100%",
        maxWidth: "300px",
        height: "200px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        padding: "6px",
        background: "#f9f9f9",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={proof.preview}
        alt={`Pasted ${index}`}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          borderRadius: "4px",
          backgroundColor: "white",
        }}
      />
      <button
        onClick={() => handleDeleteImage(index)}
        style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px",
          lineHeight: "20px",
          textAlign: "center",
        }}
        title="Remove"
      >
        &times;
      </button>
    </div>
  ) : (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        height: "100px",
        border: "2px dashed #ccc",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "#666",
        backgroundColor: "#f8f9fa",
        transition: "border-color 0.2s ease-in-out, background-color 0.2s",
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDropOnIndex(e, index)}
    >
      <div
        contentEditable
        suppressContentEditableWarning={true}
        onPaste={(e) => handlePasteOnIndex(e, index)}
        style={{
          outline: "none",
          width: "100%",
          textAlign: "center",
          color: "#888",
          fontStyle: "italic",
          userSelect: "none",
          cursor: "text",
        }}
        title="Click here and press Ctrl+V or Right Click â†’ Paste"
      >
        Paste (Ctrl+V or Right Click â†’ Paste), Drag or Upload Image
      </div>

  
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileUpload(e, index)}
        style={{ display: "none" }}
        id={`file-upload-${index}`}
      />
      <label
        htmlFor={`file-upload-${index}`}
        style={{
          marginTop: "8px",
          padding: "4px 10px",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "4px",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        Upload Image
      </label>
    </div>
  )}
</div> */}
                    {/* <div className="col-md-6">
                      <Form.Control
                        as="textarea"
                        placeholder="Enter Proof Of Concept"
                        value={proof.text}
                        onChange={(e) => handleTextChange(index, e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                        {proof.preview ? (
                          <div
                            style={{
                              width: "100%",
                              maxWidth: "300px",
                              height: "200px",
                              borderRadius: "6px",
                              border: "1px solid #ccc",
                              padding: "6px",
                              background: "#f9f9f9",
                              position: "relative",
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <img
                              src={proof.preview}
                              alt={`Pasted ${index}`}
                              style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                                borderRadius: "4px",
                                backgroundColor: "white",
                              }}
                            />
                            <button
                              onClick={() => handleDeleteImage(index)}
                              style={{
                                position: "absolute",
                                top: "6px",
                                right: "6px",
                                background: "red",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "16px",
                                lineHeight: "20px",
                                textAlign: "center",
                              }}
                              title="Remove"
                            >
                              &times;
                            </button>
                          </div>
                    ) : (
                       <div
                        style={{
                          width: "700px",
                          maxWidth: "400px",
                          height: "65px",
                          border: "2px dashed #ccc",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#888",
                          backgroundColor: "#f8f9fa",
                          fontStyle: "italic",
                          textAlign: "center",
                        }}
                      >
                       <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropOnIndex(e, index)}
                        onDragEnter={() => setIsDragging(true)}
                        onDragLeave={() => setIsDragging(false)}
                        style={{
                          width: "700%",
                          maxWidth: "700px",
                          height: "65px",
                          border: isDragging ? "2px dashed #007bff" : "2px dashed #ccc",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#888",
                          backgroundColor: isDragging ? "#e6f7ff" : "#f8f9fa",
                          fontStyle: "italic",
                          textAlign: "center",
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <p className="m-0">Paste or Drag Image Here</p>
                      </div>

                      </div>
                    )}
                    </div> */}
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Button
                  color="success"
                  variant="contained"
                  size="small"
                  onClick={handleAddStep}
                  disabled={loading}
                  startIcon={!loading && <TbPlaylistAdd  />}
                >ADD</Button>
              </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fs-5 fw-bolder">Recommendation<span className="text-danger">*</span></Form.Label>
                <Controller
                  name="Recomendation"
                  control={control}
                  render={({field})=>(
                    <textarea  {...field}
                      className='form-control'
                      placeholder="Enter Recomendation"
                  />
                  )}
                />
                {errors.Recomendation && <p className="text-danger">{errors.Recomendation.message}</p>}
              </Form.Group>
            </div>
            )}
            {showModalVul && (
              <>

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
            )}
          </Form>
            {selectedProjectNameAdd && selectedProjectNameAdd !== "Network Devices" && (
              <h4 className="fw-bold text-danger mb-3">
               Currently under development
              </h4>
            )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
