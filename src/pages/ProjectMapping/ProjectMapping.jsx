import React, { useState, useEffect, useMemo } from 'react';
import {
  srpiEmpTypeListActive,
  resourseMapping,
  srpiEmpTypeList,
  centreList,
  directoratesList,
} from '../../api/syncEmp/syncEmp';
import { getProjectNameList } from '../../api/ProjectDetailsAPI/projectDetailsApi';
import { ToastContainer, toast } from 'react-toastify';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import Heading from '../../components/Heading/heading';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';

const ProjectMapping = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const [viewData, setViewData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [typeOptions, setTypeOptions] = useState([]);
  const [centreOptions, setCentreOptions] = useState([]);
  const [dirOptions, setDirOptions] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [userRole, setUserRole] = useState(null); 
  const [selecteddir, setSelectedDir] = useState(null);
  const [ProjectName, setProjectName] = useState([]);
  const [isViewMode, setIsViewMode] = useState(false);

   const columnDefs = [
     {
        field: 'serialNo',
        headerName: 'S.No.',
        width: 70,
        sortable: false,
        filterable: false,
      },
      { field: 'empid', headerName: 'Employee ID', width: 140 },
      { field: 'ename', headerName: 'Employee Name', width: 190 },
      { field: 'edesg', headerName: 'Designation', width: 160 },
      { field: 'centre', headerName: 'Centre', width: 140 },
      { field: 'dir', headerName: 'Directorates', width: 160 },
      { field: 'etpe', headerName: 'Employee Type', width: 160 },
    ];
    if(userRole !== 'User'){
      columnDefs.push({
        field: 'action',
        headerName: 'Action',
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <input
            type="checkbox"
            checked={selectedItems.includes(params.row._id)}
            onChange={() => handleCheckboxToggle(params.row)}
          />
          )
      });
    }

  useEffect(() => {
        const role = localStorage.getItem("userRole");
        setUserRole(role);;
    }, []);

  const fetchEmpList = async () => {
    if (!selectedProject) return;
    setLoader(true);
    try {
      const response = await srpiEmpTypeListActive({
        page: page + 1,
        limit: pageSize,
        search: searchQuery.trim(),
        centre: selectedCentre?.value,
        etpe: selectedType?.value,
        projectId: selectedProject.value,
        dir: selecteddir?.value,
      });

      if (response && response.data) {
        setData(response.data);
        setViewData(response.response);

        const preSelected = response.data
          .filter(emp => emp.isChecked)
          .map(emp => emp._id);
        const viewSelected = response.response
          .filter(emp => emp.isChecked)
          .map(emp => emp._id);

        const combined = [...new Set([...preSelected, ...viewSelected, ...selectedItems])];
        setSelectedItems(combined);
        setTotalCount(response.total);
      }
    } catch (error) {
      console.error('Failed to fetch employee list:', error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (selectedProject) fetchEmpList();
    else {
      setData([]);
      setViewData([]);
    }
  }, [page, pageSize, searchQuery, selectedCentre, selectedType, selectedProject, selecteddir]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getProjectNameList();
        if (response?.statusCode === 200 && Array.isArray(response.data)) {
          setProjectName(response.data.map(item => ({
            value: item._id,
            label: item.projectName,
          })));
        }
      } catch (e) {
        console.error('Error fetching project list', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await srpiEmpTypeList();
      setTypeOptions(res.data.data.map(val => ({ label: val, value: val })));
    })();
    (async () => {
      const res = await centreList();
      setCentreOptions(res.data.data.map(val => ({ label: val, value: val })));
    })();
    (async () => {
      const res = await directoratesList();
      setDirOptions(res.data.data.map(val => ({ label: val, value: val })));
    })();
  }, []);

  const handleCheckboxToggle = (params) => {
    const id = params.id;
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMappingSubmit = async () => {
    if (!selectedProject || selectedItems.length === 0) {
      alert("Please select a project and at least one employee.");
      return;
    }

    setLoader(true);
    try {
      await resourseMapping({
        projectId: selectedProject.value,
        employeeIds: selectedItems,
      });
      toast.success("Employee has been Mapped");
      setSelectedItems([]);
      await fetchEmpList();
    } catch (error) {
      console.error("Mapping failed:", error);
      toast.error("Failed to map employee.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-center" autoClose={5000} />
       <Heading title="Project Mapping" />
       <hr></hr>

      {/* Filter Section */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <label>Project</label>
          <Select options={ProjectName} value={selectedProject} onChange={setSelectedProject} isClearable />
        </div>
        <div className="col-md-2">
          <label>Centre</label>
          <Select options={centreOptions} value={selectedCentre} onChange={setSelectedCentre} isClearable/>
        </div>
        <div className="col-md-2">
          <label>Directorates</label>
          <Select options={dirOptions} value={selecteddir} onChange={setSelectedDir} isClearable />
        </div>
        <div className="col-md-2">
          <label>Type</label>
          <Select options={typeOptions} value={selectedType} onChange={setSelectedType} isClearable />
        </div>
        <div className="col-md-3">
          <label>Search</label>
          <input
            type="text"
            className="form-control"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* DataGrid */}
      <CustomDataGrid
  rows={
    (userRole === 'User' ? viewData : (isViewMode ? viewData : data)).map(
    (row, index) => ({
      id: row._id || index,
      serialNo: page * pageSize + index + 1,
      ...row,
    })
  )
}
  columns={columnDefs}
  paginationMode="server"
  paginationModel={{ page, pageSize }}
  onPaginationModelChange={(model) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  }}
  rowCount={totalCount}
  rowSelectionModel={selectedItems}
  onRowSelectionModelChange={(ids) => setSelectedItems(ids)}
  loading={loader}
  autoHeight
  components={{
    NoRowsOverlay: () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        No employee records found.
      </div>
    ),
  }}
/>



      {/* Buttons */}
        {(userRole !== 'User') && (
          <div className="mt-3 d-flex gap-3">
          <button
            className="btn btn-primary"
            disabled={!selectedProject || selectedItems.length === 0}
            onClick={handleMappingSubmit}
          >
            Save
          </button>
        
          <button
            className="btn btn-warning"
            onClick={() => setIsViewMode(!isViewMode)}
            >
            {isViewMode ? 'List' : 'View'}
          </button>
        </div>
          )}

    </div>
  );
};

export default ProjectMapping;
