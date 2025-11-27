// report.jsx

import React, { useState, useEffect, useRef,useCallback   } from 'react';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import reportValidationSchema from '../../../validation/reportValidationSchema';
// NOTE: I'm keeping these imports, but the internal logic below will use placeholders for the results
import {postReport,getVulListSpecific,searhName,updateRoundStatus } from '../../../api/reportApi/reportApi'
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
import { Box, Typography, Button, IconButton, Tooltip, Switch, FormControlLabel } from '@mui/material';
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
  const [selectDevice, setSelectDevice] = useState(null) // Initialize as null for safety
  const navigate = useNavigate();
  const [disableDevices, setDisableDevices] = useState("")
  const fileInputRefs = useRef([]); 
  const [roundOptions, setRoundOptions] = useState([]);
  const [showModalPoc, setShowModalPoc] = useState(false);  
  const [showModalVulList, setShowModalVulList] = useState(false); 
  const [showVulLisst,setShowVulList] = useState([])
  const roundValue = watch("round"); // Watch the selected round value
  const name = watch("name");
  const deviceValue = watch("device");
  const ipAddress = watch('ipAddress')
  const [filePreview, setFilePreview] = useState('');
  const [previewFileType, setPreviewFileType] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- ROUND COMPLETION STATE RESTORED ---
  const [isFormSaved, setIsFormSaved] = useState(false); 
  const [showRoundCompletionModal, setShowRoundCompletionModal] = useState(false);
  const [completionRounds, setCompletionRounds] = useState([
    { name: 'Round 1', isComplete: false },
    { name: 'Round 2', isComplete: false },
    { name: 'Round 3', isComplete: false },
    { name: 'Round 4', isComplete: false },
  ]);
  // ----------------------------------

  // --- NEW STATE FOR COMPLETED ROUNDS ---
  const [completedRounds, setCompletedRounds] = useState({});
  // --------------------------------------

 
 useEffect(() => {
  setValue("Path", ipAddress); 
  setValue("VulnerableParameter", ipAddress); 
}, [ipAddress]); 

  const savedSelectedProjectName = localStorage.getItem("selectedProjectName");
  const savedRoundValue = localStorage.getItem("roundValue");
  const savedName = localStorage.getItem("name");
  const savedSelectedProjectNameAdd = localStorage.getItem("selectedProjectNameAdd");
  const savedDeviceValue = localStorage.getItem("deviceValue");
  const savedIpAddress = localStorage.getItem("ipAddress");

// --- MODIFIED fetchVulList TO ALSO FETCH ROUND STATUS ---
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
        // --- API CALL: getVulListSpecific (Placeholder) ---
        const response = await getVulListSpecific({
          projectName: selectedProjectName,
          projectType: selectedProjectNameAdd,
          round: roundValue,
          devices: deviceValue,
          Name: name,
          ipAddress: ipAddress,
        });
        /* API Response Placeholder for getVulListSpecific: 
           response.data should be an array of vulnerability objects with fields like:
           {
               vulnerabilityName: 'XSS', 
               sevirty: 'Medium', 
               description: '...', 
               roundStatus: [{ roundstep: 'Round 1', roundstepstatus: 'Complete' }, ...], // <-- NEWLY IMPORTANT
               proofOfConcept: [{ noOfSteps: 'Step 1', description: '...', proof: 'https://proof_url.png' }] 
           }
        */
        setShowVulList(response.data); 
        
        // --- LOGIC TO EXTRACT AND SET COMPLETED ROUNDS ---
        if (response.data && response.data.length > 0) {
            // Assuming roundStatus is the same across all vulnerabilities for the same report context
            const statusArray = response.data[0].roundStatus; 
            if (Array.isArray(statusArray)) {
                const completed = {};
                statusArray.forEach(status => {
                    if (status.roundstepstatus === 'Complete') {
                        // 'Round 1' -> 'Round 1' : true
                        completed[status.roundstep] = true;
                    }
                });
                setCompletedRounds(completed);

                // Also update completionRounds state for the modal
                 const newCompletionRounds = completionRounds.map(r => ({
                    ...r,
                    isComplete: completed[r.name] || false
                }));
                setCompletionRounds(newCompletionRounds);
                
                // Mark form as saved if we found data
                setIsFormSaved(true);
            }
        } else {
             // If no vulnerabilities found, assume the current report context isn't saved yet
             setIsFormSaved(false);
             setCompletedRounds({});
             setCompletionRounds(completionRounds.map(r => ({ ...r, isComplete: false })));
        }
      }
    } catch (error) {
      console.error("Error fetching vulnerabilities/round status:", error);
       setIsFormSaved(false);
    } finally {
      setLoading(false);
    }
  };
// ----------------------------------------------------

  const handlePasteOnIndex = (e, index) => {
  const items = e.clipboardData?.items;
  if (items) {
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        const preview = URL.createObjectURL(file);
        const updatedProofs = [...proofOfConcepts]; 
        updatedProofs[index] = { ...updatedProofs[index], preview, file };
        setProofOfConcepts(updatedProofs); 
      }
    }
  }
};

// Handles file upload from input type="file"
const handleFileUpload = (e, index) => {
  const file = e.target.files[0];
  if (file) {
    const preview = URL.createObjectURL(file);
    const updatedProofs = [...proofOfConcepts]; 
    updatedProofs[index] = { ...updatedProofs[index], preview, file };
    setProofOfConcepts(updatedProofs); 
  }
};

  useEffect(() => {
    loadRounds();
  }, []);
  
// --- NEW useEffect to load status on initial Project/Round changes ---
  useEffect(() => {
    // This runs when the component mounts or when project/round changes
    // Only fetch if required fields are present
    if (getValues("selectedProjectName") && getValues("ProjectType")) {
        fetchVulList();
    }
  }, [getValues("selectedProjectName"), getValues("ProjectType"), getValues("name"), getValues("device"), getValues("ipAddress")]);
// -------------------------------------------------------------------


  useEffect(() => {
    const fetchVulnerabilities = async () => {
      setLoading(true);
      try {
        let fetch = false;
        let projectTypeToFetch = ProjectType;

        // FIX 1: Only fetch if we have enough info
        // Condition 1: Non-Network Devices (ProjectType must be set)
        if (ProjectType && ProjectType !== "Network Devices") {
          fetch = true;
        } 
        // Condition 2: Network Devices (ProjectType AND selectDevice must be set)
        else if (ProjectType === "Network Devices" && selectDevice?.label) {
          fetch = true;
          projectTypeToFetch = selectDevice.label; // Use device name for API call
        }
        
        if (fetch) {
          // --- API CALL: getVulnerabilityList (Placeholder) ---
          const response = await getVulnerabilityList({ ProjectType: projectTypeToFetch });
          /* API Response Placeholder for getVulnerabilityList:
             response.data should be an array of vulnerability templates:
             [{ 
                 _id: '123', 
                 vulnerabilityTypes: 'SQL Injection', 
                 description: '...', 
                 severity: 'High', 
                 impact: '...', 
                 vulnarabilityParameter: '...', 
                 references: '...', 
                 recommendation: '...' 
             }]
          */
          const vulnerabilities = response.data;
          setVulnerabilityData(vulnerabilities)
  
          const options = vulnerabilities.map(vuln => ({
            value: vuln._id,  
            label: vuln.vulnerabilityTypes,  
          }));
  
          setVulnerabilityOptions(options);   
        } else {
          // Clear options if the required fields are not yet selected
          setVulnerabilityOptions([]);
        }
      } catch (error) {
        console.error('Error fetching vulnerabilities:', error);
        if (error.response) {
            console.error('API Error details:', error.response.data);
        }
        setVulnerabilityOptions([]);
      } finally {
        setLoading(false); 
      }
    };

    fetchVulnerabilities();
  }, [ProjectType,selectDevice]);

// --- MODIFIED handleVulnerabilityChange TO PRIORITIZE REPORT DATA (WITH DEBUGGING AND SAFE MATCHING) ---
  const handleVulnerabilityChange = (selectedOption) => {
    setSelectedVulnerability(selectedOption); 
    setValue('selectedVulnerability', selectedOption.value);
    
    const vulnerabilityName = selectedOption?.label;
    
    // --- DEBUG LOG: The name we are looking for ---
    console.log("Selected Vulnerability Label (Search Key):", vulnerabilityName);
    console.log("Current showVulLisst (Report Table Data):", showVulLisst);
    // ---------------------------------------------

    // 1. Check the 'Report Table' (showVulLisst) for an existing entry with this name.
    // We prioritize the most recently saved one by reversing the array.
    const savedVulnInstance = Array.isArray(showVulLisst) 
        ? showVulLisst.slice().reverse().find(
            (vuln) => vuln.vulnerabilityName && vulnerabilityName && 
                      vuln.vulnerabilityName.trim().toLowerCase() === vulnerabilityName.trim().toLowerCase()
        )
        : null;
    
    // --- DEBUG LOG: Result of the search ---
    console.log("Saved Vulnerability Instance Found:", !!savedVulnInstance, savedVulnInstance);
    // --------------------------------------

    // 2. Fallback: Find the generic Template data by ID (only if no saved instance exists)
    const selectedTemplate = savedVulnInstance 
        ? null // Do not fetch template if saved instance is found
        : vulnerabilityData.find((vuln) => vuln._id === selectedOption?.value);
    
    // Determine the source data: Saved Report Data (priority) or Template Data
    const sourceData = savedVulnInstance || selectedTemplate;

    // Default Proof of Concept structure
    const defaultPoc = [
        { text: "", file: null, preview: null },
        { text: "", file: null, preview: null },
        { text: "", file: null, preview: null }
    ];

    if (sourceData) {
      // --- AUTO-FILL FIELDS ---
      
      // Description (same name in both)
      setValue("Description", sourceData.description || ""); 
      
      // Location/Path (Name in report: path, Name in template: N/A - default to IP)
      setValue("Path", sourceData.path || getValues("ipAddress") || ""); 
      
      // Impact (same name in both)
      setValue("Impact", sourceData.impact || "");
      
      // Vulnerable Parameter (Name in report: vulnerableParameter, Name in template: vulnarabilityParameter)
      const paramValue = sourceData.vulnerableParameter || sourceData.vulnarabilityParameter || getValues("ipAddress") || "";
      setValue("VulnerableParameter", paramValue); 
      
      // References (Name in report: references, Name in template: references)
      setValue("Referance", sourceData.references || "");
      
      // Recommendation (Name in report: recomendation, Name in template: recommendation)
      const recommendationValue = sourceData.recomendation || sourceData.recommendation || "";
      setValue("Recomendation", recommendationValue);

      // Severity (Name in report: sevirty, Name in template: severity)
      const severityKey = sourceData.sevirty || sourceData.severity;
      const severityValue = severityOptions.find((option) => option.value === severityKey);
      setValue("severity", severityValue ? severityValue.value : "");
      
      // Load Proof of Concept steps from the SAVED INSTANCE ONLY
      if (savedVulnInstance && Array.isArray(savedVulnInstance.proofOfConcept)) {
          const loadedPoc = savedVulnInstance.proofOfConcept.map(poc => ({
              // Load description text
              text: poc.description || "",
              // File object cannot be re-loaded, but the proof URL/path is used for preview
              file: null, 
              preview: poc.proof || null
          }));
          
          // Ensure at least the minimum 3 PoC slots are maintained
          while (loadedPoc.length < 3) {
              loadedPoc.push({ text: "", file: null, preview: null });
          }
          
          setProofOfConcepts(loadedPoc);
      } else {
         // If no saved instance or PoC data, use default empty steps
         setProofOfConcepts(defaultPoc);
      }
      
    } else {
      // Clear all fields if neither a saved instance nor a template is found
      setValue("Description", "");
      setValue("Path", getValues("ipAddress") || "");
      setValue("Impact", ""); 
      setValue("VulnerableParameter", getValues("ipAddress") || "");
      setValue("Referance", ""); 
      setValue("Recomendation", "");  
      setValue("severity", null);
      setProofOfConcepts(defaultPoc);
    }
 
  };
// ---------------------------------------------------------------------------


  useEffect(() => {
    setValue("selectedProjectName", ""); 
    localStorage.removeItem("selectedProjectName"); 
  }, [setValue]);

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true)
      setError("")
      try{
        // --- API CALL: getDeviceList (Placeholder) ---
        const data = await getDeviceList()
        /* API Response Placeholder for getDeviceList:
           data.data should be an array of device objects:
           [{ _id: 'd1', devicesName: 'Firewall A' }, { _id: 'd2', devicesName: 'Load Balancer' }]
        */
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
        // --- API CALL: getProjectNameList (Placeholder) ---
        const data = await getProjectNameList();
        /* API Response Placeholder for getProjectNameList:
           [{ _id: 'p1', projectName: 'E-Commerce Site' }, { _id: 'p2', projectName: 'Internal Network' }]
        */

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

          // --- API CALL: getProjectTypeList (Placeholder) ---
          const data = await getProjectTypeList(selectedProjectId);
          /* API Response Placeholder for getProjectTypeList:
             data.data should be an array of project type strings:
             ['Web Application', 'Mobile Application', 'Network Devices']
          */

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


// --- MODIFIED loadRounds to apply disabled status AND SORT ---
  const loadRounds = async () => {
    try {
      // --- API CALL: getAllRound (Placeholder) ---
      const res = await getAllRound();
      /* API Response Placeholder for getAllRound:
         res.data.data should be an array of round objects:
         [{ label: 'Round 1', value: 'r1' }, { label: 'Round 2', value: 'r2' }]
      */
      let options = res.data.data || []; // Use let for sorting
      
      // 1. Ascending Order Sort: Ensure rounds are sorted by number in label (e.g., 'Round 1' before 'Round 10')
      options.sort((a, b) => {
          // Extracts the number from the label (e.g., 'Round 3' -> 3)
          const numA = parseInt(a.label.match(/\d+/)?.[0] || '0', 10);
          const numB = parseInt(b.label.match(/\d+/)?.[0] || '0', 10);
          return numA - numB;
      });

      let isPreviousRoundComplete = true; // Assume the first round (Round 1) is enabled by default
      
      // 2. Map and apply the disabled status based on completedRounds state and sequential check
      const mappedOptions = options.map((round) => {
          const roundNumberMatch = round.label.match(/\d+/);
          const currentRoundNumber = roundNumberMatch ? parseInt(roundNumberMatch[0], 10) : Infinity;
          
          let isDisabled = false;

          // Determine the completion status of the current round from state
          const isCurrentRoundCompleted = completedRounds[round.label] === true;

          // NEW LOGIC 1: Disable the round if it is already COMPLETE (as per user request)
          if (isCurrentRoundCompleted) {
              isDisabled = true;
          }
          
          // NEW LOGIC 2: Sequential Check: Disable the round if current number > 1 AND the immediately preceding round is not complete
          if (!isDisabled && currentRoundNumber > 1 && !isPreviousRoundComplete) {
              isDisabled = true;
          }
          
          // Update the tracker for the next iteration.
          isPreviousRoundComplete = isCurrentRoundCompleted;
          
          return {
              ...round,
              isDisabled: isDisabled, 
          };
      });

      const withAddOption = [
        ...mappedOptions,
        { label: "➕ Add Round", value: "add_round", isAddOption: true, isDisabled: false },
      ];
      setRoundOptions(withAddOption);

    } catch (err) {
      console.error("Error loading rounds:", err);
    }
  };
// ----------------------------------------------------

// --- NEW useEffect to re-run loadRounds when completedRounds changes ---
  useEffect(() => {
    loadRounds();
  }, [completedRounds]);
// ----------------------------------------------------------------------


  const addNewRound = async () => {
    try {
      // --- API CALL: postAddRound (Placeholder) ---
      const res = await postAddRound();
      /* API Response Placeholder for postAddRound:
         res.data should contain a success message and potentially the new round data.
      */
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
  

  // report.jsx (Modified section within ReportPage component)
// ... (rest of the component state and hooks)
const handleFormSubmit = async (data) =>{
    
    // 1. Separate Files into an array for the API payload
    const filesToUpload = proofOfConcepts
        .map(poc => poc.file && poc.file.size > 0 ? poc.file : null)
        .filter(file => file !== null);

    // 2. Create JSON structure for Proof of Concept (using placeholders for files)
    const pocDataStructure = proofOfConcepts.map((proof, index) => {
        let proofValueForJSON = "";
        
        if (proof.file && typeof proof.file === 'object' && proof.file.size > 0) {
            proofValueForJSON = `file_attached_step_${index}`; 
        } else if (proof.preview && typeof proof.preview === 'string') {
           // Keep the existing URL if it's a previously loaded proof (URL)
           proofValueForJSON = proof.preview;
        }
        
        return {
            noOfSteps: `Step ${index + 1}`,
            description: proof.text,
            proof: proofValueForJSON,
        };
    });
    
    // Filter out empty proof of concept steps (where text and proof are both empty)
    const filteredPocDataStructure = pocDataStructure.filter(poc => poc.description.trim() !== '' || poc.proof.trim() !== '');

    // 3. Format Round Statuses
    const formattedRoundStatuses = completionRounds.map(round => ({
        roundstep: round.name, 
        roundstepstatus: round.isComplete ? 'Complete' : 'Incomplete', 
    }));

    // 4. Construct the Payload object
    // FIX APPLIED: JSON.stringify is REQUIRED for complex arrays in multipart/form-data.
    const payload = {
        // Simple fields
        projectName: data.selectedProjectName || '',
        projectType: data.ProjectType || '',
        round: data.round || '',
        vulnerabilityName: selectedVulnerability?.label || '', // Use label for the name
        sevirty: data.severity || '',
        description: data.Description || '',
        path: data.Path || '',
        impact: data.Impact || '',
        vulnerableParameter: data.VulnerableParameter || '',
        references: data.Referance || '',
        recomendation: data.Recomendation || '',

        // Conditional fields based on Project Type
        Name: data.ProjectType === 'Network Devices' ? (data.name || '') : '',
        ipAddress: data.ProjectType === 'Network Devices' ? (data.ipAddress || '') : '',
        devices: data.ProjectType === 'Network Devices' ? (selectDevice?.label || '') : '',
        
        // --- MANDATORY JSON STRINGIFICATION FOR FILE UPLOADS ---
        roundStatus: JSON.stringify(formattedRoundStatuses), 
        proofOfConcept: JSON.stringify(filteredPocDataStructure), // Use filtered PoC data
        
        // File array (MUST be named 'proof' for your API)
        proof: filesToUpload, 
    };
    
    setLoading(true);
    try{
    // Ensure postReport client function serializes 'payload' into FormData
    // AND ensures files in 'proof' are correctly appended.
    await postReport(payload);
    
      // ... (Success logic)
      setIsFormSaved(true); 
      // Reset form fields on successful submission
      setValue("selectedVulnerability", null);
      setValue("Description", "");
      setValue("Impact", "");
      setValue("VulnerableParameter", "");
      setValue("Referance", "");
      setValue("Recomendation", "");
      setValue("severity", null);
      setSelectedVulnerability(null);
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
      fetchVulList() // Re-fetch list and status after saving
    } catch(error){
      // Enhanced error logging
      console.error("Submission Error Details:", error.response?.data || error); 
      
      const message = error?.response?.data?.message || "Something went wrong";
      toast.error(message, {
        className: 'custom-toast custom-toast-error',
      });
    }
    setLoading(false);
  }

// ... (rest of the component)
  const handleDevice = (selected) =>{
    setValue("selectedVulnerability", null);
    setValue("Description", "");
    setValue("Impact", "");
    setValue("Referance", "");
    setValue("Recomendation", "");
    setValue("severity", null);
    setSelectedVulnerability(null);
    setSelectDevice(selected)
    const selectedOption = selected?.label || null;
    setValue("device", selectedOption);
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
  const selectedProjectType = getValues("ProjectType");
  
  // Conditionally check required fields for Network Devices
  let isNetworkValid = true;
  if (selectedProjectType === 'Network Devices') {
    const selectedDevice = getValues("device");
    const enteredName = getValues("name");
    const ip = getValues('ipAddress');
    if (!selectedDevice || !enteredName || !ip) {
      isNetworkValid = false;
    }
  }

    if (selectedProject && selectedRound && selectedProjectType && isNetworkValid) {
      setShowModalVul(true);
    }
    else {
      toast.error('All required fields must be filled in the header section.', {
        className: 'custom-toast custom-toast-error',
      });
    }
  }

  const handleShowModalVulList =()=>{
    const selectedProject = getValues("selectedProjectName");
    const selectedRound = getValues("round");
    const selectedProjectType = getValues("ProjectType");
    
    // Conditionally check required fields for Network Devices
    let isNetworkValid = true;
    if (selectedProjectType === 'Network Devices') {
      const selectedDevice = getValues("device");
      const enteredName = getValues("name");
      const ip = getValues('ipAddress');
      if (!selectedDevice || !enteredName || !ip) {
        isNetworkValid = false;
      }
    }

    if (selectedProject && selectedRound && selectedProjectType && isNetworkValid) {
      fetchVulList()
      setShowModalVulList(true)
    }
    else{
      toast.error('All required fields must be filled in the header section.', {
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
    updatedProofs[indexToDelete].preview = null; 
    updatedProofs[indexToDelete].file = null; 
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
    // Logic to determine file type from URL (assuming server returns URL with extension)
    const extension = url?.split('.').pop()?.toLowerCase(); 

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image/'; 
    } else if (extension === 'pdf') {
      return 'application/pdf'; 
    } else {
      // Default to assuming image if it's a base64 or internal blob URL
      return url && url.includes('data:image') ? 'image/' : 'unknown';
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
        // --- API CALL: searhName (Placeholder) ---
        const results = await searhName({ search: value });
        /* API Response Placeholder for searhName:
           results should be an array of matching name objects:
           [{ Name: 'Router A' }, { name: 'Switch B' }]
        */
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

  // --- ROUND COMPLETION LOGIC RESTORED ---
  const handleRoundToggle = (index) => {
    setCompletionRounds(prevRounds => {
        const newRounds = [...prevRounds];
        
        // Cannot toggle incomplete if next round is complete
        if (newRounds[index].isComplete && newRounds[index + 1] && newRounds[index + 1].isComplete) {
            toast.error(`Please unmark ${newRounds[index + 1].name} first.`, { className: 'custom-toast custom-toast-error' });
            return prevRounds;
        }

        // Toggle the current round
        newRounds[index].isComplete = !newRounds[index].isComplete;

        // If toggling off, disable all subsequent rounds
        if (!newRounds[index].isComplete) {
            for (let i = index + 1; i < newRounds.length; i++) {
                newRounds[i].isComplete = false;
            }
        }
        
        return newRounds;
    });
  };

  const handleRoundCompletionSubmit = async () => {
    
    
    // 1. Ensure the main form has been saved at least once (i.e., a report exists)
    if (!isFormSaved) {
        toast.error('Please save the report first before updating the round status.', { className: 'custom-toast custom-toast-error' });
        return;
    }
    
    // 2. Collect identifying data (required to find the report in the database)
   const identifyingData = {
  selectedProjectName: getValues("selectedProjectName"),
  ProjectType: getValues("ProjectType"),
  round: getValues("round"),
  name: getValues("name"),
  ipAddress: getValues("ipAddress"),
  device: getValues("device"),
};
console.log("Identifying Data for Round Status Update:", identifyingData);
console.log(identifyingData.selectedProjectName);
    // Validation check for essential identifying fields
    if (!identifyingData.selectedProjectName || !identifyingData.ProjectType || !identifyingData.round) {
         toast.error('Missing project details. Cannot update report status.', { className: 'custom-toast custom-toast-error' });
         return;
    }
    
    // 3. Format Round Statuses based on the local state (completionRounds)
    // Only send the rounds that are currently being shown in the modal (up to maxRoundNumber)
    const formattedRoundStatuses = roundsForModal.map(round => ({
        roundstep: round.name, 
        // Use 'Complete' or 'Incomplete' strings as required by your Mongoose model
        roundstepstatus: round.isComplete ? 'Complete' : 'Incomplete', 
    }));
    
    // 4. Construct the payload for the API
    const payload = {
        projectName: identifyingData.selectedProjectName,
        projectType: identifyingData.ProjectType,
        round: identifyingData.round,
        Name: identifyingData.name, 
        ipAddress: identifyingData.ipAddress,
        devices: identifyingData.device,
        roundStatus: formattedRoundStatuses // The array to update
    };
    
    setLoading(true);
    try {
        // 5. Call the API to update the database
        await updateRoundStatus(payload); 
        
        setShowRoundCompletionModal(false);
        toast.success('Round status updated successfully in the report!', { className: 'custom-toast custom-toast-success' });
        
        // --- NEW: Update the completedRounds state after successful update ---
        const updatedCompletedRounds = {};
        formattedRoundStatuses.forEach(status => {
            if (status.roundstepstatus === 'Complete') {
                updatedCompletedRounds[status.roundstep] = true;
            }
        });
        setCompletedRounds(updatedCompletedRounds);
        // -------------------------------------------------------------------
        
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to update round status.";
        toast.error(message, { className: 'custom-toast custom-toast-error' });
    } finally {
        setLoading(false);
    }
  };
  

  // ----------------------------------
  const selectedRoundLabel = roundOptions.find(o => o.value === roundValue)?.label;
  const maxRoundNumber = selectedRoundLabel ? parseInt(selectedRoundLabel.match(/\d+/)[0], 10) : 0;
  const roundsForModal = completionRounds.slice(0, maxRoundNumber);

  
  return (
    <div className="report-page">
     <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
     <PreviewModal 
        show={showModalPoc} 
        onHide={() => setShowModalPoc(false)} 
        preview={filePreview} 
        fileType={previewFileType} 
      />
      
      {/* --- ROUND COMPLETION MODAL RESTORED --- */}

      {/* --- NEW ROUND COMPLETION MODAL --- */}
      <PopupForm 
          show={showRoundCompletionModal} 
          handleClose={() => setShowRoundCompletionModal(false)} 
          title="Complete Rounds Status" 
          showFooter={true}
          handleCustomSubmit={handleRoundCompletionSubmit} // <-- Executes DB Update
          submitButtonText="Update Status" // Changed for clarity
      >
      
          <Table striped bordered hover>
              <thead>
                  <tr>
                      <th>Round</th>
                      <th>Status</th>
                  </tr>
              </thead>
              <tbody>
                  {roundsForModal.map((round, index) => {
                      // Check based on the *visible* index in the modal
                      const isDisabled = index > 0 && !roundsForModal[index - 1].isComplete && !round.isComplete;

                      return (
                          <tr key={index} className={isDisabled ? 'table-secondary' : ''}>
                              <td>{round.name}</td>
                              <td>
                                  <FormControlLabel
                                      control={
                                          <Switch
                                              checked={round.isComplete}
                                              onChange={() => handleRoundToggle(round.name.match(/\d+/)[0] - 1)} // Use original index (0-3) for state update
                                              disabled={isDisabled}
                                          />
                                      }
                                      label={round.isComplete ? 'Complete' : 'Incomplete'}
                                  />
                              </td>
                          </tr>
                      );
                  })}
              </tbody>
          </Table>
      </PopupForm>
      {/* ---------------------------------- */}

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
                        // Reset vulnerability fields on key change
                        setValue("selectedVulnerability", null);
                        setValue("ProjectType",null);
                        setValue("Description", "");
                        setValue("Impact", "");
                        setValue("Referance", "");
                        setValue("Recomendation", "");
                        setValue("severity", null);
                        setSelectedVulnerability(null);
                        
                        field.onChange(selectedOption?.value); 
                        setSelectedProjectName(selectedOption?.value); 

                         // Also reset round-related fields and status
                        setValue("round", null);
                        setCompletedRounds({});
                        setCompletionRounds(completionRounds.map(r => ({ ...r, isComplete: false })));
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
                        onChange={(selected) => {
                          handleround(selected);
                        }}
                        // --- IMPORTANT: Add getOptionDisabled prop ---
                        getOptionDisabled={(option) => option.isDisabled}
                        // ---------------------------------------------
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
                      value={selectedTypes.find(type => type === field.value) ? { value: field.value, label: field.value } : null}
                      options={selectedTypes.map(type => ({
                        value: type,  
                        label: type,  
                      }))}
                      isLoading={loading}
                      isSearchable
                      placeholder="Select Project Type"
                      onChange={(selectedOption) => {
                        const selection = selectedOption ? selectedOption.value : "";
                        
                        // Reset vulnerability fields
                        setValue("selectedVulnerability", null);
                        setValue("Description", "");
                        setValue("Impact", "");
                        setValue("Referance", "");
                        setValue("Recomendation", "");
                        setValue("severity", null);
                        setSelectedVulnerability(null);
                        
                        // FIX: Reset Network Device fields if switching away from Network Devices
                        if (selection !== "Network Devices") {
                          setValue("name", "");        // Reset Device Name
                          setValue("ipAddress", "");   // Reset IP Address
                          setValue("device", null);    // Reset the Device Select field value
                          setSelectDevice(null);       // Reset local state for the Device Select field
                        }


                        field.onChange(selection);
                        setProjectType(selection);
                        setDisableDevices(selection);
                        setSelectedProjectNameAdd(selectedOption?.value)
                        setValue("ProjectType",selectedOption.value)
                        
                        // Also reset round-related fields and status
                        setValue("round", null);
                        setCompletedRounds({});
                        setCompletionRounds(completionRounds.map(r => ({ ...r, isComplete: false })));

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
                          onChange={(selected) => {
                            handleDevice(selected);
                          }}
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
                          <input 
                            {...field} 
                            className="form-control"  
                            placeholder="Enter IPAddress"
                            onChange={(e) => {
                              field.onChange(e);
                            }}
                          />
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
  
                  {/* Buttons on the right side */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                       {/* 'Complete Round' Button RESTORED */}
                       <Button
                          variant="contained"
                          color="error"
                          onClick={() => setShowRoundCompletionModal(true)}
                          startIcon={<MdOutlineAddModerator />} 
                          // 🛑 Disabled unless the form has been successfully saved
                          disabled={!isFormSaved || loading} 
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
                          Complete Round
                        </Button>
                       {/* End 'Complete Round' Button */}

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
                </Box>
            </div>
            {showModalVul && (
            <div className="row pt-5">
              <div className='col-sm-6 col-md-6 col-lg-6'>
                  <Form.Group className="mb-3">
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
                  title="Click here and press Ctrl+V or Right Click → Paste"
                >
                  Paste or Drag Image Here
                </div>
              </div>
            )}
          </div>
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