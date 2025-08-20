import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button as MuiButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import { InputGroup, FormControl } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import {
  srpiEmpTypeListActive,
  srpiEmpTypeList,
  centreList,
  directoratesList,
  skillsMapping,
} from '../../api/syncEmp/syncEmp';
import { getProjectTypeList } from '../../api/projectTypeListApi/projectTypeListApi';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import Heading from '../../components/Heading/heading';

const SkillMapping = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [selecteddir, setSelectedDir] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [centreOptions, setCentreOptions] = useState([]);
  const [dirOptions, setDirOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [skillIndex, setSkillIndex] = useState([]);
  const [emp, setEmp] = useState();
  const [pageSize, setPageSize] = useState(10);

  const selectNumericOption = [
    { value: 'N/A', label: 'N/A' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
  ];

  useEffect(() => {
    fetchEmpList();
  }, [page, pageSize, searchQuery, selectedCentre, selectedType, selecteddir]);

  const fetchEmpList = async () => {
    setLoader(true);
    try {
      const response = await srpiEmpTypeListActive({
        page,
        limit: pageSize,
        search: searchQuery.trim(),
        centre: selectedCentre?.value,
        etpe: selectedType?.value,
        dir: selecteddir?.value,
      });
      if (response && response.data) {
        setData(response.data);
        setTotalCount(response.total);
      }
    } catch (error) {
      console.error('Failed to fetch employee list:');
    }
    setLoader(false);
  };

  useEffect(() => {
    const fetchInitials = async () => {
      try {
        const typeRes = await srpiEmpTypeList();
        setTypeOptions(typeRes.data.data.map((d) => ({ value: d, label: d })));

        const centreRes = await centreList();
        setCentreOptions(centreRes.data.data.map((c) => ({ value: c, label: c })));

        const dirRes = await directoratesList();
        setDirOptions(dirRes.data.data.map((d) => ({ value: d, label: d })));

        const projectTypeRes = await getProjectTypeList();
        setProjectTypes(projectTypeRes.data);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    fetchInitials();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e);
    setPage(1);
  };

  const handleCentreChange = (e) => {
    setSelectedCentre(e);
    setPage(1);
  };

  const handleDirChange = (e) => {
    setSelectedDir(e);
    setPage(1);
  };

  const handleButtonSkill = async (empId, skills) => {
    const payload = { _id: empId, skills };
    try {
      const response = await skillsMapping(payload);
      if (response.data.statuscode === 200) {
        toast.success('Successfully Rated');
        setSkillIndex([]);
        fetchEmpList();
      } else {
        toast.error('Not Rated');
      }
    } catch (error) {
      toast.error('API Error');
    }
  };

  const handleTableInput = (selected, col, rowIndex, item) => {
  const updatedRows = [...rows];
  const currentRow = updatedRows[rowIndex] ? { ...updatedRows[rowIndex] } : { ...item };

  currentRow[col] = selected ? selected.value : 'N/A';
  updatedRows[rowIndex] = currentRow;
  setRows(updatedRows);

  // ✅ Safely create skillIndex from projectTypes
  if (!Array.isArray(projectTypes) || projectTypes.length === 0) return;

  const updatedSkillIndex = projectTypes.map((pt) => {
    const colId = pt?._id;
    if (!colId) return ['UNKNOWN', 'N/A'];

    let value;

    if (colId === col) {
      value = selected?.value || 'N/A';
    } else {
      value =
        currentRow[colId] ||
        item.skills?.find((skill) => skill.scopeOfWorkId === colId)?.Rating ||
        'N/A';
    }

    return [colId, value];
  }).filter(entry => entry && entry[0] !== 'UNKNOWN'); // filter invalid entries

  setSkillIndex(updatedSkillIndex);
  setEmp(item._id);
};

  const columns = useMemo(() => {
    const dynamicCols = projectTypes.map((pt) => ({
      field: pt._id,
      headerName: pt.ProjectTypeName,
      width: 120,
      renderCell: (params) => {
        const item = data.find((d) => d._id === params.row.id);
       const ratingValue =
  rows.find((r) => r?._id === params.row.id)?.[pt._id] ??
  item?.skills?.find((s) => s?._id && s.scopeOfWorkId === pt._id)?.Rating ??
  'N/A';



        return (
          <Select
            options={selectNumericOption}
            value={selectNumericOption.find((opt) => opt.value === ratingValue)}
            onChange={(selected) =>
              handleTableInput(selected, pt._id, data.indexOf(item), item)
            }
            isClearable
            menuPortalTarget={document.body}
            styles={{
              container: (provided) => ({ ...provided, width: 120,margin:5 }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        );
      },
    }));

    return [
      { field: 'serial', headerName: 'S.No', width: 50 },
      { field: 'ename', headerName: 'Employee Name', flex:1 },
      ...dynamicCols,
      {
        field: 'action',
        headerName: 'Action',
        width: 100,
      
        renderCell: (params) => (
          <MuiButton
            variant="contained"
            size="small"
            onClick={() => handleButtonSkill(emp, skillIndex)}
            disabled={loader}
          >
            Submit
          </MuiButton>
        ),
      },
    ];
  }, [projectTypes, data, rows, skillIndex]);

  return (
    <div className="skill-Mapping">
      <ToastContainer position="top-center" autoClose={5000} />
       <div className="col-sm-4">
        
          <Heading title="Skill Mapping" />
        </div>
        <hr></hr>
      <div className="row mb-3 align-items-end">
       
        <div className="col-sm-3">
          <Select
            options={dirOptions}
            value={selecteddir}
            onChange={handleDirChange}
            placeholder="Directorates"
            isClearable
          />
        </div>
        <div className="col-sm-2">
          <Select
            options={centreOptions}
            value={selectedCentre}
            onChange={handleCentreChange}
            placeholder="Centre"
            isClearable
          />
        </div>
        <div className="col-sm-2">
          <Select
            options={typeOptions}
            value={selectedType}
            onChange={handleTypeChange}
            placeholder="Type"
            isClearable
          />
        </div>
        <div className="col-sm-5">
          <InputGroup>
            <FormControl
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </div>
      </div>
      <Box sx={{ height: 600, width: '100%' }}>
        <CustomDataGrid
          rows={data.map((row, index) => ({
            id: row._id,
            serial: (page - 1) * pageSize + index + 1,
            ...row,
          }))}
          columns={columns}
          rowCount={totalCount}
          paginationModel={{ page: page - 1, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);       
            setPageSize(model.pageSize); 
          }}
          rowsPerPageOptions={[10, 15, 25]}
          paginationMode="server"
          loading={loader}
          getRowId={(row) => row.id}
        />

        
      </Box>
    </div>
  );
};

export default SkillMapping;
