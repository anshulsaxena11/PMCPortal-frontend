import React, { useState, useEffect } from 'react';
import { getProjectNameList } from '../../api/ProjectDetailsAPI/projectDetailsApi';
import Select from 'react-select';
import { getProjectDetailsTimelineById, putProjectDetailsTimelineById } from '../../api/TimelineAPI/timelineApi';
import { useForm } from "react-hook-form";
import Popup from '../../components/popupBox/PopupBox';
import { Form, Table } from "react-bootstrap";
import { srpiEmpTypeListActive } from "../../api/syncEmp/syncEmp";
import { IoIosArrowDropdownCircle, IoIosArrowDropupCircle } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import Heading from '../../components/Heading/heading';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material'
import { CiViewList } from "react-icons/ci";
import { TbPlaylistAdd } from "react-icons/tb";
import { CgPlayListRemove } from "react-icons/cg";
import { FaRegCheckCircle } from "react-icons/fa";
import CircularProgress from '@mui/material/CircularProgress';
import { IoIosSave } from "react-icons/io";
import { Timeline, TimelineEvent } from '@mailtop/horizontal-timeline';
import './timeline.css'

const Timelines = () => {
    const { register, setValue, reset, getValues  } = useForm();
    const [loading, setLoading] = useState(false);
    const [ProjectName, setProjectName] = useState([]);
    const [SelectedProjectName, setselectedProjectName] = useState();
    const [showModal, setShowModal] = useState(false); 
    const [viewData, setViewData] = useState([]);
    const [userRole, setUserRole] = useState(null); 
    const [projectCreatedAt, setProjectCreatedAt] = useState('');
    const [oneStaus,setOneStatus] = useState(false)
    const [Phase, setPhase] = useState([ 
        { projectStartDate: "", testCompletedEndDate: "", reportSubmissionEndDate: "", comments: "" }
    ]);
    const [invoiceGenerate, setInvoiceGenerate] = useState([
        { invoiceDate:"", invoiceValue:"", amountRaised:""}
    ])
    const [resourceMapping, setResourceMapping] = useState([]); 

    const [expandedPhases, setExpandedPhases] = useState({});
    const [expandedInvoceGenerated, setExpandedInvoceGenerated] = useState({});

    const statusOptions = [
        {value:'Work Order Recived',label:'Work Order Recived'},
        {value:'Ongoing',label:'Ongoing'},
        {value:'On Hold',label:'On Hold'},
        {value:'Complete',label:'Complete'},
        {value:'Closed',label:'Closed'},
    ]

    const [selectStatus,setSelectStatus]= useState([]);
    const [valueStatus,setValueStaus] = useState()
    const formValues = getValues();

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        setUserRole(role);;
    }, []);

    useEffect(() => {
        const fetchEmpList = async () => {
            if (!SelectedProjectName) return;
            setLoading(true);
            try {
                const response = await srpiEmpTypeListActive({ projectId: SelectedProjectName.value });
            
                  if (response && response.data) {
                    setViewData(response.data); 
                } 
                
            } catch (error) {
                console.error('Failed to fetch employee list:');
            }
            setLoading(false);
        };
        fetchEmpList();
    }, [SelectedProjectName]);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                if(!oneStaus){
                const id = SelectedProjectName.value;
                const response = await getProjectDetailsTimelineById(id);
                const fetchedData = response?.data; 
                const fetchPhase = fetchedData?.projectPhase; 
                console.log(fetchPhase)
                if (fetchedData) {
                    const formattedStartDate = fetchedData.startDate?.split("T")[0] || "";
                    const formattedEndDate = fetchedData.endDate?.split("T")[0] || "";
                    const formatedcreatedAt = fetchedData.createdAt?.split("T")[0] || "";
                  reset({
					  ...fetchedData,
				  startDate: formattedStartDate,
				  endDate: formattedEndDate,
				  projectName: fetchedData.projectName,
				  orginisationName: fetchedData.orginisationName,
				  projectValue: fetchedData.projectValue,
				});
				
                if (fetchPhase?.amountStatus && statusOptions.length > 0) {
                    const matchedStatus = statusOptions.find(
                        (item) => item.value === fetchPhase.amountStatus
                    );
                    setSelectStatus(matchedStatus || null);
                }
                setProjectCreatedAt(formatedcreatedAt);
                setResourceMapping(fetchedData.resourseMapping || []);
                if (!fetchPhase ||!Array.isArray(fetchPhase.phase)||fetchPhase.phase.length === 0 ){
                    setPhase([]);
                } else if (fetchPhase.phase && Array.isArray(fetchPhase.phase)) {
                    const formattedPhases = fetchPhase.phase.map((p, index) => ({
                        noOfPhases: `Phase ${index + 1}`,
                        projectStartDate: p.projectStartDate?.split('T')[0] || '',
                        testCompletedEndDate: p.testCompletedEndDate?.split('T')[0] || '',
                        reportSubmissionEndDate: p.reportSubmissionEndDate?.split('T')[0] || '',
                        comments: p.comments || '',
                    }));
                        setPhase(formattedPhases);
                        const expandedInit = {};
                        formattedPhases.forEach((_, idx) => {
                            expandedInit[idx] = false;
                        });
                        setExpandedPhases(expandedInit);
                    }
                     if (!fetchPhase ||!Array.isArray(fetchPhase.invoiceGenerated)||fetchPhase.invoiceGenerated.length === 0 ){
                        setInvoiceGenerate([]);
                    } else if (fetchPhase.invoiceGenerated && Array.isArray(fetchPhase.invoiceGenerated)) {
                        const formattedInvoice = fetchPhase.invoiceGenerated.map((p, index) => ({
                            noOfInvoice: `Invoice ${index + 1}`,
                            invoiceDate: p.invoiceDate?.split('T')[0] || '',
                            invoiceValue: p.invoiceValue || '',
                            amountRaised: p.amountRaised || '',
                        }));
                        setInvoiceGenerate(formattedInvoice)
                        const expandedInitInvoice = {};
                        formattedInvoice.forEach((_, idx) => {
                            expandedInitInvoice[idx] = false;
                        });
                        setExpandedInvoceGenerated(expandedInitInvoice);
                    }
                    setOneStatus(true)
                }
                } else {
                    console.log("No data received for the project.");
                }
            } catch (error) {
                console.error('Error fetching project details:');
            } finally {
                setLoading(false);
            }
        };
        if (SelectedProjectName?.value) {
            fetchProjectDetails();
        }
    }, [SelectedProjectName, reset, statusOptions,oneStaus]);

    useEffect(() => {
        const fetchProjectNameList = async () => {
            setLoading(true);
            try {
                const data = await getProjectNameList();
                if (data?.statusCode === 200 && Array.isArray(data.data)) {
                    const options = data.data.map((centre) => ({
                        value: centre._id,
                        label: centre.projectName,
                    }));
                    setProjectName(options);
                } else {
                    throw new Error("Unexpected data format or empty project list");
                }
            } catch (err) {
                console.error("Error fetching project types:");
            } finally {
                setLoading(false);
            }
        };

        fetchProjectNameList();
    }, []);

    const handleProjectName = (e) => {
        setselectedProjectName(e);
        setExpandedPhases({}); 
        setOneStatus(false)
    };

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

     const handleAddInvoiceStep = () => {
        const newIndex = invoiceGenerate.length + 1;
        setInvoiceGenerate([
            ...invoiceGenerate,
            {
                noOfInvoice: `Invoice ${newIndex}`,
                invoiceDate: "",
                invoiceValue: "",
                amountRaised: "",
            },
        ]);
        setExpandedInvoceGenerated(prev => ({ ...prev, [invoiceGenerate.length]: true }));
    };

    const handleAddStep = () => {
        const newIndex = Phase.length + 1;
        setPhase([
            ...Phase,
            {
                noOfPhases: `Phase ${newIndex}`,
                projectStartDate: "",
                testCompletedEndDate: "",
                reportSubmissionEndDate: "",
                comments: "",
            },
        ]);
        setExpandedPhases(prev => ({ ...prev, [Phase.length]: true }));
    };

    const handleRemoveStep = (index) => {
        const updatedSteps = Phase.filter((_, i) => i !== index);
        const reindexedSteps = updatedSteps.map((step, idx) => ({
            ...step,
            noOfPhases: `Phase ${idx + 1}`,
        }));
        setPhase(reindexedSteps);


        setExpandedPhases(prev => {
            const newExpanded = {};
            reindexedSteps.forEach((_, idx) => {
                newExpanded[idx] = prev[idx >= index ? idx + 1 : idx] ?? false; 
            });
            return newExpanded;
        });
    };

    const handleRemoveInvoiceStep = (index) => {
        const updatedSteps = invoiceGenerate.filter((_, i) => i !== index);
        const reindexedSteps = updatedSteps.map((step, idx) => ({
            ...step,
            noOfInvoice: `Invoice ${idx + 1}`,
        }));
        setInvoiceGenerate(reindexedSteps);


        setExpandedInvoceGenerated(prev => {
            const newExpanded = {};
            reindexedSteps.forEach((_, idx) => {
                newExpanded[idx] = prev[idx >= index ? idx + 1 : idx] ?? false; 
            });
            return newExpanded;
        });
    };

    const handleChangeInvoiceInput = (index, field, value) => {
        const updatedPhases = [...invoiceGenerate];
        updatedPhases[index][field] = value;
        setInvoiceGenerate(updatedPhases);
    };

    const handleChangePhaseInput = (index, field, value) => {
        const updatedPhases = [...Phase];
        updatedPhases[index][field] = value;
        setPhase(updatedPhases);
    };

   const toggleExpandInvoice = (index) => {
        setExpandedInvoceGenerated((prev) => {
            if (prev[index]) {
                return {};
            }
            return { [index]: true };
        });
    };

    const toggleExpandPhase = (index) => {
        setExpandedPhases((prev) => {
            if (prev[index]) {
                return {};
            }
            return { [index]: true };
        })
    };

    const handleSubmitAllPhases = async () => {
        if (!SelectedProjectName?.value) {
            toast.error("Please select a project first");
            return;
        }
        const payload = {
            amountStatus:valueStatus,
            invoiceGenerated: invoiceGenerate.map((item,index)=>({
                ...item,
                noOfInvoice: `Invoice ${index + 1}`,
            })),
            phase: Phase.map((item, index) => ({
                ...item,
                noOfPhases: `Phase ${index + 1}`,
            })), 
        };

        try {
            const response = await putProjectDetailsTimelineById(SelectedProjectName.value, payload);

            if (response.statuscode === 200) {
                toast.success("All phases submitted successfully!", {
                    className: 'custom-toast custom-toast-success',
                });;
                const formattedPhases = response.data.phase.map((p, i) => ({
                    noOfPhases: `Phase ${i + 1}`,
                    projectStartDate: p.projectStartDate?.split('T')[0] || '',
                    testCompletedEndDate: p.testCompletedEndDate?.split('T')[0] || '',
                    reportSubmissionEndDate: p.reportSubmissionEndDate?.split('T')[0] || '',
                    comments: p.comments || '',
                }));
                setPhase(formattedPhases);

                const expandedInit = {};
                formattedPhases.forEach((_, idx) => {
                    expandedInit[idx] = true;
                });
                setExpandedPhases(expandedInit);
                const formattedInvoice = response.data.invoiceGenerated.map((p, i) => ({
                    noOfInvoice: `Invoice ${i + 1}`,
                    invoiceDate: p.invoiceDate?.split('T')[0] || '',
                    invoiceValue: p.invoiceValue || '',
                    amountRaised: p.amountRaised || '',
                }));
                setInvoiceGenerate(formattedInvoice)
                const expandedInitInvoice = {};
                    formattedInvoice.forEach((_, idx) => {
                    expandedInitInvoice[idx] = true;
                    });
                setExpandedInvoceGenerated(expandedInitInvoice)
                setOneStatus(false)
            } else {
                toast.error("Failed to submit phases.", {
                    className: "custom-toast custom-toast-error",
                });
            }
        } catch (error) {
            toast.error(error.message, {
                className: "custom-toast custom-toast-error",
            });
        }
    };

    const isAddInvoiceDisabled = () =>{
         return invoiceGenerate.some(
            (invoiceGenerate) =>
                !invoiceGenerate.invoiceDate ||
                !invoiceGenerate.invoiceValue || 
                !invoiceGenerate.amountRaised
        );
    }
    const isAddPhaseDisabled = () => {
        return Phase.some(
            (phase) =>
                !phase.projectStartDate ||
                !phase.testCompletedEndDate 
                // !phase.reportSubmissionEndDate ||
                // !phase.comments
        );
    };
        const handleStatusChange = (e) =>{
            const selected= e?.label
            setSelectStatus(e)
            setValueStaus(selected)
        }
    return (
        <div>
            <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <Popup show={showModal} handleClose={handleCloseModal} title="Resource Allotment" showFooter={false} style={{ position: 'fixed',top: '50%',left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999}}>
                <div>
                    {resourceMapping.length > 0 ? (
                        <div style={{ maxHeight: '400px', overflowY: 'auto',maxWidth:'1000px'}}>
                            <Table striped bordered hover responsive style={{ maxWidth: '1000px', margin: 'auto' }}>
                                <thead>
                                    <tr>
                                        <th>S. No.</th>
                                        <th>Name</th>
                                        <th>Designation</th>
                                        <th>Centre</th>
                                        <th>Directorates</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resourceMapping.map((resource, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{resource.ename}</td>
                                            <td>{resource.edesg}</td>
                                            <td>{resource.centre}</td>
                                            <td>{resource.dir}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <p>No resources mapped for this project.</p>
                    )}
                </div>
            </Popup>

            <div className="container">
                <Heading title="Project Management"/>
                <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}/>
                <Select
                    options={ProjectName}
                    value={SelectedProjectName}
                    onChange={handleProjectName}
                    placeholder="Select Project Name"
                    isClearable
                />
                
                {SelectedProjectName && (
                    <div>
                        <div className="row mt-4">
                            <div className="col-md-3">
                                <Form.Group>
                                    <Form.Label className="fs-5 fw-bolder">Project Name</Form.Label>
                                    <Form.Control type="text" readOnly disabled {...register("projectName")} />
                                </Form.Group>
                            </div>
                            <div className="col-md-3">
                                <Form.Group>
                                    <Form.Label className="fs-5 fw-bolder">Organisation Name</Form.Label>
                                    <Form.Control type="text" readOnly disabled {...register("orginisationName")} />
                                </Form.Group>
                            </div>
                            <div className="col-md-3">
                                <Form.Group className="fs-5 fw-bolder">
                                    <Form.Label>Project Start Date</Form.Label>
                                    <Form.Control type="date" readOnly  disabled {...register("startDate")} />
                                </Form.Group>
                            </div>
                            <div className="col-md-3">
                                <Form.Group className="fs-5 fw-bolder">
                                    <Form.Label>Project End Date</Form.Label>
                                    <Form.Control type="date" readOnly disabled {...register("endDate")} />
                                </Form.Group>
                            </div>
                        </div>
                        <div className='row pt-3'>
                            <div className="col-md-3">
                                <Form.Group>
                                    <Form.Label className="fs-5 fw-bolder">Project Value</Form.Label>
                                    <Form.Control type="text" disabled readOnly {...register("projectValue")} />
                                </Form.Group>
                            </div>
                            <div className="col-md-3">
                                <Form.Group>
                                    <Form.Label className="fs-5 fw-bolder">Status</Form.Label>
                                    <Select
                                        options={statusOptions}
                                        value={selectStatus}
                                        onChange={handleStatusChange}
                                        placeholder="Select Status"
                                        isClearable
                                    />
                                </Form.Group>
                            </div>
                        </div>
                         <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'right',
                                 
                            }}
                        >
                            <div>
                                <Button variant="contained" color="primary" disabled={loading} startIcon={!loading && <CiViewList />} onClick={handleShowModal}>Resource Allotment</Button>
                            </div>
                        </Box>
                        <h4>Invoice Generated</h4>
                        <div className='container'>
                            <div className='row pt-3'>
                                {invoiceGenerate.length === 0 && 
                                    <>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <p>No Invoice found.</p>
                                         {(userRole !== 'User') && (
                                            <Button
                                                color="success"
                                                variant="contained"
                                                onClick={handleAddInvoiceStep}
                                                disabled={loading}
                                                startIcon={!loading && <TbPlaylistAdd  />}
                                            >
                                                Add Invoice
                                            </Button>
                                        )}
                                    </div>
                                </>
                                }
                                {invoiceGenerate.map((invoice, index) => (
                                    <div key={index} className="mb-3 bg-info bg-opacity-10 border border-info border-start-0 rounded-end p-3 rounded">
                                        <div 
                                            style={{ cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                                            onClick={() => toggleExpandInvoice(index)}>
                                            <h5>{invoice.noOfInvoice}</h5>
                                            <Button
                                                variant="black"
                                                size="sm"
                                                aria-expanded={expandedInvoceGenerated[index] ? "true" : "false"}
                                            >
                                                {expandedInvoceGenerated[index] ? <IoIosArrowDropupCircle /> : <IoIosArrowDropdownCircle />}
                                            </Button>   
                                        </div>
                                        {expandedInvoceGenerated[index] && (
                                            <div className="mt-3">
                                                <div className='row'>
                                                    <div className='col-sm-4 col-md-4 col-lg-4'>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fs-6 fw-bolder">Invoice Date</Form.Label>
                                                            <Form.Control
                                                            type="date"
                                                            value={invoice.invoiceDate}
                                                            onChange={(e) =>
                                                                handleChangeInvoiceInput(index, "invoiceDate", e.target.value)
                                                            }
                                                        />
                                                        </Form.Group>
                                                    </div>
                                                    <div className='col-sm-4 col-md-4 col-lg-4'>
                                                        <Form.Group className="mb-3">
                                                        <Form.Label className="fs-6 fw-bolder">Invoice Raised ₹ (GST)</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            rows={2}
                                                            value={invoice.invoiceValue}
                                                            onChange={(e) =>
                                                                handleChangeInvoiceInput(index, "invoiceValue", e.target.value)
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (["e", "E", "+", "-"].includes(e.key)) {
                                                                e.preventDefault();
                                                                }
                                                            }}
                                                        />
                                                    </Form.Group>
                                                    </div>
                                                    <div className='col-sm-4 col-md-4 col-lg-4'>
                                                        <Form.Group className="mb-3">
                                                        <Form.Label className="fs-6 fw-bolder">Amount Raised ₹ (GST)</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            rows={2}
                                                            value={invoice.amountRaised}
                                                            onChange={(e) =>
                                                                handleChangeInvoiceInput(index, "amountRaised", e.target.value)
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (["e", "E", "+", "-"].includes(e.key)) {
                                                                e.preventDefault();
                                                                }
                                                            }}
                                                        />
                                                    </Form.Group>
                                                    </div>
                                                </div>
                                                {(userRole !== 'User') && (
                                                    <div className= 'py-3' style={{ cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                        <div>
                                                            {index === invoiceGenerate.length - 1 && (
                                                                <Button
                                                                    color="success"
                                                                    variant="contained"
                                                                    startIcon={!loading && <TbPlaylistAdd  />}
                                                                    onClick={handleAddInvoiceStep}
                                                                    disabled={isAddInvoiceDisabled()}
                                                                >
                                                                    Add Invoice
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div>
                                                        {(invoiceGenerate.length > 1) && (
                                                            <Button
                                                                color="error"
                                                                variant="contained"
                                                                disabled={loading}
                                                                startIcon={!loading && <CgPlayListRemove  />}
                                                                onClick={() => handleRemoveInvoiceStep(index)}
                                                                className="mt-2"
                                                            >
                                                                Remove Invoice
                                                            </Button>
                                                        )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}/>
                        <h4>Project Phases</h4>
                        <div className='container'>
                            <div className='row'>
                            {Phase.length === 0 && 
                                <>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <p>No phases found.</p>
                                        {(userRole !== 'User') && (
                                            <Button
                                                color="success"
                                                variant="contained"
                                                disabled={loading}
                                                startIcon={!loading && <TbPlaylistAdd  />}
                                                onClick={handleAddStep}
                                            >
                                                Add Phase
                                            </Button>
                                        )}
                                    </div>
                                </>
                            }
                            {Phase.map((phase, index) => (
                                <div key={index} className="mb-3 bg-info bg-opacity-10 border border-info border-start-0 rounded-end p-3 rounded">
                                    <div 
                                    style={{ cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                                    onClick={() => toggleExpandPhase(index)}>
                                        <h5>{phase.noOfPhases}</h5>
                                        <Button
                                            variant="black"
                                            size="sm"
                                            aria-expanded={expandedPhases[index] ? "true" : "false"}
                                        >
                                            {expandedPhases[index] ? <IoIosArrowDropupCircle /> : <IoIosArrowDropdownCircle />}
                                        </Button>        
                                    </div>
                                    {expandedPhases[index] && (
                                        <div className="mt-3">
                                            <div className='row'>
                                                <div className='col-sm-4 col-md-4 col-lg-4'>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fs-6 fw-bolder">Start Date</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={phase.projectStartDate}
                                                            onChange={(e) =>
                                                                handleChangePhaseInput(index, "projectStartDate", e.target.value)
                                                            }
                                                        />
                                                    </Form.Group>
                                                </div>
                                                <div className='col-sm-4 col-md-4 col-lg-4'>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fs-6 fw-bolder">Test Completion Date</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            disabled={!phase.projectStartDate}
                                                            min={phase.projectStartDate || ''}
                                                            value={phase.testCompletedEndDate}
                                                            onChange={(e) =>
                                                                handleChangePhaseInput(index, "testCompletedEndDate", e.target.value)
                                                            }
                                                        />
                                                    </Form.Group>
                                                </div>
                                                <div className='col-sm-4 col-md-4 col-lg-4'>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fs-6 fw-bolder">Report Submitted Date</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            disabled={!phase.testCompletedEndDate}
                                                            min={phase.testCompletedEndDate || ''}
                                                            value={phase.reportSubmissionEndDate}
                                                            onChange={(e) =>
                                                                handleChangePhaseInput(index, "reportSubmissionEndDate", e.target.value)
                                                            }
                                                        />
                                                    </Form.Group>
                                                </div>
                                            </div>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fs-6 fw-bolder">Comments</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    value={phase.comments}
                                                    onChange={(e) =>
                                                        handleChangePhaseInput(index, "comments", e.target.value)
                                                    }
                                                />
                                            </Form.Group>
                                                {(userRole !== 'User') && (
                                                    <div className='py-3' style={{ cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                        <div>
                                                            {index === Phase.length - 1 && (
                                                                <Button
                                                                    color="success"
                                                                    variant="contained"
                                                                    startIcon={!loading && <TbPlaylistAdd  />}
                                                                    onClick={handleAddStep}
                                                                    disabled={isAddPhaseDisabled()}
                                                                >
                                                                    Add Phase
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div>  
                                                        {(Phase.length > 1) &&(
                                                            <Button
                                                                color="error"
                                                                variant="contained"
                                                                startIcon={!loading && <CgPlayListRemove  />}
                                                                onClick={() => handleRemoveStep(index)}
                                                            
                                                            >
                                                                Remove Phase
                                                            </Button>
                                                        )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            </div>
                        </div>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'right',
                                mt: 4, 
                            }}
                        >
                            {(userRole !== 'User') && (
                                <div className="py-4" style={{ cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Button variant="contained"  color="primary"  disabled={loading}  startIcon={!loading && <IoIosSave />}  sx={{paddingX: 3,paddingY: 1,fontWeight: 'bold',borderRadius: 3,fontSize: '1rem',letterSpacing: '0.5px',boxShadow: 3,}}onClick={handleSubmitAllPhases}>
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'SAVE'}
                                    </Button>
                                </div>
                            )}
                        </Box>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Timelines;
