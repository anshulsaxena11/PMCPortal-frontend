import React, { useState, useEffect } from 'react';
import { syncEmpData, empList, updateEmpStatus,centreList,srpiEmpTypeList,directoratesList } from '../../api/syncEmp/syncEmp'
import { ToastContainer, toast } from 'react-toastify';
import { FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { Table, Pagination, InputGroup, FormControl, Button, Spinner } from 'react-bootstrap';
import { CircularProgress, TextField, Typography, IconButton, Stack } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import {postTaskManagerUpdate} from '../../api/TaskMember/taskMemberApi';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import Select from 'react-select';
import Swal from 'sweetalert2';
                                                                                
const AdminSyncEmploy = () =>{
    const [loader,setLoader] = useState(false)
    const [data,setData] = useState([]);
    const [centreOptions, setCentreOptions] = useState([]);
    const [dirOptions, setDirOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCentre, setSelectedCentre] = useState(null);
    const [selecteddir, setSelectedDir] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
     const [page, setPage] = useState(0); 
      const [pageSize, setPageSize] = useState(10);
      const [totalCount, setTotalCount] = useState(0);
      const [searchQuery, setSearchQuery] = useState('');
      const [loading, setLoading] = useState(false);
    const statusOptions = [
      { value: true, label: "Active" },
      { value: false, label: "Not Active" },
    ];
    const [rowsPerPage, setRowsPerPage] = useState(10); // default page size
    useEffect(() => {
      fetchEmpList();
  }, [page, pageSize, searchQuery, selectedCentre,selectedStatus,selectedType,selecteddir]);


     // ✅ Move this block to the top (before `columns`)
const columnNames = {
  empid: 'Employee ID',
  ename: 'Employee Name',
  centre: 'Centre',
  dir: 'Directorates',
  etpe: 'Employee Type',
  StatusNoida: 'VAPT Team Member',
  taskForceMember: 'Task Force Member Status',
};

// ✅ Now define columns
const columns = [
  {
    field: 'serial',
    headerName: 'S.No',
    width: 60,
    sortable: false,
  },
  { field: 'empid', headerName: columnNames.empid, width: 100 },
  { field: 'ename', headerName: columnNames.ename, width: 140 },
  { field: 'centre', headerName: columnNames.centre, width: 100 },
  { field: 'dir', headerName: columnNames.dir, width: 140 },
  { field: 'etpe', headerName: columnNames.etpe, width: 140 },
  {
    field: 'StatusNoida',
    headerName: columnNames.StatusNoida,
    width: 140,
    renderCell: (params) => (
      <span className={`fw-bold ${params.row.rawStatusNoida ? 'text-success' : 'text-danger'}`}>
        {params.row.rawStatusNoida ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    field: 'statusAction',
    headerName: 'Action',
    width: 90,
    sortable: false,
    renderCell: (params) =>
      params.row.rawStatusNoida === false ? (
        <FaCheck
          className="text-success fs-4"
          style={{ cursor: 'pointer' }}
          onClick={() => handleActivate(params.row)}
        />
      ) : (
        <IoClose
          className="text-danger fs-4"
          style={{ cursor: 'pointer' }}
          onClick={() => handleDeactivate(params.row)}
        />
      ),
  },
  {
    field: 'taskForceMember',
    headerName: columnNames.taskForceMember,
    width: 150,
    renderCell: (params) => (
      <span className={`fw-bold ${params.row.rawtaskForceMember === 'Yes' ? 'text-success' : 'text-danger'}`}>
        {params.row.rawtaskForceMember === 'Yes' ? 'Yes' : 'No'}
      </span>
    ),
  },
  {
    field: 'memberAction',
    headerName: 'Member Status',
    width: 120,
    sortable: false,
    renderCell: (params) =>
      params.row.rawtaskForceMember === 'No' ? (
        <FaCheck
          className="text-success fs-4"
          style={{ cursor: 'pointer' }}
          onClick={() => handleTeamMember(params.row)}
        />
      ) : (
        <IoClose
          className="text-danger fs-4"
          style={{ cursor: 'pointer' }}
          onClick={() => handleTeamMember(params.row)}
        />
      ),
  },
];


    const handleSync = async() =>{
        setLoader(true);
        try{
            const response = await syncEmpData()
            
            if (response.data.statusCode === 200){
                Swal.fire({
                  icon: 'success',
                  title: 'Successfully Updated',
                  showConfirmButton: false,
                  timer: 2000,
                });
              fetchEmpList();
              fetchCentreData();
              fetchDiretoratesData(); 
              fetchTypeData();
            } else if(response.statusCode === 400 && response.message.includes('Unexpected API response')){
                Swal.fire({
                  icon: 'error',
                  title: 'Unable to fetch Data',
                  showConfirmButton: true,
                });
            }       
        } catch(error){
            toast.error('Unable to fetch Data.', {
                className: 'custom-toast custom-toast-error',
            });
        }
        setLoader(false);
    }
    const fetchEmpList = async() =>{
        setLoader(true);
        try{
          const response = await empList({page: page + 1, // ✅ Convert 0-based to 1-based
  limit: pageSize,search:searchQuery.trim(),centre:selectedCentre?.value,StatusNoida:selectedStatus?.value,etpe:selectedType?.value,dir:selecteddir?.value})
          const transformedData = response.data.map((item, index) => ({
            ...item,
            id: item._id, // Required by DataGrid
           serial: page * pageSize + index + 1,
            rawStatusNoida: item.StatusNoida,
            rawtaskForceMember: item.taskForceMember,
            StatusNoida: item.StatusNoida ? (
              <span className="text-success fw-bold">Active</span>
            ) : (
              <span className="text-danger fw-bold">Inactive</span>
            ),
            taskForceMember: item.taskForceMember === 'Yes' ? (
              <span className="text-success fw-bold">Yes</span>
            ) : (
              <span className="text-danger fw-bold">No</span>
            )
          }));


          setData(transformedData)
          setTotalCount(response.total);
          setTotalPages(response.totalPages);
      }catch(error){
        console.error('Failed to fetch employee list:');
      }
      setLoader(false);
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1); 
    };

    const handleCentreChange = (selectedOption) => {
      setSelectedCentre(selectedOption);
      setPage(1);
    };

    const handleDirChange = (selectedOption) => {
      setSelectedDir(selectedOption);
      setPage(1);
    };

    const handleTypeChange = (e) =>{
      setSelectedType(e)
      setPage(1);
    }

    const handleStausChange = (selectedOption) => {
      setSelectedStatus(selectedOption);
      setPage(1);
    };

    useEffect(() => {
        fetchEmpList();
        fetchDiretoratesData();
        fetchCentreData();
        fetchTypeData();
    }, [page, searchQuery]); 

    const handlePageChange = (newPage) => {
    setPage(newPage);
    };

    const handleActivate = async (empid) => {
        try {
            const payload = {
                    id:empid._id,
                    StatusNoida:true
                }
          await updateEmpStatus(payload);
          Swal.fire({
            icon: 'success',
            title: 'VAPT Team Member Updated',
            showConfirmButton: false,
            timer: 2000,
          });
          fetchEmpList();
        } catch (err) {
           Swal.fire({
              icon: 'error',
              title: 'Failed to update VAPT Team Member',
              showConfirmButton: true,
            });
        }
      };
    
      const handleDeactivate = async (empid) => {
        try {
            const payload = {
                    id:empid._id,
                    StatusNoida:false
                }
          await updateEmpStatus(payload);
          Swal.fire({
            icon: 'success',
            title: 'VAPT Team Member Updated',
            showConfirmButton: false,
            timer: 2000,
          });
          fetchEmpList();
        } catch (err) {
         Swal.fire({
            icon: 'error',
            title: 'Failed to update VAPT Team Member',
            showConfirmButton: true,
          });
          
        }
      };

        const fetchCentreData = async () => {
            setLoader(true);
            try {
                const response = await centreList();
                const options = response.data.data.map((centre) => ({
                    value: centre,
                    label: centre,
                }));
                setCentreOptions(options);
            } catch (error) {
                console.error('Error fetching centre list:');
            } finally {
                setLoader(false);
            }
        };
 
      const fetchDiretoratesData = async () => {
          setLoader(true);
          try {
              const response = await directoratesList();
              const options = response.data.data.map((dir) => ({
                  value: dir,
                  label: dir,
              }));
              setDirOptions(options);
          } catch (error) {
              console.error('Error fetching Directorates list:');
          } finally {
              setLoader(false);
          }
      };

      const fetchTypeData = async () => {
          setLoader(true);
          try {
              const response = await srpiEmpTypeList();
              const options = response.data.data.map((centre) => ({
                  value: centre,
                  label: centre,
              }));
              setTypeOptions(options);
          } catch (error) {
              console.error('Error fetching centre list:');
          } finally {
              setLoader(false);
          }
      };



  const handleTeamMember = async (empid) =>{
    try{
      const payload ={
        id:empid._id,
      }
      await postTaskManagerUpdate(payload)
      Swal.fire({
            icon: 'success',
            title: 'Task Force Member has been Updated',
            showConfirmButton: false,
            timer: 2000,
          });
      fetchEmpList();
    }catch(error){
      Swal.fire({
          icon: 'error',
          title: 'Failed to update Task Force Member',
          showConfirmButton: true,
        }); 
    }
  }
   
    return(        
        <div className='admin-portal'>
            <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <div className='container-fluid'>
              <div className='row mb-3 align-items-end'>
                <div className='col-sm-2 col-lg-2 col-md-2'>
                   <h3 className="mb-0">Employees</h3>
                </div>
                <div className='col-sm-2 col-md-2 col-lg-2'>
                  <Select
                    options={dirOptions}
                    value={selecteddir}
                    onChange={handleDirChange}
                    placeholder="Directorates"
                    isClearable
                  />
                </div>
                <div className='col-sm-2 col-md-2 col-lg-2'>
                  <Select
                    options={centreOptions}
                    value={selectedCentre}
                    onChange={handleCentreChange}
                    placeholder="Centre"
                    isClearable
                  />
                </div>
                <div className='col-sm-2 col-md-2 col-lg-2'>
                    <Select
                      options={typeOptions}
                      value={selectedType}
                      onChange={handleTypeChange}
                      placeholder="Type"
                      isClearable
                    />
                </div>
                <div className='col-sm-2 col-md-2 col-lg-2'>
                  <Select
                      options={statusOptions}
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                      placeholder="Status"
                      isClearable
                    />
                </div>
                 <div className='col-sm-2 col-md-2 col-lg-2'>
                   <InputGroup>
                    <FormControl
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </InputGroup>
                 </div>
              </div>
            </div>
            <hr></hr>
            <div className='row pb-3'>
              <div className='col-sm-10 col-md-10 col-lg-10'></div>
               <div className="col-sm-2 col-md-2 col-lg-2 d-flex justify-content-end">
                <Button variant="primary" className="btn btn-Primary" onClick={handleSync} disabled={loader}>
                  {loader ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        Fetch HRMS
                      </>
                    )}
                </Button>
               </div>
            </div>

            <CustomDataGrid
                  rows={data}
                  columns={columns}
                  rowCount={totalCount}
                  page={page}
                  onPageChange={(newPage) => setPage(newPage)}
                  pageSize={pageSize}        
                  paginationModel={{ page, pageSize }}
                  paginationMode="server"
                  onPageSizeChange={(newSize) => setPageSize(newSize)}            
                  onPaginationModelChange={({ page: newPage, pageSize: newPageSize }) => {
                    setPage(newPage);
                    setPageSize(newPageSize);
                  }}                  
                rowsPerPageOptions={[10, 15, 25]}
                loading={loading}

            />
        </div>
        
    )
}

export default AdminSyncEmploy;