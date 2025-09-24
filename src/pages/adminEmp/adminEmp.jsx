import React, { useState, useEffect } from 'react';
import { syncEmpData, empList, updateEmpStatus,centreList,srpiEmpTypeList,directoratesList,updateStateCordinator } from '../../api/syncEmp/syncEmp'
import { ToastContainer, toast } from 'react-toastify';
import {  InputGroup, FormControl, Button, Spinner } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import {postTaskManagerUpdate} from '../../api/TaskMember/taskMemberApi';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import Heading from '../../components/Heading/heading';
import Switch from "@mui/material/Switch";
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
    useEffect(() => {
      fetchEmpList();
    }, [page, pageSize, searchQuery, selectedCentre,selectedStatus,selectedType,selecteddir]);


    const columnNames = {
      empid: 'Employee ID',
      ename: 'Employee Name',
      centre: 'Centre',
      dir: 'Directorates',
      etpe: 'Employee Type',
      StatusNoida: 'VAPT Team Member',
      taskForceMember: 'Task Force Member',
      StateCordinator: 'State Coordinator'
    };


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
        sortable: false,
        renderCell: (params) => (
        <Switch
          checked={params.row.rawStatusNoida}
          onChange={() =>
            params.row.rawStatusNoida
              ? handleDeactivate(params.row)
              : handleActivate(params.row)
          }
          color={params.row.rawStatusNoida ? "success" : "error"}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "green",
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "green",
            },
            "& .MuiSwitch-switchBase:not(.Mui-checked)": {
              color: "red",
            },
            "& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track": {
              backgroundColor: "red",
            },
          }}
        />
      )
      },
      {
        field: 'taskForceMember',
        headerName: columnNames.taskForceMember,
        width: 120,
        sortable: false,
        renderCell: (params) => (
        <Switch
          checked={params.row.rawtaskForceMember !== "No"} // ✅ checked if not "No"
          onChange={() => handleTeamMember(params.row)}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "green",
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "green",
            },
            "& .MuiSwitch-switchBase:not(.Mui-checked)": {
              color: "red",
            },
            "& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track": {
              backgroundColor: "red",
            },
          }}
        />
      ),
      },
       {
        field: 'StateCordinator',
        headerName: columnNames.StateCordinator,
        width: 140,
        sortable: false,
        renderCell: (params) => (
        <Switch
          checked={params.row.rawStateCordinator !== false}
          onChange={() => handleDeactivateStateCordinator(params.row)}
           sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "green",
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "green",
            },
            "& .MuiSwitch-switchBase:not(.Mui-checked)": {
              color: "red",
            },
            "& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track": {
              backgroundColor: "red",
            },
          }}
        />
      )
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
          const response = await empList({page: page + 1, limit: pageSize,search:searchQuery.trim(),centre:selectedCentre?.value,StatusNoida:selectedStatus?.value,etpe:selectedType?.value,dir:selecteddir?.value})
          console.log(response)
          const transformedData = response.data.map((item, index) => ({
            ...item,
            id: item._id, 
            serial: page * pageSize + index + 1,
            rawStatusNoida: item.StatusNoida,
            rawtaskForceMember: item.taskForceMember,
            rawStateCordinator: item.StateCordinator,
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

    useEffect(() => {
        fetchEmpList();
        fetchDiretoratesData();
        fetchCentreData();
        fetchTypeData();
    }, [page, searchQuery]); 

    const handleActivate = async (empid) => {
        try {
            const payload = {
                    id:empid._id,
                    StatusNoida:true
                }
          await updateStateCordinator(payload);
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

      const handleDeactivateStateCordinator = async (empid) => {
        try{
          const payload ={
            id:empid._id,
          }
          await updateStateCordinator(payload)
          Swal.fire({
                icon: 'success',
                title: 'State Coordinator has been Updated',
                showConfirmButton: false,
                timer: 2000,
              });
          fetchEmpList();
        }catch(error){
          Swal.fire({
              icon: 'error',
              title: 'Failed to update State Coordinator',
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
            <div className='row pb-3'>
              <div className='col-sm-6 col-lg-6 col-md-6'>
                   <Heading title="Employee List" />
                </div>
              <div className='col-sm-3 col-md-3 col-lg-3'></div>
              
               <div className="col-sm-3 col-md-3 col-lg-3 d-flex justify-content-end">
                <Button variant="primary" className="btn btn-Primary" onClick={handleSync} style={{ width: "60%", height: "45px" }} disabled={loader}>
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
            <hr></hr>
            <div className='container-fluid'>
              <div className='row mb-3 align-items-end'>
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
                 <div className='col-sm-4 col-md-4 col-lg-4'>
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