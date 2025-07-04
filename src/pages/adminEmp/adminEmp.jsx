import React, { useState, useEffect } from 'react';
import { syncEmpData, empList, updateEmpStatus,centreList,srpiEmpTypeList,directoratesList } from '../../api/syncEmp/syncEmp'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {postTaskManagerUpdate} from '../../api/TaskMember/taskMemberApi'
import ListView from '../../components/listView/listView'
                                                                                
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
            
            if (response.statusCode === 200){
                toast.success("Suceesfully Updated",{
                    className: 'custom-toast custom-toast-success'
                });
                await fetchEmpList(); 
            } else if(response.statusCode === 400 && response.message.includes('Unexpected API response')){
                toast.error(response.message, {
                    className: "custom-toast custom-toast-error",
                });
            }       
        } catch(error){
            toast.error('Failed to get Api Data.', {
                className: 'custom-toast custom-toast-error',
            });
        }
        setLoader(false);
    }
    const fetchEmpList = async() =>{
        setLoader(true);
        try{
            const response = await empList({page,limit:10,search:searchQuery.trim(),centre:selectedCentre?.value,StatusNoida:selectedStatus?.value,etpe:selectedType?.value,dir:selecteddir?.value})
            console.log(response)
            const transformedData = response.data.map(item => ({
                ...item,
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
          toast.success('Employee status changed to Active',{
             className: 'custom-toast custom-toast-success'
          });
          fetchEmpList();
        } catch (err) {
          toast.error('Failed to activate employee.',{
            className: 'custom-toast custom-toast-error',
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
          toast.success('Employee status changed to Not Active',{
            className: 'custom-toast custom-toast-success'
          });
          fetchEmpList();
        } catch (err) {
          toast.error('Failed to deactivate employee.',{
            className: 'custom-toast custom-toast-error',
          });
          
        }
      };
      useEffect(() => {
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
        fetchCentreData();
    }, []);

    useEffect(() => {
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
      fetchDiretoratesData();
  }, []);

    useEffect(() => {
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
      fetchTypeData();
  }, []);

  const handleTeamMember = async (empid) =>{
    try{
      const payload ={
        id:empid._id,
      }
      await postTaskManagerUpdate(payload)
       toast.success('Task Force Member has been updated',{
          className: 'custom-toast custom-toast-success'
      });
      fetchEmpList();
    }catch(error){
       toast.error('Failed to Update Task Force Member.',{
        className: 'custom-toast custom-toast-error',
      }); 
    }
  }
   
    return(        
        <div className='admin-portal'>
            <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <ListView
                title="Employees"
                buttonName="Fetch HRMS"
                onAddNewClick={handleSync}
                buttonClass={"btn btn-primary"}
                columns={columns}
                showIcon={false}
                columnNames={columnNames}
                data={data}
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                loading={loader}
                showStatusIcon={true}
                onCheckClick={handleActivate}
                onCrossClick={handleDeactivate}
                showFilters={true}
                centreOptions={centreOptions}
                selectedCentre={selectedCentre}
                setSelectedCentre={handleCentreChange}
                centreTittle="Centre"
                statusOptions={statusOptions}
                selectedStatus={selectedStatus}
                setSelectedStatus={handleStausChange}
                etpeTypeName="Type"
                showFiltersStatus={true}
                StatusName="Status"
                etpeOptions={typeOptions}
                selectedEtpe={selectedType}
                setSelectedEtpe={handleTypeChange}
                showStatusIcon={true}
                dirTittle="Directorates"
                dirOptions={dirOptions}
                selecteddir={selecteddir}
                setSelecteddir={handleDirChange}
                onCheckClickSecond={handleTeamMember}
                statusMember={true}
              />
        </div>
        
    )
}

export default AdminSyncEmploy;