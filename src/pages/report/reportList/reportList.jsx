// pages/ProjectListPage.js
import React, { useState, useEffect } from 'react';
import { getReportList ,deleteReportBYId} from '../../../api/reportApi/reportApi';
import ListView from '../../../components/listView/listView';
import {getAllRound} from '../../../api/roundApi/round'
import { useNavigate } from 'react-router-dom';
import {getDeviceList} from '../../../api/deviceListAPI/decicelistApi'
import { getProjectNameList } from '../../../api/ProjectDetailsAPI/projectDetailsApi'
import {getProjectTypeList} from '../../../api/projectTypeListApi/projectTypeListApi'
import dayjs from 'dayjs'
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2'

const ReportList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0); // Total item count for pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [roundOptions, setRoundOptions] = useState([]);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [projectTypeOptions, setProjectTypeOptions] = useState([]);
  const [projectNameOptions, setProjectNameOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  // Define columns and a mapping for the column names
  const columns = [
    'projectName',
    'projectType',
    'devices',
    'round',
    'vulnerabilityName',
    'sevirty',
    'createdAt', 
  ];

  const columnNames = {
    projectName: 'Project Name',
    projectType: 'Project Type',
    devices:'Devices',
    round:'Round',
    vulnerabilityName: 'vulnerability Name',
    sevirty: 'sevirty',
    createdAt: 'created At',
  };

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
          const response=await getProjectTypeList()
          const data = response.data
          const options = data.map(projectType => ({
            value: projectType.ProjectTypeName,  
            label: projectType.ProjectTypeName,  
          }));
          setProjectTypeOptions(options)
      }catch(error){
        console.log('unable to fetch Project Type')
      } finally{
        setLoading(false)
      }
    }
    fetchProjectType()
  },[])

  useEffect(()=>{
    const fetchDevices = async()=>{
      setLoading(true)
      try{
          const response=await getDeviceList()
          const data = response.data
            const options = data.map(device => ({
            value: device.devicesName,  
            label: device.devicesName,  
          }));
          setDeviceOptions(options)
         
      }catch(error){
        console.log('unable to fetch Devices')
      } finally{
        setLoading(false)
      }
    }
    fetchDevices()
  },[])

  useEffect(()=>{
    const fetchRound = async () =>{
      setLoading(true)
      try{
          const response=await getAllRound()
          const data = response.data
          if(data.statuscode === 200){
            const options = data.data.map(round => ({
            value: round.value,  
            label: round.label,  
          }));
          setRoundOptions(options)
          } else {
            setRoundOptions()
          }
      }catch(error){
        console.log('unable to fetch round')
      } finally{
        setLoading(false)
      }
    } 
    fetchRound()
  },[])

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getReportList({
        page,
        search: searchQuery.trim(), 
        round: selectedRound?.value,
        devices:selectedDevice?.value,
        projectType:selectedProjectType?.value,
        projectName:selectedProjectName?.value,
        limit: 10
      });
      const transformedData = response.data.map(item => ({
        ...item,
        projectType: Array.isArray(item.projectType) && item.projectType.length > 0
          ? item.projectType[0]?.ProjectTypeName || 'N/A'
          : item.projectType || 'N/A',
          createdAt: item.createdAt ? dayjs(item.createdAt).format('DD-MM-YYYY') : 'N/A',
      }));

      setData(transformedData);
      setTotalCount(response.total);
      setTotalPages(response.totalPages);
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
    const id = data._id
    navigate(`/newReportView/${id}`);  
  };
  const handleEditClick = (data)=>{
    const id =data._id
    navigate(`/editReport/${id}`); 
  }
  const handleRound = (selectedOption) => {
    setSelectedRound(selectedOption);
    setPage(1);
  };

  const handleDeviceChange = (selected)=>{
    setSelectedDevice(selected)
    setPage(1);
  }

  const handleProjectType = (selected) => {
    setSelectedProjectType(selected)
    setPage(1);
  }

  const handleProjectName = (selected) =>{
    setSelectedProjectName(selected)
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
      const id =data._id
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
      <ListView
        title="Vulnerability List"
        buttonName="Add New"
        onAddNewClick={handleAddNewClick}
        columns={columns}
        columnNames={columnNames}
        data={data}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        loading={loading}
        onViewClick={handleViewClick}
        onEditClick={handleEditClick}
        showEditView={true}
        showFilters={true}
        showFiltersStatus={true}
        StatusName="Round"
        statusOptions={roundOptions}
        selectedStatus={selectedRound}
        setSelectedStatus={handleRound}
        etpeTypeName="Device"
        etpeOptions={deviceOptions}
        selectedEtpe={selectedDevice}
        setSelectedEtpe={handleDeviceChange}
        centreTittle="Project Type"
        centreOptions={projectTypeOptions}
        selectedCentre={selectedProjectType}
        setSelectedCentre={handleProjectType}
        dirTittle="Project Name"
        dirOptions={projectNameOptions}
        selecteddir={selectedProjectName}
        setSelecteddir={handleProjectName}
        onDeleteClick={handleDelete}
        isDeletedFilter={true}
      />
    </div>
  );
};

export default ReportList;
