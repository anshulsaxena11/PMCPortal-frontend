import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useForm, Controller } from "react-hook-form";
import Form from "react-bootstrap/Form";
import { yupResolver } from "@hookform/resolvers/yup";
import certificateValidation from '../../../validation/certificatevalidation'
import { FcDocument } from "react-icons/fc";
import {empList} from '../../../api/syncEmp/syncEmp'
import PreviewModal from '../../../components/previewfile/preview';
import { PiImagesSquareBold } from "react-icons/pi";
import Select from 'react-select';
import {getCertificateMasterList} from '../../../api/certificateMaster/certificateMaster'
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { IoIosSave } from "react-icons/io";

import DatePicker from "react-datepicker";
import {postCertificate} from "../../../api/certificateApi/certificate"

const CertificateForm = () => {
    const { control, handleSubmit, formState: { errors }, setValue,reset,trigger } = useForm({
        resolver: yupResolver(certificateValidation),
        defaultValues: {},
    });
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [fileType, setFileType] = useState(''); 
    const [preview, setPreview] = useState(null);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [certificateOption , setCertificateOption] = useState([])
    const [option, setOption] = useState([])
    const [selectedCertificateOption, setSelectedCertificateOption] = useState([])
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get current user ID and role from localStorage/sessionStorage
    const currentUserId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    const currentUserRole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");

    setUserId(currentUserId);
    setUserRole(currentUserRole);
  }, []);

    const handleCloseModal = () => {
        setShowPreviewModal(false); 
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUploadedFile(file);
  
        if (file) {
        setFileType(file.type); 
    
        if (file.type === 'application/pdf') {
            const fileURL = URL.createObjectURL(file);
            setPreview(fileURL);
        } else if (file.type.startsWith('image/')) {

            const reader = new FileReader();
            reader.onload = () => {
            setPreview(reader.result); 
            };
            reader.readAsDataURL(file);
        }
        }
    };

    const handlePreviewClick = () => {
        setShowPreviewModal(true);
    };
 
    const handleBackClick = ()=>{
        navigate(`/certificate`) 
    }
    const handleButtonClick = (e) => {
        e.preventDefault();
        handleSubmit(handleFormdataSubmit)();
    };
    const handleFormdataSubmit = async (data) => {
        const payload={
            certificateName:data.certificateName,
            assignedPerson:data.assignedPerson,
            issuedDate:data.issuedDate,
            validUpto:data.validUpto,
            uploadeCertificate:uploadedFile
        }
        setLoading(true)
        try{
            const response = await postCertificate(payload)
            if(response.statusCode === 200){
                reset({
                    certificateName:'',
                    assignedPerson:'',
                    issuedDate:null,
                    validUpto:null,
                    uploadeCertificate:null,
                })
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                setPreview(null);
                setUploadedFile(null);
                setSelectedCertificateOption([])
                setFileType("");
                toast.success(response.message, {
                    className: 'custom-toast custom-toast-success',
                });
            } else {
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
    useEffect(() => {
        const fetchEmpList = async() =>{
            setLoading(true);
            try{
                const response = await empList()
                const fetchList = response?.data
                if(fetchList && Array.isArray(fetchList) ){
                    const option = fetchList.map((emp)=>({
                            label: `${emp.empid} - ${emp.ename}`,
                            value:emp._id,
                            raw:emp
                        }))
                    setOption(option)
                }
                }catch(error){
                    console.error('Failed to fetch employee list:');
                }
                 setLoading(false);
            }
            fetchEmpList()
        }, []); 

        const handleChange = (selectedOption, fieldOnChange) => {
            setSelectedEmp(selectedOption?.raw || null);
            fieldOnChange(selectedOption?.raw?._id);
        }

        const handleFilter = (option, inputValue) => {
            const { empid = "", ename = "" } = option.data.raw || {};
            const search = inputValue.toLowerCase();
            return empid.toLowerCase().includes(search) || ename.toLowerCase().includes(search);
        };

        useEffect(() => {
            const fetchCertificateList = async() =>{
                setLoading(true);
                 try{
                    const response = await getCertificateMasterList({})
                    const fetchList = response?.data
                    console.log(fetchList)
                    if(fetchList && Array.isArray(fetchList) ){
                        const option = fetchList.map((emp)=>({
                                label: emp.certificateName,
                                value:emp._id,
                            }))
                        setCertificateOption(option)
                    }
                }catch(error){
                    console.error('Failed to fetch employee list:');
                }
                 setLoading(false);
            }
            fetchCertificateList()
        }, []); 

        const handleCertificate = (selected) =>{
            setSelectedCertificateOption(selected)
            const selectedString = selected?.value || '';
            setValue('certificateName',selectedString)
            trigger('certificateName');
        }

    return(
        <div>
            <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <div className="row">
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
                      Certificate
                    </Typography>
                </Box>
            </div>
            <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}/>
            <div className="container-fluid">
                <div className="row">
                    <Form onSubmit={handleSubmit}>
                        <div className='row'>
                            <div className='col-sm-6 col-md-6 col-lg-6'>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fs-5 fw-bolder">Certificate Name<span className="text-danger">*</span></Form.Label>
                                     <Controller
                                        name="certificateName"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                options={certificateOption}
                                                isLoading={loading}
                                                value={selectedCertificateOption}
                                                placeholder="Search Certificate Name"
                                                onChange={handleCertificate}
                                            />
                                        )}
                                    />
                                    {errors.certificateName && <p className="text-danger">{errors.certificateName.message}</p>}
                                </Form.Group>
                                <div className='row'>
                                    <div className='col-sm-6 col-md-6 col-lg-6'>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fs-5 fw-bolder">Issued Date<span className="text-danger">*</span></Form.Label>
                                            <div className="row">
                                                <div className='col-sm-11 col-md-11 col-lg-11'>
                                                    <Controller
                                                        name="issuedDate"
                                                        control={control}
                                                        render={({ field }) => <DatePicker {...field} selected={field.value} onChange={(date) => field.onChange(date)} className="form-control" dateFormat="MMMM d, yyyy" placeholderText="Select Issued Date" />}
                                                    />
                                                {errors.issuedDate && <p className="text-danger">{errors.issuedDate.message}</p>}
                                                </div>
                                            </div>
                                        </Form.Group>
                                    </div>
                                    <div className='col-sm-6 col-md-6 col-lf-6'>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fs-5 fw-bolder">Valid Upto<span className="text-danger">*</span></Form.Label>
                                            <div className="row">
                                                <div className='col-sm-11 col-md-11 col-lg-11'>
                                                    <Controller
                                                        name="validUpto"
                                                        control={control}
                                                        render={({ field }) => <DatePicker {...field} selected={field.value} onChange={(date) => field.onChange(date)} className="form-control" dateFormat="MMMM d, yyyy" placeholderText="Valid Upto" />}
                                                    />
                                                    {errors.validUpto && <p className="text-danger">{errors.validUpto.message}</p>}
                                                </div>
                                            </div>
                                        </Form.Group>
                                    </div>
                                </div>
                            </div>
                            <div className='col-sm-6 col-md-6 col-lg-6'>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fs-5 fw-bolder">Assigned Person Name<span className="text-danger">*</span></Form.Label>
                                    <Controller
                                    name="assignedPerson"
                                    control={control}
                                    rules={{ required: "Assigned person is required" }}
                                    render={({ field }) => {
                                        const selectedOption =
                                        userRole === "SubAdmin" || userRole === "User"
                                            ? option.find((opt) => opt.value === userId) || null
                                            : option.find((opt) => opt.value === field.value) || null;
                                        if ((userRole === "SubAdmin" || userRole === "User") && selectedOption && field.value !== userId) {
                                        field.onChange(selectedOption.value);
                                        }
                                        return (
                                        <Select
                                            {...field}
                                            options={option}
                                            isLoading={loading}
                                            value={selectedOption}
                                            placeholder="Search By EmpId or Name"
                                            filterOption={handleFilter}
                                            onChange={(selected) => field.onChange(selected ? selected.value : null)}
                                            isClearable={userRole !== "SubAdmin" || userRole !== "User"}
                                            isDisabled={userRole === "SubAdmin" || userRole === "User"}
                                        />
                                        );
                                    }}
                                    />
                                    {errors.assignedPerson && <p className="text-danger">{errors.assignedPerson.message}</p>}
                                </Form.Group>
                                <Form.Group className="mt-3">
                                    <Form.Label className="fs-5 fw-bolder">Upload Certificate (PDF, Image)<span className="text-danger">*</span></Form.Label>
                                        <Controller
                                            name="uploadeCertificate"
                                            control={control}
                                            render={({  field: { onChange, onBlur, name, ref } }) => (
                                            <Form.Control
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    handleFileChange(e);
                                                    onChange(e.target.files[0]); 
                                                }}
                                                required
                                                accept=".pdf,.jpeg,.jpg"
                                            />
                                            )}
                                        />
                                        {errors.uploadeCertificate && (
                                            <p className="text-danger">{errors.uploadeCertificate.message}</p>
                                        )}
                                </Form.Group>
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
                            </div>
                        </div>
                        <div className="py-3">
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
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default CertificateForm;