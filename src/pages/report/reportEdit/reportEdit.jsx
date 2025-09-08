import React, { useState, useEffect } from "react";
import Select from "react-select";
import { updateReport, deleteReportBYId,editupdateReport } from "../../../api/reportApi/reportApi";
import { getProjectNameList, getProjectTypeList } from "../../../api/ProjectDetailsAPI/projectDetailsApi";
import { Form, Button, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { useForm, Controller } from "react-hook-form";
import { getVulnerabilityList } from '../../../api/vulnerabilityApi/vulnerability'
import {getDeviceList} from '../../../api/deviceListAPI/decicelistApi' 
import { TiArrowBack } from "react-icons/ti";
import { FaEdit } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import './reportEdit.css'

const EditReportForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [projectOptions, setProjectOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [error, setError] = useState(null);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedProjectType, setSelectedProjectType] = useState();
    const [vulnerabilityOptions, setVulnerabilityOptions] = useState([]);
    const [selectedVulnerability, setSelectedVulnerability] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [proofOfConcepts, setProofOfConcepts] = useState([]);
    const [proofs, setProofs] = useState([{ proofPreviwe: null }]);
    const [isUserSelection, setIsUserSelection] = useState(false); 
    const [data , setData] = useState(false);
    const [isUserTypeSelection, setIsUserTypeSelection] = useState(false);
    const [isUserProjectSelection, setIsUserProjectSelection] = useState(false); 
    const [isSeveity, setIsSeveity] =  useState(false)
    const [isUserDevice, setIsUserDevice] = useState(false)
    const [isvernabilitySelection, setIsVernabilitySelection] = useState(false);
    const [selctedType, setSelectedType] = useState()
    const [selectvurnavility, setSelectVurnability] = useState()
    const [showPreview, setShowPreview] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [firstTimeTypeUsed, setFirstTimeTypeUsed] = useState(true);
    const [firstTimeVulnarabilityUsed, setFirstTimeVulnabilityUsed] = useState(true);
    const [selectSecondVulnability, setselectSecondVulnability] = useState(true);
    const [selectedVulnabiliyuType, setSelectedVulnabiliyuType] = useState();
    const [device, setDevice] = useState([]);
    const [selectDevice, setSelectDevice] = useState([])
    const [vulnerabilityData, setVulnerabilityData] = useState([]);
    const [selectedDeviceVulnability, setSElectedDeviceVulnability] = useState();
    const MySwal = withReactContent(Swal);
     
    const roundOptions = [
        { value: "", label: "Select Round", isDisabled: true },
        { value: "1", label: "Round 1" },
        { value: "2", label: "Round 2" },
        { value: "3", label: "Round 3" },
        { value: "4", label: "Round 4" },
        { value: "add", label: "Add Round" }, 
    ];

    const sevirtyOptions =[
        {value:"", label: "Select Sevirity", isDisabled: true},
        {value:"Critical",label:"Critical"},
        {value:"High", label: "High"},
        {value:"Medium", label: "Medium"},
        {value:"LOW", label: "LOW"},
        {value:"INFO", label: "INFO"},
    ]

    const [selectedRound, setSelectedRound] = useState(null);
    const [selectedSevirity, setSelectSevirity] = useState(null)
    const { register, handleSubmit, setValue, reset, getValues, watch } = useForm();
    const [deviceVulnability,setDeviceVulnability] = useState()
    const [devicesData, setDevicesData] = useState();
    const [showModal, setShowModal] = useState(false);
    const [filePreview, setFilePreview] = useState('');
    const [previewFileType, setPreviewFileType] = useState('');
    const ipAddress = watch("ipAddress");
    
    useEffect(() => {
        setValue("path", ipAddress); 
        setValue("vulnerableParameter", ipAddress);
    }, [ipAddress, setValue]); 

    const handleBackClick = () => {
        navigate(`/report`);
    };

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
        const fetchReport = async () => {
            try {
                const response = await editupdateReport(id);
                const fetchedData = response?.data?.reportDetails;
                setDevicesData(fetchedData?.devices);
                setValue("description", fetchedData?.description||"");
                setValue("impact", fetchedData?.impact||"");
                setValue("vulnerableParameter", fetchedData?.vulnerableParameter||"");
                setValue("references", fetchedData?.references||"");
                setValue("recomendation", fetchedData?.recomendation||"");
                setValue("Name", fetchedData?.Name||"");
                setValue("ipAddress", fetchedData?.ipAddress||"");
                setValue("path", fetchedData?.path||"");
                setProofOfConcepts(
                    Array.isArray(fetchedData?.proofOfConcept)
                        ? fetchedData.proofOfConcept.map((item, index) => ({
                              noOfSteps: String(index + 1),
                              description: item.description || "",
                              proof: item.proof || "",
                              proofPreviwe:item.proofPreviwe
                          }))
                        : []
                );
                
                if (!isUserSelection && fetchedData?.projectName && projectOptions.length > 0) {
                      const selectedProjectName = Array.isArray(fetchedData.projectName)
                        ? fetchedData.projectName
                        : [fetchedData.projectName];
    
                    const matchedProjectName = selectedProjectName
                        .map((type) => projectOptions.find((item) => item.label=== type))
                        .filter(Boolean);
                    const matchPt = matchedProjectName[0].value
                    
                    setSelectedType(matchPt)
    
                    setSelectedOptions(matchedProjectName);
                    setValue("projectName",fetchedData?.projectName)
                }

                if(!isUserDevice && fetchedData?.devices && device.length> 0 ){
                   setDeviceVulnability(fetchedData?.devices)
                   const selectedDevice = Array.isArray(fetchedData?.devices)
                   ? fetchedData?.devices : [fetchedData?.devices]

                   const matchedDeviceName =selectedDevice.map((type) =>device.find((item)=> item.label === type))
                   .filter(Boolean)
                   setSelectDevice(matchedDeviceName)
                   setValue("devices",fetchedData?.devices)
                }

                if (!isvernabilitySelection && fetchedData?.vulnerabilityName && vulnerabilityOptions.length > 0) {
                    const matchedvulnabilityName = vulnerabilityOptions.find(
                        (item) => item.label === fetchedData?.vulnerabilityName
                    );
            
                    if (
                        (!isUserTypeSelection && fetchedData?.projectType === selectedVulnabiliyuType || selectedVulnabiliyuType === undefined) &&
                        matchedvulnabilityName
                    ) {
                        setSelectedVulnerability(matchedvulnabilityName);
                    } else {
                        setSelectedVulnerability(null);
                    }
                    setValue("vulnerabilityName",fetchedData?.vulnerabilityName )
                }

                if (!isUserProjectSelection && fetchedData?.projectType && selectedTypes.length > 0) {
                    setSelectVurnability(fetchedData?.projectType)
                    const selectedProjectType = Array.isArray(fetchedData.projectType)
                        ? fetchedData.projectType
                        : [fetchedData.projectType];
                    const matchedType = selectedProjectType
                        .map((type)=>selectedTypes.find((item) => item.label === type));
                    setSelectedProjectType(matchedType);
                    setValue("projectType",fetchedData?.projectType)
                }
                
                if (fetchedData?.round && roundOptions.length > 0) {
                    const selectRound = Array.isArray(fetchedData.round) ? fetchedData.round : [fetchedData.round];
                    const matchedRound = selectRound
                        .map((round) => roundOptions.find((item) => item.value === round))
                        .filter(Boolean);
    
                    setSelectedRound(matchedRound);
                    setValue("round",fetchedData?.round)
                }

                if (!isSeveity && fetchedData?.sevirty && sevirtyOptions.length > 0) {
                    const selectSevirity = Array.isArray(fetchedData.sevirty) ? fetchedData.sevirty : [fetchedData.sevirty];
                    const matchedRound = selectSevirity
                        .map((sevirty) => sevirtyOptions.find((item) => item.value === sevirty))
                        .filter(Boolean);
    
                        setSelectSevirity(matchedRound);
                        setValue("sevirty", fetchedData?.sevirty);
                }

                
            } catch (error) {
                toast.error("Failed to fetch report details");
            }
        };
    
        if (id) fetchReport();
    }, [id, reset, setValue, projectOptions, selectedTypes, vulnerabilityOptions, isUserSelection, isUserTypeSelection,selectedVulnabiliyuType, device, isUserDevice]); 
    
    useEffect(() => {
        const fetchVulnerabilities = async () => {
          setLoading(true);  // Start loading
          try {
            if (firstTimeVulnarabilityUsed ? selectvurnavility : selectedVulnabiliyuType || selectedDeviceVulnability){
                let ProjectType;
                if(selectSecondVulnability){
                     if (selectvurnavility === 'Network Devices' && deviceVulnability !== undefined){
                        ProjectType = firstTimeVulnarabilityUsed ? deviceVulnability : selectedDeviceVulnability;
                    }else{
                        ProjectType= firstTimeVulnarabilityUsed ? selectvurnavility : selectedVulnabiliyuType;
                    }
                }else{
                    if(selectedDeviceVulnability === 'undefined' || selectedVulnabiliyuType ==='Network Devices' ){
                        ProjectType = firstTimeVulnarabilityUsed ? deviceVulnability : selectedDeviceVulnability;
                    }else{
                        ProjectType= firstTimeVulnarabilityUsed ? selectvurnavility : selectedVulnabiliyuType;
                    }   
                }
                if (ProjectType) {
                    const response = await getVulnerabilityList({ProjectType:ProjectType});  
                    const vulnerabilities = response.data;
                    setVulnerabilityData(response.data)
    
                    const options = vulnerabilities.map(vuln => ({
                    value: vuln._id,  
                    label: vuln.vulnerabilityTypes,  
                    }));
    
                    setVulnerabilityOptions(options);
                    setFirstTimeVulnabilityUsed(false)

                }
            }
          } catch (error) {
            console.error('Error fetching vulnerabilities:', error);
          } finally {
            setLoading(false); 
          }
        };
    
        fetchVulnerabilities();
      }, [selectedVulnerability, selectvurnavility, selectedVulnabiliyuType,deviceVulnability, selectedDeviceVulnability]);

    useEffect(() => {
        const fetchProjectNames = async () => {
            try {
                const response = await getProjectNameList();
                const projectName = response?.data;
    
                if (projectName && Array.isArray(projectName)) {
                    const options = projectName.map((item) => ({
                        value: item._id,
                        label: item.projectName,
                    }));
                    setProjectOptions(options);
                } else {
                    throw new Error("Unexpected data format or empty project name list");
                }
            } catch (error) {
                toast.error("Failed to load project names");
            }
        };
    
        fetchProjectNames();
    }, []);

    useEffect(() => {
        const fetchProjectTypes = async () => {
            setLoading(true);
            setError("");
    
            try {
                const selectedProjectValue = firstTimeTypeUsed ? selctedType : selectedOptions.value;
                const data = await getProjectTypeList(selectedProjectValue);
    
            
    
                if (data?.statusCode === 200 && Array.isArray(data.data)) {
                    const formattedOptions = data.data.map((item, index) => ({
                        value: String(index),
                        label: item,
                    }));
    
                    setSelectedTypes(formattedOptions);
                    setFirstTimeTypeUsed(false)
                } else {
                    throw new Error("Unexpected data format or empty project types");
                }
            } catch (err) {
                setError(`Failed to fetch project types: ${err.message}`);
                console.error("Error fetching project types:", err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchProjectTypes();
    }, [selectedOptions, selctedType]);

 
    const handleRemoveStep = (index) => {
        const updatedSteps = proofOfConcepts.filter((_, i) => i !== index);
        setProofOfConcepts(updatedSteps);
    };

      const handleAddStep = () => {
        setProofOfConcepts([
            ...proofOfConcepts,
            { noOfSteps: String(proofOfConcepts.length + 1), description: "", proof: "" },
        ]);
    };
    
      // Handle Text Change
    const handleTextChange = (index, value) => {
        const updatedSteps = [...proofOfConcepts];
        updatedSteps[index].description = value;
        setProofOfConcepts(updatedSteps);
    };
    
      // Handle File Upload
      const handleFileChange = (index, event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "image/jpeg" && file.type !== "image/jpg") {
    alert("Only JPEG and JPG files are allowed.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const updatedProofs = [...proofOfConcepts];
    updatedProofs[index] = {
      ...updatedProofs[index],
      proof: file,
      proofPreviwe: reader.result,
    };
    setProofOfConcepts(updatedProofs);
  };
  reader.readAsDataURL(file);
};

    const handleProjectName = (selected)=>{
        setSelectedOptions(selected.label)
        setIsUserSelection(true);
        setValue("projectName", selected.value);
      
    }

    const handleRoundChange = (selected) => {
        if (selected.value === "add") {

            console.log("Add new round functionality triggered");
        } else {
            setSelectedRound(selected);
            const round = selected.value
            setValue('round',round)
        }
    };

    const handleSevirityChange = (selected) => {
        setSelectSevirity(selected)
        setIsSeveity(true)
        const sevirity = selected.label
        setValue('sevirty',sevirity)
    }

    /** Submit Form **/
    const onSubmit = async (formData) => {
        setLoading(true); 
        try {
				
				
            const formDataSubmit = new FormData()
            const sevirty = formData.sevirty || getValues('sevirty')
			const ipAddress = formData.ipAddress || getValues('ipAddress')
			const Name = formData.Name || getValues('Name')
            const description = formData.description || getValues('description')
            const path = formData.path || getValues('path')
            const impact = formData.path || getValues('impact')
            const vulnerableParameter = formData.vulnerableParameter || getValues('vulnerableParameter')
            const references = formData.references || getValues('references')
            const recomendation = formData.recomendation || getValues('recomendation')
            const vulnerabilityName  = selectedVulnerability?.label || formData.vulnerabilityName || getValues('vulnerabilityName');
            const round = formData.round || getValues('round')
            const devices = formData.devices || getValues('devices')
            const projectName = selectedOptions[0]?.value || formData.projectName || getValues("projectName");
            const projectType = selectedProjectType?.label || getValues("projectType");
           

            formDataSubmit.append('sevirty',sevirty)
			formDataSubmit.append('ipAddress',ipAddress)
			formDataSubmit.append('Name',Name)
            formDataSubmit.append('description',description)
            formDataSubmit.append('path',path)
            formDataSubmit.append('impact',impact)
            formDataSubmit.append('vulnerableParameter',vulnerableParameter)
            formDataSubmit.append('references',references)
            formDataSubmit.append('recomendation',recomendation)
            formDataSubmit.append('vulnerabilityName',vulnerabilityName)
            formDataSubmit.append('round',round)
            formDataSubmit.append('devices',devices)
            formDataSubmit.append("proofOfConcept", JSON.stringify(proofOfConcepts));
            formDataSubmit.append("projectName", projectName);
            formDataSubmit.append("projectType", projectType);
            formDataSubmit.append("vulnerabilityName", vulnerabilityName)

            proofOfConcepts.forEach((proof, index) => {
                formDataSubmit.append(`proofOfConcepts[${index}][noOfSteps]`, `Step ${index + 1}`);
                formDataSubmit.append(`proofOfConcepts[${index}][description]`, proof.text || "");
            
                if (proof.proof instanceof File) {
                    formDataSubmit.append(`proofOfConcepts[${index}][proof]`, proof.proof); // Attach file with index
                } else if (typeof proof.proof === "string" && proof.proof.trim() !== "") {
                    formDataSubmit.append(`proofOfConcepts[${index}][proof]`, proof.proof);
                }
            });
            
            await updateReport(id,formDataSubmit);
            toast.success('Form Updated successfully!', {
                className: 'custom-toast custom-toast-success',
            });

        } catch (error) {
            console.error("Error updating report:", error);
            toast.error('Failed to submit the form.',error, {
                className: 'custom-toast custom-toast-error',
            });
        }
        setLoading(false)
    };
 
    
    const handleVulnerabilityChange = (selectedOption) => {
        const selectedVuln = vulnerabilityData.find((vuln) => vuln._id === selectedOption?.value);
        setData(true)
        setIsVernabilitySelection(true)
        setSelectedVulnerability(selectedOption);
        setIsSeveity(true)
        const selectedValues = selectedOption.label;
        setValue('vulnerabilityName', selectedValues); 
        if (selectedVuln) {
            setValue('description', selectedVuln.description || ""); 
            setValue("impact",selectedVuln.impact)
            // setValue("vulnerableParameter",selectedVuln.vulnarabilityParameter)
            setValue("references",selectedVuln.references)
            setValue("recomendation",selectedVuln.recommendation)
            const severityValue = sevirtyOptions.find((option) => option.value === selectedVuln.severity);
            setSelectSevirity(severityValue);
        } else {
            setValue('description', "");
            setValue("impact", ""); 
            // setValue("vulnerableParameter", ""); 
            setValue("references", ""); 
            setValue("recomendation", "");  
            setSelectSevirity("sevirty", null);
        }  
    };

    const handleProjecType = (selectedOption) => {
        setSelectedProjectType(selectedOption); 
        setIsUserTypeSelection(true)
        setIsUserDevice(true)
        setselectSecondVulnability(false)
        setIsUserProjectSelection(true)
        const selectedString= selectedOption && selectedOption.label ? String(selectedOption.label) : '';
        setSelectedVulnabiliyuType(selectedString)
        if(selectedString !== 'Network Devices'){
            setSelectDevice(null)
        }
        setValue("projectType",selectedOption.label)
     
    };

    const handleDevice = (selected) => {
        setSelectDevice(selected)
        setIsUserDevice(true)
        const selectedValues = selected && selected.label ? String(selected.label):'';
        setSElectedDeviceVulnability(selectedValues)
        setValue("devices",selectedValues)
    }

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
    
    
      const handlePreviewClick = (url) => {
        const fileType = getFileTypeFromUrl(url);
        setFilePreview(url); // Directly set the URL for preview
        setPreviewFileType(fileType);
        setShowModal(true);
      };

  const handlePasteImage = (e, index) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (let item of items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      const reader = new FileReader();
      reader.onload = () => {
        const updatedProofs = [...proofOfConcepts];
        updatedProofs[index] = {
          ...updatedProofs[index],
          proof: file,
          proofPreviwe: reader.result,
        };
        setProofOfConcepts(updatedProofs);
      };
      reader.readAsDataURL(file);
      break;
    }
  }
};

const handleDeleteImage = (index) => {
  const updatedProofs = [...proofOfConcepts];
  updatedProofs[index] = {
    ...updatedProofs[index],
    proof: "",
    proofPreviwe: "", 
  };
  setProofOfConcepts(updatedProofs);
};

const handleDelete = async (id) => {
  const result = await MySwal.fire({
    title: 'Are you sure?',
    text: "This action cannot be undone.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });

  if (!result.isConfirmed) return;
  try {
    const response = await deleteReportBYId(id);
    console.log(response)

    if (response.statusCode === 200) {
       MySwal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: response.message,
        timer: 1500,
        showConfirmButton: false,
      });
    navigate(`/report`);

    } else {
       MySwal.fire({
        icon: 'error',
        title: 'Error!',
        text: response.message,
      });
    }
  } catch (error) {
     toast.error(error, {
        className: 'custom-toast custom-toast-error',
    });
  }
};

    return (
        <div className="container">
            <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <div className="row">
                <div className="col-sm-10 col-md-10 col-lg-10">
                    <h1>Edit Vulnerability</h1>
                </div>
                <div className="col-sm-2 col-md-2 col-lg-2">
                    <Button variant="danger" onClick={handleBackClick}><TiArrowBack />BACK</Button>
                </div>
            </div>
            <hr />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                    <div className="col-sm-6">
                        <Form.Group>
                              <Form.Label className="fs-5 fw-bolder pt-3">Project Name<span className="text-danger">*</span></Form.Label> 
                              <Select
                                name="projectName"
                                options={projectOptions}
                                value={selectedOptions}
                                onChange={handleProjectName}
                                isLoading={loading}
                                isDisabled={true}         
                                isSearchable={false}        
                                menuIsOpen={false}         
                                className="bg-light" 
                            />
                        </Form.Group>
                        <Form.Group>
                        <Form.Label className="fs-5 fw-bolder pt-3">Round<span className="text-danger">*</span></Form.Label> 
                            <Select
                                name="round"
                                options={roundOptions}
                                value={selectedRound}
                                onChange={handleRoundChange}
                                isLoading={loading}
                                getOptionLabel={(e) => e.label}
                                getOptionValue={(e) => e.value}
                                isDisabled={true}         
                                isSearchable={false}        
                                menuIsOpen={false}         
                                className="bg-light" 
                            />
                        </Form.Group>
                        <Form.Group>
                         <Form.Label className="fs-5 fw-bolder pt-3">Device Name<span className="text-danger">*</span></Form.Label>
                         <Form.Control
                                type="text" 
                                {...register("Name")} 
                            />
                        </Form.Group>
                         <Form.Group>
                             <Form.Label className={`fs-5 pt-3 fw-bolder ${selectedVulnabiliyuType !== "Network Devices" ? "pt-3" : ""}`} >Vulnerability Name/Type<span className="text-danger">*</span></Form.Label>
                             <Select
                                name="vulnerabilityName"
                                options={vulnerabilityOptions}
                                value={selectedVulnerability}
                                onChange={handleVulnerabilityChange}
                                isLoading={loading}
                                isSearchable={true}
                                onInputChange={(newValue) => setSearchQuery(newValue)}
                            />
                        </Form.Group>
                       
                    </div>
                    <div className="col-sm-6 col-md-6 col-lg-6">
                        <Form.Group>
                            <Form.Label className="fs-5 fw-bolder mt-3">Project Type<span className="text-danger">*</span></Form.Label>
                            <Select
                                name="ProjectType"
                                options={selectedTypes}
                                value={selectedProjectType}
                                onChange={handleProjecType}
                                isLoading={loading}
                                isDisabled={true}         
                                isSearchable={false}        
                                menuIsOpen={false}         
                                className="bg-light" 
                            />
                        </Form.Group>
                        {(selectedVulnabiliyuType  === "Network Devices" || devicesData) && (
                            <Form.Group>
                                <Form.Label className="fs-5 pt-3 fw-bolder">
                                Devices<span className="text-danger">*</span>
                                </Form.Label>
                                <Select
                                name="devices"
                                options={device}
                                value={selectDevice}
                                onChange={handleDevice}
                                isLoading={loading}
                                isDisabled={true}         
                                isSearchable={false}        
                                menuIsOpen={false}         
                                className="bg-light" 
                                />
                            </Form.Group>
                            )}
                          <Form.Group>
                         <Form.Label className="fs-5 pt-3 fw-bolder">IP Address<span className="text-danger">*</span></Form.Label>
                         <Form.Control
                                type="text" 
                                {...register("ipAddress")} 
                            />
                        </Form.Group>
                         <Form.Group>
                            <Form.Label className="fs-5 pt-3 fw-bolder">sevirity<span className="text-danger">*</span></Form.Label>
                            <Select
                                name="sevirty"
                                options={sevirtyOptions}
                                value={selectedSevirity}
                                onChange={handleSevirityChange}
                                isLoading={loading}
                                getOptionLabel={(e) => e.label}
                                getOptionValue={(e) => e.value}
                            />
                        </Form.Group>
                    </div>
                </div>
                <div className="row">
                    <Form.Group>
                         <Form.Label className="fs-5 pt-3 fw-bolder">Description<span className="text-danger">*</span></Form.Label>
                         <Form.Control
                                type="text" 
                                as='textarea'
                                {...register("description")} 
                            />
                    </Form.Group>
                    <Form.Group>
                         <Form.Label className="fs-5 pt-3 fw-bolder">Location<span className="text-danger">*</span></Form.Label>
                         <Form.Control
                                type="text" 
                                as='textarea'
                                {...register("path")} 
                            />
                    </Form.Group>
                    <Form.Group>
                         <Form.Label className="fs-5 pt-3 fw-bolder">Impact<span className="text-danger">*</span></Form.Label>
                         <Form.Control
                            type="text" 
                            as='textarea'
                            {...register("impact")} 
                        />
                    </Form.Group>
                    <Form.Group>
                         <Form.Label className="fs-5 pt-3 fw-bolder">Vulnerable Parameter<span className="text-danger">*</span></Form.Label>
                         <Form.Control
                            type="text" 
                            as='textarea'
                            {...register("vulnerableParameter")} 
                        />
                    </Form.Group>
                    <Form.Group>
                         <Form.Label className="fs-5 pt-3 fw-bolder">References (CVE/ Bug / OWASP 2017)<span className="text-danger">*</span></Form.Label>
                         <Form.Control
                            type="text" 
                            as='textarea'
                            {...register("references")} 
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 pt-3" controlId="ProofOfConcept">
                    <Form.Label className="fs-5 fw-bolder">
                        Proof Of Concept <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="container border py-4" style={{ maxHeight: "350px", overflowY: "auto" }}>
                        {proofOfConcepts.map((proof, index) => (
                            <div className="row mb-3" key={index}>
                                <div className="col-12 d-flex justify-content-between align-items-center">
                                    <Form.Label className="fs-6 fw-bolder">Step {index + 1}</Form.Label>
                                    {proofOfConcepts.length > 3 && (
                                        <Button variant="danger" size="sm" onClick={() => handleRemoveStep(index)}>
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <Form.Control
                                        type="text"
                                        as="textarea"
                                        value={proof.description || ""}
                                        onChange={(e) => handleTextChange(index, e.target.value)}
                                    />
                                </div>
                             <div className="col-md-6 ">
                                 <div
                                    className="form-control position-relative"
                                    contentEditable
                                    onPaste={(e) => handlePasteImage(e, index)}
                                    style={{
                                        minHeight: "60px",
                                        border: "2px dashed #ccc",
                                        padding: "10px",
                                        overflow: "hidden",
                                    }}
                                    >
                                    {!proof.proofPreviwe ? (
                                        <p style={{ color: "#999" }} readonly>Paste an image here (Ctrl+V)</p>
                                    ) : (
                                        <div style={{ position: "relative", display: "inline-block" }}>
                                        <img
                                            src={proof.proofPreviwe}
                                            alt="Preview"
                                            style={{ 
                                                width: "100%",              
                                                maxWidth: "300px",          
                                                maxHeight: "200px",         
                                                objectFit: "contain",      
                                                borderRadius: "6px",
                                                border: "1px solid #ccc",
                                                padding: "2px",
                                                background: "#fff"
                                             }}
                                        />
                                        <span
                                            onClick={() => handleDeleteImage(index)}
                                            style={{
                                            position: "absolute",
                                            top: "-10px",
                                            right: "-10px",
                                            background: "#dc3545",
                                            color: "#fff",
                                            borderRadius: "50%",
                                            width: "24px",
                                            height: "24px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            boxShadow: "0 0 2px rgba(0,0,0,0.5)"
                                            }}
                                        >
                                            &times;
                                        </span>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3">
                        <Button variant="success" size="sm" onClick={handleAddStep}>
                            ADD
                        </Button>
                    </div>
                </Form.Group>
                    <Form.Group>
                         <Form.Label className="fs-5 fw-bolder">Recomendation<span className="text-danger">*</span></Form.Label>
                         <Form.Control
                            type="text" 
                            as='textarea'
                            {...register("recomendation")} 
                        />
                    </Form.Group>
                </div>
                 <Button type="submit" className="mt-3 ml-4" variant="primary" onClick={onSubmit} disabled={loading}>
                    {loading ? (
                        <Spinner animation="border" size="sm" />
                        ) : (
                             <span className="d-flex align-items-center">
                            <FaEdit className='me-1'/> Update
                        </span>
                        )}
                </Button>
                <Button variant="danger" className="mt-3 mx-4" onClick={()=>handleDelete(id)}> 
                    <span className="d-flex align-items-center">
                        <MdDelete className="me-1" /> Delete
                    </span>
                </Button>
                {/* <Button variant="danger" className="mt-3 mx-4" onClick={handleBackClick}><TiArrowBack />BACK</Button> */}
            </form>
        </div>
    );
};

export default EditReportForm;
