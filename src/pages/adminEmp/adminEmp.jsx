import React, { useState, useEffect } from 'react';
import { syncEmpData, empList, updateEmpStatus,centreList,srpiEmpTypeList,directoratesList } from '../../api/syncEmp/syncEmp'
import { ToastContainer, toast } from 'react-toastify';
import { FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { Table, Pagination, InputGroup, FormControl, Button, Spinner } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import {postTaskManagerUpdate} from '../../api/TaskMember/taskMemberApi'
import Select from 'react-select';
import Swal from 'sweetalert2';

                                                                                
const AdminSyncEmploy = () =>{
    const [loader,setLoader] = useState(false)
    const [data,setData] = useState([]);
    const [page, setPage] = useState(1);
    const [centreOptions, setCentreOptions] = useState([]);
    const [dirOptions, setDirOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0); 
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCentre, setSelectedCentre] = useState(null);
    const [selecteddir, setSelectedDir] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const statusOptions = [
      { value: true, label: "Active" },
      { value: false, label: "Not Active" },
    ];
    useEffect(() => {
      fetchEmpList();
  }, [page, searchQuery, selectedCentre,selectedStatus,selectedType,selecteddir]);


    const columns = [
        'empid',
        'ename',
        'centre',
        "dir",
        'etpe',
        'StatusNoida',
        'taskForceMember' 
      ];

      const columnNames = {
        empid: 'Employee ID',
        ename: 'Employe Name',
        centre: 'Centre',
        dir:'Directorates',
        etpe:'Employee Type',
        StatusNoida: 'VAPT Team Member',
        taskForceMember:' Task Force Member Status'  
      };

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
          const response = await empList({page:1,limit:10,search:searchQuery.trim(),centre:selectedCentre?.value,StatusNoida:selectedStatus?.value,etpe:selectedType?.value,dir:selecteddir?.value})
          const transformedData = response.data.map(item => ({
              ...item,
              rawStatusNoida: item.StatusNoida,
              rawtaskForceMember: item.taskForceMember, 
              StatusNoida: item.StatusNoida ? (
                <span className="text-success fw-bold">Active</span>
              ) : (
                <span className="text-danger fw-bold">Inactive</span>
              ),
              taskForceMember:item.taskForceMember ==='Yes' ? (
                <span className="text-success fw-bold">Yes</span>
              ):(
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
            <div style={{  overflowX: 'auto' }}>
             <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th className="text-center">S.No</th>
                    <th className="text-center">{columnNames.empid}</th>
                    <th className="text-center">{columnNames.ename}</th>
                    <th className="text-center">{columnNames.centre}</th>
                    <th className="text-center">{columnNames.dir}</th>
                    <th className="text-center">{columnNames.etpe}</th>
                    <th className="text-center">{columnNames.StatusNoida}</th>
                    <th className="text-center">Action</th>
                    <th className="text-center">{columnNames.taskForceMember}</th>
                    <th className="text-center">Member Status</th>
                  </tr>
                </thead>
              <tbody>
                {loader ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="text-center text-muted">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={index}>
                     <td className="text-center">{(page - 1) * 10 + index + 1}</td>
                      {columns.map((col) => (
                        <React.Fragment key={col}>
                          <td className="text-center">
                            {(() => {
                              switch (col) {
                                case 'empid':
                                  return item.empid || '-';
                                case 'ename':
                                  return item.ename?.toUpperCase() || '-';
                                case 'centre':
                                  return item.centre || 'N/A';
                                case 'dir':
                                  return item.dir;
                                case 'etpe':
                                  return item.etpe || '-';
                                case 'StatusNoida':
                                  return item.StatusNoida;
                                case 'taskForceMember':
                                  return item.taskForceMember;
                                default:
                                  return item[col] || '-';
                              }
                            })()}
                          </td>
                          {col === 'StatusNoida' && (
                            <td className="text-center">
                              {item.rawStatusNoida  === false ? (
                                <span className="fs-4 text-success fw-bold">
                                  <FaCheck
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    onClick={() => handleActivate(item)} 
                                  />
                                </span>
                              ) : (
                                <span className="fs-4 text-danger fw-bold">
                                  <IoClose
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    onClick={() => handleDeactivate(item)} 
                                  />
                                </span>
                              )}
                            </td>
                          )}
                          {col === 'taskForceMember' && (
                            <td className="text-center">
                              {item.rawtaskForceMember === "No" ? (
                                <span className="fs-4 text-success fw-bold">
                                  <FaCheck
                                    style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    onClick={() => handleTeamMember(item)} 
                                  />
                                </span>
                              ) : (
                                <span className="fs-4 text-danger fw-bold">
                                  <IoClose
                                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    onClick={() => handleTeamMember(item)} 
                                  />
                                </span>
                              )}
                            </td>
                          )}
                        </React.Fragment>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
             </Table>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <Pagination className="pagination-sm">
                <Pagination.Prev
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                />
            {(() => {
              const items = [];
              const maxPages = 10;
              let start = Math.max(1, Math.min(page - Math.floor(maxPages / 2), totalPages - maxPages + 1));
              let end = Math.min(totalPages, start + maxPages - 1);
      
              for (let i = start; i <= end; i++) {
                items.push(
                  <Pagination.Item
                    key={i}
                    active={i === page}
                    onClick={() => handlePageChange(i)}
                  >
                    {i}
                  </Pagination.Item>
                );
              }
      
              if (end < totalPages) {
                items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
                items.push(
                  <Pagination.Item
                    key={totalPages}
                    active={page === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </Pagination.Item>
                );
              }
      
              return items;
              })()}
                <Pagination.Next
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                />
              </Pagination>
            </div>
        </div>
        
    )
}

export default AdminSyncEmploy;