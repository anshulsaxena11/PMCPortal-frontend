import React, { useState, useEffect } from 'react';
import ListView from '.././../components/listView/listView'
import {srpiEmpTypeListActive,resourseMapping,srpiEmpTypeList,centreList,directoratesList} from "../../api/syncEmp/syncEmp"
import { getProjectNameList } from '../../api/ProjectDetailsAPI/projectDetailsApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

                                                                                
const ProjectMapping = () =>{
    const [searchQuery, setSearchQuery] = useState('');
    const [loader,setLoader] = useState(false)
    const [error, setError] = useState(null);
    const [data,setData] = useState([]);
    const [viewData,setViewData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [typeOptions, setTypeOptions] = useState([]);
    const [totalCount, setTotalCount] = useState(0); 
    const [selectedCentre, setSelectedCentre] = useState(null);
    const [ProjectName, setProjectName] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [centreOptions, setCentreOptions] = useState([]);
    const [dirOptions, setDirOptions] = useState([]);
    const [selecteddir, setSelectedDir] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    
    useEffect(() => {
        if (selectedProject) {
            fetchEmpList();
        } else {
          setData([]); 
          setViewData([]);
        }
      }, [page, searchQuery, selectedCentre,selectedType,selectedProject,selecteddir]);

    const columns = [
        'empid',
        'ename',
        'edesg',
        'centre',
        'dir',
        'etpe',
      ];
    
      const columnNames = {
        empid: 'Employee ID',
        ename: 'Employe Name',
        edesg:'Designation',
        centre: 'Centre',
        dir:'Directorates',
        etpe:'Employee Type',

      };
     const fetchEmpList = async() =>{
      if (!selectedProject) return; 
          setLoader(true);
          try{
              const response = await srpiEmpTypeListActive({page,limit:10,search:searchQuery.trim(),centre:selectedCentre?.value,etpe:selectedType?.value,projectId: selectedProject.value,dir:selecteddir?.value})
              if (response && response.data) {
                setData(response.data);
                setViewData(response.response)

                const previouslySelectedIds = [...selectedItems];
                
                const preViewSelected = response.response
                .filter(emp => emp.isChecked)
                .map(emp => emp._id);
                const preSelected = response.data
                  .filter(emp => emp.isChecked)
                  .map(emp => emp._id);
                  
                const combinedSelectedItems = [...new Set([...preViewSelected, ...preSelected, ...previouslySelectedIds])];
                setSelectedItems(combinedSelectedItems);
                setTotalCount(response.total);
                setTotalPages(response.totalPages);
              }
          }catch(error){
              console.error('Failed to fetch employee list:');
          }
          setLoader(false);
        }
        const handleSearchChange = (e) => {
            setSearchQuery(e.target.value);
            setPage(1); 
        };

        useEffect(() => {
          const fetchProjectNameList = async () => {
            setLoader(true);
            setError("");
      
            try {
              const data = await getProjectNameList();
      
              if (data && data.statusCode === 200 && Array.isArray(data.data)) {
                  const options = data.data.map((centre) => ({
                      value: centre._id,
                      label: centre.projectName,
                  }));
                setProjectName(options);
              } else {
                throw new Error("Unexpected data format or empty project list");
              }
            } catch (err) {
              setError(`Failed to fetch project types:`);
              console.error("Error fetching project types:");
            } finally {
              setLoader(false);
            }
          };
      
          fetchProjectNameList();
        }, []);
        
        const handleCheckboxToggle = (item) => {
          setSelectedItems((prevSelected) =>
              prevSelected.includes(item._id)
                  ? prevSelected.filter((id) => id !== item._id)
                  : [...prevSelected, item._id]
          );
      };
        

        const handleMappingSubmit = async () => {
          if (!selectedProject ) {
            alert("Please select a project and at least one employee.");
            return;
          }
        
          try {
            setLoader(true);
            const payload ={
              projectId: selectedProject.value,
              employeeIds: selectedItems,
            }
            const response = await resourseMapping(payload);
            
            toast.success('Employee has been Mapped',{
              className: 'custom-toast custom-toast-success'
            });
        
            setSelectedItems([]); 
            await fetchEmpList();
            
          } catch (error) {
            console.error("Mapping failed:");
            toast.error('Failed to Mapped employee.',{
              className: 'custom-toast custom-toast-error',
            })
          } finally {
            setLoader(false);
          }
        };

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

      const handleTypeChange = (e) =>{
        setSelectedType(e)
        setPage(1);
      }

      const handleCentreChange = (selectedOption) => {
        setSelectedCentre(selectedOption);
        setPage(1);
      };

      const handleDirChange = (selectedOption) => {
        setSelectedDir(selectedOption);
        setPage(1);
      };

      const handleView = () => {
        setIsViewMode(true); 
      };

      const handleSet = () => {
        setIsViewMode(false); 
      };

      const handlePageChange = (newPage) => {
        setPage(newPage);
    };
    
    return(        
        <div className='projectMapping'>
           <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
            <ListView
                title="Project Mapping"
                columns={columns}
                columnNames={columnNames}
                data={isViewMode ? viewData : data}  
                page={page}
                totalPages={totalPages}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange} 
                loading={loader}
                ProjectFilter={true}
                onPageChange={handlePageChange}
                projectOptions={ProjectName}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                projectTittle="Select Project"
                showCheckbox={true}
                onCheckboxChange={handleCheckboxToggle}
                selectedItems={selectedItems} 
                buttonClass={'btn btn-primary'}
                onAddNewClick={handleMappingSubmit}
                disabled={!selectedProject || selectedItems.length === 0}
                buttonName="Save"
                showIcon={false}
                showMapIcon={true}
                hideHeader={!selectedProject}
                showFilters={true}
                etpeTypeName="Type"
                etpeOptions={typeOptions}
                selectedEtpe={selectedType}
                setSelectedEtpe={handleTypeChange}
                centreOptions={centreOptions}
                selectedCentre={selectedCentre}
                setSelectedCentre={handleCentreChange}
                centreTittle="Centre"
                dirTittle="Directorates"
                dirOptions={dirOptions}
                selecteddir={selecteddir}
                setSelecteddir={handleDirChange}
                showButtonFilter={true}
                buttonClasstwo={'btn btn-warning'}
                buttonNameTwo={isViewMode ? "List" : "View"}
                onButtonViewClick={isViewMode ? handleSet : handleView}
                isViewMode={isViewMode}
            />
        </div>
        
    )
}

export default ProjectMapping;