import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoginList } from '../../../api/loginApi/loginApi';
import dayjs from 'dayjs';
import { Box, Button, TextField, IconButton } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import Heading from '../../../components/Heading/heading';
import { Visibility, Edit, Delete } from '@mui/icons-material';

const UserAdminList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const columnNames = {
    empId: 'Employee Id',
    ename: 'Employee Name',
    email: 'Employee E-mail',
    dir: 'Directorates',
    centre: 'Centre',
    etpe: 'Employee Type',
    role: 'Role',
    StatusNoida: 'VAPT Team Member',
    taskForceMember: 'Task Force Member Status'
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getLoginList({
        page: page + 1, // API expects 1-based
        limit: pageSize,
        search: searchQuery.trim(),
      });

      const fullData = response?.data;
      const originalData = fullData?.data || [];

     const formattedData = originalData.map((item, index) => ({
  ...item,
  id: item._id,
  sno: page * pageSize + index + 1,
  createdAt: item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY') : ''
}));


      setData(formattedData);
      setTotalCount(fullData?.total || 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery, pageSize]);

  const handleAddNewClick = () => {
    navigate("/register");
  };

  const handleViewClick = (row) => {
    navigate(`/register-view/${row}`);
  };

  const handleEditClick = (row) => {
    navigate(`/register-Edit/${row}`);
  };

  const gridColumns = [
  { field: 'sno', headerName: 'S.No', width: 80 },
  { field: 'empId', headerName: columnNames.empId, flex: 1 },
  { field: 'ename', headerName: columnNames.ename, flex: 1 },
  { field: 'email', headerName: columnNames.email, flex: 1 },
  { field: 'dir', headerName: columnNames.dir, flex: 1 },
  { field: 'centre', headerName: columnNames.centre, flex: 1 },
  { field: 'etpe', headerName: columnNames.etpe, flex: 1 },
  { field: 'role', headerName: columnNames.role, flex: 1 },
  {
    field: 'StatusNoida',
    headerName: columnNames.StatusNoida,
    flex: 1,
    renderCell: (params) =>
      params.value ? (
        <span className="text-success fw-bold">Active</span>
      ) : (
        <span className="text-danger fw-bold">Inactive</span>
      )
  },
  {
    field: 'taskForceMember',
    headerName: columnNames.taskForceMember,
    flex: 1,
    renderCell: (params) =>
      params.value === 'No' ? (
        <span className="text-danger fw-bold">No</span>
      ) : (
        <span className="text-success fw-bold">Yes</span>
      )
  },
  {
    field: 'actions',
    headerName: 'Actions',
    sortable: false,
    width: 150,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
       <IconButton 
            onClick={() => handleViewClick(params.id)} 
            size="small">
          <Visibility />
              </IconButton>
       <IconButton 
           onClick={() => handleEditClick(params.id)} 
           size="small">
       <Edit />
       </IconButton>
      </Box>
    )
  }
];


  return (
    <Box p={2}>
      <ToastContainer position="top-center" autoClose={5000} />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Heading title="User Registration"/>
        <Button variant="contained" onClick={handleAddNewClick}>Add New</Button>
        </Box>

          <hr></hr>                  
        <Box display="flex" gap={2} mb={2}>
          <TextField
              label="Search"
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
              }}
          />
        </Box>

       <div style={{ height: 600, width: '100%' }}>          
      <CustomDataGrid
        rows={data}
        columns={gridColumns}
         getRowId={(row) => row._id}
        rowCount={totalCount}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
        pageSize={pageSize}
        paginationMode="server"
        onPageSizeChange={(newSize) => setPageSize(newSize)}
        rowsPerPageOptions={[10, 15, 25]}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
    </div>
    </Box>
    )
};

export default UserAdminList;
