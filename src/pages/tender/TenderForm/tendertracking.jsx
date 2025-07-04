import React, { useState,useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Form from "react-bootstrap/Form";
import { Button, Spinner } from 'react-bootstrap'; 
import { TiArrowBack } from "react-icons/ti";
import { postTenderTrackingData, getEmpList } from '../../../api/TenderTrackingAPI/tenderTrackingApi';
import { getStateList } from '../../../api/stateApi/stateApi';
import PreviewModal from '../../../components/previewfile/preview';
import { PiImagesSquareBold } from "react-icons/pi";
import { FcDocument } from "react-icons/fc";
import { IoIosSave } from "react-icons/io";
import Select from 'react-select';


const TenderTracking = () => {
  const [formData, setFormData] = useState({
    tenderName: "",
    organizationName: "",
    state: "",
    taskForce: "",
    valueINR: "",
    rawValueINR: "",
    tenderDocument: null,
    lastDate: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const [stateOption,setStateOption] =useState([])
  const [selectedStateOption, setSelectedStateOption] = useState([])
  const [empListOption, setEmpListOption] =useState([])
  const [selectedEmpList, setSelectedEmpList] =useState([])
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(''); 
  const [uploadedFile, setUploadedFile] = useState(null);

  const formatIndianNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "valueINR") {
      const raw = value.replace(/,/g, "").replace(/\D/g, "");
      const formatted = raw ? formatIndianNumber(raw) : "";
      setFormData((prev) => ({
        ...prev,
        valueINR: formatted,
        rawValueINR: raw,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    }

    // Clear error on change
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenderName.trim()) newErrors.tenderName = "Tender name is required.";
    if (!formData.organizationName.trim()) newErrors.organizationName = "Organization name is required.";
    if (!formData.state.trim()) newErrors.state = "State is required.";
    if (!formData.taskForce) newErrors.taskForce = "Task force must be selected.";
    if (!formData.valueINR.trim()) newErrors.valueINR = "Value is required.";
    if (!formData.tenderDocument) newErrors.tenderDocument = "Document upload is required.";
    if (!formData.lastDate) newErrors.lastDate = "Last date is required.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleFormdataSubmit = async (data) => {
    const payload = {
      tenderName: data.tenderName,
      organizationName: data.organizationName,
      state: data.state,
      taskForce: data.taskForce,
      valueINR: data.rawValueINR || data.valueINR,
      status: 'Upload',
      tenderDocument: uploadedFile,
      lastDate: data.lastDate,
    };
    console.log(payload)
    setLoading(true);
        try{
        const response = await postTenderTrackingData(payload);
         if(response.statusCode === 400){
         toast.error(response.message, {
            className: 'custom-toast custom-toast-error',
          });          
        }else
        if(response.statusCode === 200){
         toast.success('Tender submitted successfully!', {
            className: 'custom-toast custom-toast-success',
          });
          setTimeout(() => {
          navigate('/tender-list');
          }, 3000);
          
        }
        }catch(error){
              toast.error('Failed to submit the form.', {
                className: 'custom-toast custom-toast-error',
        })
      }
      setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleFormdataSubmit(formData);
    } else {
      console.warn("Validation failed");
    }
  };

  const renderError = (field) =>
    errors[field] && <div className="text-danger small">{errors[field]}</div>;

  const handleBackClick = ()=>{
    navigate(`/Tender-List`) 
  }

   useEffect(()=>{
      const fetchStateList = async() =>{
        setLoading(true);
        try{
          const response = await getStateList();
          if(response.data && Array.isArray(response.data.data)){
            const option = response.data.data.map((state)=>({
              value:state._id,
              label:state.stateName
            }))
            setStateOption(option)
          }else{
            console.log("Expect an Array")
          }
        }catch(error){
          console.error("Error fetching State:");
        } finally{
          setLoading(false);
        }
      }
      fetchStateList()
    },[])

    const handleState=(selected)=>{
        setSelectedStateOption(selected)
          setFormData((prev) => ({
      ...prev,
        state: selected?.label || "", 
      }));
    }

    useEffect(() => {
    const fetchEmpList = async() =>{
      setLoading(true);
      try{
        const data = await getEmpList()
        const response=data.data
        if(response.statusCode === 200 && response.data && Array.isArray(response.data)){
          const option = response.data.map((state)=>({
            value:state._id,
            label:state.ename
          }))
          console.log(option)
          setEmpListOption(option)
        }

      }catch(error){

      }finally{
        setLoading(false);
      }
    }
        fetchEmpList();
    }, []);

    const handleTaskForcwMemberChange = (selected)=>{
      setSelectedEmpList(selected)
      setFormData((prev) => ({
      ...prev,
        taskForce: selected?.label || "", 
      }));

    }
const handleFileChange = (e) => {
  const file = e.target.files[0];
  setUploadedFile(file);

  if (file) {
    setFormData((prev) => ({
      ...prev,
      tenderDocument: file,
    }));

    setFileType(file.type);

    if (
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const fileURL = URL.createObjectURL(file);
      setPreview(fileURL);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      const fileURL = URL.createObjectURL(file);
      setPreview(fileURL);
    }
  }
};
  const handleCloseModal = () => {
    setShowPreviewModal(false); 
  };
  const handlePreviewClick = () => {
    setShowPreviewModal(true);
  };

  return (
    <div className="container mt-4">
      <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
      <div className="row">
        <div className="=col-sm-10 col-md-10 col-lg-10"> 
          <h1 className="fw-bolder">Tender Tracking Form</h1>
        </div>
        <div className="col-sm-2 col-md-2 col-lg-2">
          <Button variant="danger" className='btn btn-success ' onClick={handleBackClick}>
            <TiArrowBack />BACK
          </Button>
        </div>
      </div>
      <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}/>
      <Form onSubmit={handleSubmit}>
        <div className="row">
          {/* Left Column */}
          <div className="col-md-6 col-sm-6 col-lg-6">
            <Form.Group className="mb-3" >
              <Form.Label className="fs-5 fw-bolder">Tender Name<span className="text-danger">*</span></Form.Label>
              <input
                type="text"
                name="tenderName"
                className="form-control"
                value={formData.tenderName}
                onChange={handleChange}
                placeholder="Enter Tender Name"
              />
              {renderError("tenderName")}
            </Form.Group  >
              <Form.Group className="mb-3" >
                <Form.Label className="fs-5 fw-bolder">Organization Name<span className="text-danger">*</span></Form.Label>
                <input
                  type="text"
                  name="organizationName"
                  className="form-control"
                  placeholder="Enter Organization Name"
                  value={formData.organizationName}
                  onChange={handleChange}
                />
              {renderError("organizationName")}
            </Form.Group>

           <Form.Group className="mb-3" >
              <Form.Label className="fs-5 fw-bolder">State<span className="text-danger"></span>*</Form.Label>
              <Select
                options={stateOption}
                value={selectedStateOption}
                isClearable
                isDisabled={loading}
                placeholder="Select State"
                onChange={handleState}
              />
              {renderError("state")}
            </Form.Group>

            <Form.Group className="mb-3" >
              <Form.Label className="fs-5 fw-bolder">Task Force Member<span className="text-danger">*</span></Form.Label>
              <Select
                options={empListOption}
                value={selectedEmpList}
                placeholder="Select Tak Force Member"
                onChange ={handleTaskForcwMemberChange}
              />
              {renderError("taskForce")}
            </Form.Group>
          </div>

          {/* Right Column */}
          <div className="col-md-6">
            <Form.Group className="mb-3" >
              <Form.Label className="fs-5 fw-bolder">Value (INR)<span className="text-danger">*</span></Form.Label>
              <input
                type="text"
                name="valueINR"
                className="form-control"
                value={formData.valueINR}
                onChange={handleChange}
                placeholder="e.g. 2,22,000"
              />
              {renderError("valueINR")}
            </Form.Group>

           <Form.Group className="mb-3" >
              <Form.Label className="fs-5 fw-bolder">Tender Document Upload (PDF, DOC, Image)<span className="text-danger">*</span></Form.Label>
              <input
                type="file"
                name="tenderDocument"
                className="form-control"
                accept=".pdf,.doc,.docx,image/*"
                 onChange={(e) => {
                    handleFileChange(e);
                  }}
              />
               {preview && (
                <div
                onClick={handlePreviewClick}
                style={{ cursor: 'pointer', marginTop: '10px' }}
              >
                <h6>
                {uploadedFile
                  ? fileType.startsWith('image/') 
                    ? <>
                        <PiImagesSquareBold style={{ marginRight: '8px' }} />
                        Preview Image
                      </>
                    : <>
                        <FcDocument style={{ marginRight: '8px' }} />
                        Preview Document
                      </>
                  : 'Preview File'} 
              </h6>
              </div>
              )}
              <PreviewModal
                show={showPreviewModal}
                onHide={handleCloseModal}
                preview={preview}
                fileType={fileType}
              />
                         
              {renderError("tenderDocument")}
            </Form.Group>

           <Form.Group className="mb-3" >
              <Form.Label className="fs-5 fw-bolder">Last Day of Bidding<span className="text-danger">*</span></Form.Label>
              <input
                type="date"
				min={new Date().toISOString().split("T")[0]}
                name="lastDate"
                className="form-control"
                value={formData.lastDate}
                onChange={handleChange}
              />
              {renderError("lastDate")}
            </Form.Group>
          </div>
        </div>
        <Button type="submit" variant="primary" disabled={loading}>
         {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
          <>
            <IoIosSave /> SAVE
          </>
          )}
        </Button>
         <Button variant="danger" className='btn btn-success mx-4' onClick={handleBackClick}>
            <TiArrowBack />BACK
          </Button>
      </Form>
    </div>
  );
};

export default TenderTracking;
