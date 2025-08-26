// pages/ProjectListPage.js
import React, { useState, useEffect } from 'react';
import { getReportList ,deleteReportBYId} from '../../../api/reportApi/reportApi';
import ListView from '../../../components/listView/listView';
import Form from 'react-bootstrap/Form';
import { getRoundList } from '../../../api/roundApi/round'
import { useNavigate, useLocation } from 'react-router-dom';
import { getDeviceReportList } from '../../../api/deviceListAPI/decicelistApi'
import { getProjectNameList,getProjectTypeList } from '../../../api/ProjectDetailsAPI/projectDetailsApi'
import dayjs from 'dayjs'
import withReactContent from 'sweetalert2-react-content';
import { Box, TextField, Button, IconButton, Stack } from '@mui/material'
import { Visibility, Edit, Delete } from '@mui/icons-material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { MdAssignmentAdd } from "react-icons/md";
import Swal from 'sweetalert2'
import Select from 'react-select';
import Heading from '../../../components/Heading/heading';

const ReportList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0); // Total item count for pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [ProjectType, setProjectType] = useState("");
  const [roundOptions, setRoundOptions] = useState([]);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [projectTypeOptions, setProjectTypeOptions] = useState([]);
  const [projectNameOptions, setProjectNameOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const location = useLocation();
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);
  // Define columns and a mapping for the column names
  const columns = [
     {
      field: 'serial',
      headerName: 'S. No.',
      width: 70,
      sortable: false,
      filterable: false
    },
    { field: 'projectName', headerName: 'Project Name', flex: 1.5, minWidth: 200 },
    { field: 'projectType', headerName: 'Project Type', flex: 1.5, minWidth: 200 },
    { field: 'devices', headerName: 'Devices', flex: 1.5, minWidth: 200 },
    { field: 'round', headerName: 'Round', flex: 1.5, minWidth: 200 },
    { field: 'vulnerabilityName', headerName: 'vulnerability Name', flex: 1.5, minWidth: 200 },
    { field: 'sevirty', headerName: 'sevirty', flex: 1.5, minWidth: 200 },
    { field: 'createdAt', headerName: 'created At', flex: 1.5, minWidth: 200 },
    {
          field: 'actions',
          headerName: 'Actions',
          flex: 1,
          minWidth: 120,
          sortable: false,
          renderCell: (params) => (
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={()=>handleViewClick(params.row._id)} size="small"
              >
                <Visibility />
              </IconButton>
              {(userRole !== 'User') && (
                <>
                  <IconButton
                    onClick={()=>handleEditClick(params.row._id)} size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton onClick={()=>handleDelete(params.row._id)} size="small">
                    <Delete color="error" />
                  </IconButton>
                </>
              )}
            </Stack>
          )
        }
  ];

   useEffect(()=>{
    const fetchProjectName = async()=>{
      setLoading(true)
      try{
          const response=await getProjectNameList()
          const data = response.data
          const options = data.map(projectName => ({
            value: projectName._id,  
            label: projectName.projectName,  
          }));
          setProjectNameOptions(options)
      }catch(error){
        console.log('unable to fetch Project Name')
      } finally{
        setLoading(false)
      }
    }
    fetchProjectName()
  },[]) 

   useEffect(()=>{
    const fetchProjectType = async()=>{
      setLoading(true)
      try{
          const selectedProjectId = selectedProjectName.value; 
          const response=await getProjectTypeList(selectedProjectId)
          const data = response.data
          const options = data.map(projectType => ({
            value: projectType,  
            label: projectType,  
          }));
          setProjectTypeOptions(options)
      }catch(error){
        console.log('unable to fetch Project Type')
      } finally{
        setLoading(false)
      }
    }
    fetchProjectType()
  },[selectedProjectName])

  useEffect(()=>{
    const fetchDevices = async()=>{
      setLoading(true)
      try{
        if(selectedProjectName && selectedProjectType){
            const projectName = selectedProjectName.value;
            const projectType = selectedProjectType.label;
            const response=await getDeviceReportList(projectName,projectType)
            const data = response?.data?.data
            const options = data.map(device => ({
              value: device,  
              label: device,  
            }));
            setDeviceOptions(options)
          } else{
            // setDeviceOptions('Pleae Select Project Name and Type')
          }
         
      }catch(error){
        console.log('unable to fetch Devices')
      } finally{
        setLoading(false)
      }
    }
    fetchDevices()
  },[selectedProjectName,selectedProjectType])

  useEffect(()=>{
    const fetchRound = async () =>{
      setLoading(true)
      try{
        if((selectedProjectName && selectedProjectType)||(selectedProjectName && selectedProjectType && selectedDevice)){
          const projectName = selectedProjectName.value;
          const projectType = ProjectType
          const devices = selectedDevice?.label
          const response=await getRoundList(projectName,projectType,devices)
          const data = response.data.data
          if(response?.data.statusCode === 200){
            const options = data.map(round => ({
            value: round,  
            label: `Round ${round}`,  
          }));
          setRoundOptions(options)
          } else {
            setRoundOptions()
          }

        }
      }catch(error){
        console.log('unable to fetch round')
      } finally{
        setLoading(false)
      }
    } 
    fetchRound()
  },[selectedProjectName,selectedProjectType, selectedDevice])

  const fetchData = async () => {
    setLoading(true);
    try {
      if((selectedRound?.value && selectedDevice?.value && selectedProjectType?.value && selectedProjectName?.value) || (selectedRound?.value && selectedProjectType?.value && selectedProjectName?.value)){
        const response = await getReportList({
          page: page + 1,
          search: searchQuery.trim(), 
          round: selectedRound?.value,
          devices:selectedDevice?.value,
          projectType:selectedProjectType?.value,
          projectName:selectedProjectName?.value,
          limit: pageSize
        });
        const transformedData = response.data.map((item,index) => ({
          ...item,
          serial: page * pageSize + index + 1,
          projectType: Array.isArray(item.projectType) && item.projectType.length > 0
            ? item.projectType[0]?.ProjectTypeName || 'N/A'
            : item.projectType || 'N/A',
            createdAt: item.createdAt ? dayjs(item.createdAt).format('DD-MM-YYYY') : 'N/A',
        }));
  
        setData(transformedData);
        setTotalCount(response.total);
        setTotalPages(response.totalPages);
      }
      else{
        setData([]);
        setTotalCount(0)
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery,selectedRound,selectedDevice,selectedProjectType,selectedProjectName]); 

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); 
  };

  const handleAddNewClick = () => {
    navigate("/newReport");  
  };
  const handleViewClick = (data) => {
    const id = data
    navigate(`/newReportView/${id}`);  
  };
  const handleEditClick = (data)=>{
    const id =data
    navigate(`/editReport/${id}`); 
  }
  const handleRound = (selectedOption) => {
    setSelectedRound(selectedOption);
    setPage(1);
  };

  const handleDeviceChange = (selected)=>{
    setSelectedDevice(selected)
    setSelectedRound(null)
    setPage(1);
  }

  const handleProjectType = (selected) => {
    setSelectedProjectType(selected)
    setProjectType(selected.label)
    setSelectedRound(null)
    setSelectedDevice(null)
    setPage(1);
  }

  const handleProjectName = (selected) =>{
    setSelectedProjectName(selected)
    setSelectedDevice(null)
    setSelectedProjectType(null)
    setProjectType(null)
    setSelectedRound(null)
    setPage(1);
  }
  const handleDelete = async (data) => {
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
      const id =data
      const response = await deleteReportBYId(id);
  
      if (response.statusCode === 200) {
         MySwal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: response.message,
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData()
  
      } else {
         MySwal.fire({
          icon: 'error',
          title: 'Error!',
          text: response.message,
        });
      }
    } catch (error) {
      MySwal.fire({
      icon: 'error',
      title: 'Oops...',
      text: error?.message || 'Something went wrong!',
    });
    }
  };

  return (
    <div>
      <div className='container-fluid pb-3'>
        <Heading title="List Of Vulnability"/>
         <hr className="my-3" style={{ height: '4px', backgroundColor: '#000', opacity: 1 }}/>
      </div>
      <Box
        sx={{
            display: 'flex',
            justifyContent: 'right',
            paddingRight: '60px'
        }}
      >
        <div>
            <Button variant="contained" color="primary" disabled={loading} onClick={handleAddNewClick}>ADD New</Button>
        </div>
      </Box>
      <div className='container-fluid pt-3'>
        <div className='row'>
          <div className='col-sm-3 col-md-3 col-lg-3'>
            <Form.Group>
               <Form.Label className='fs-5 fw-bolder'>Project Name<span className="text-danger">*</span></Form.Label>
               <Select
                  options={projectNameOptions}
                  value={selectedProjectName}
                  onChange={handleProjectName}
                  placeholder='Select Project Name'
               />
            </Form.Group>
          </div>
           <div className='col-sm-3 col-md-3 col-lg-3'>
             <Form.Group>
                <Form.Label className="fs-5 fw-bolder">Project Type<span className="text-danger">*</span></Form.Label>
                <Select
                  options={projectTypeOptions}
                  value={selectedProjectType}
                  onChange={handleProjectType}
                  placeholder='Please Select Project Type'
                />
              </Form.Group>
           </div>
           {ProjectType === "Network Devices" &&(
              <div className='col-sm-3 col-md-3 col-lg-3'>
                 <Form.Group>
                    <Form.Label className="fs-5 fw-bolder">Devices<span className="text-danger">*</span></Form.Label>
                      <Select
                        options={deviceOptions}
                        value={selectedDevice}
                        onChange={handleDeviceChange}
                        placeholder='Please Select Device'
                      />
                 </Form.Group>
              </div>
           )}
           <div className='col-sm-3 col-md-3 col-lg-3'>
              <Form.Group>
                 <Form.Label className="fs-5 fw-bolder">Round<span className="text-danger">*</span></Form.Label>
                  <Select
                    options={roundOptions}
                    value={selectedRound}
                    onChange={handleRound}
                    placeholder="Select Round"
                  />
              </Form.Group>
           </div>
        </div>
      </div> 
      <div className='container-fluid py-5'>
         {/* <TextField
            fullWidth
            label="Search here..."
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            margin="normal"
            size="small"
            sx={{
              backgroundColor: 'white',
            }}
          /> */}
           <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <CustomDataGrid
                  key={pageSize}
                  rows={data}
                  getRowId={(row) => row._id}
                  columns={columns}
                  loading={loading}
                  paginationModel={{ page, pageSize }}
                  onPaginationModelChange={({ page, pageSize }) => {
                    setPage(page);
                    setPageSize(pageSize);
                  }}
                  rowCount={totalCount}
                  noRowsLabel={
                    (selectedRound?.value && selectedDevice?.value && selectedProjectType?.value && selectedProjectName?.value) ||
                    (selectedRound?.value && selectedProjectType?.value && selectedProjectName?.value)
                      ? "No Data Found"
                      : "Please Select filter"
                  }
                  paginationMode="server"
                  autoHeight
              />
           </Box>
      </div>
    </div>
  );
};

export default ReportList;
