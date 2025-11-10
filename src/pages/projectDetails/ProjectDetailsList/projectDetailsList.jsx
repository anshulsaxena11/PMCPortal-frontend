import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import Heading from '../../../components/Heading/heading';

import {
  Box,
  Button,
  Stack,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import {
  deleteProjectsById,
  getProjectDetailsList
} from '../../../api/ProjectDetailsAPI/projectDetailsApi';

const ProjectDetailsList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0); // MUI starts pages from 0
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProjectDetailsList({
        page: page + 1,
        limit: pageSize,
        search: searchQuery.trim()
      });

      const transformedData = response.data.map((item, index) => {
        const amountStatus = Array.isArray(item.phases) && item.phases.length > 0
          ? item.phases[0].amountStatus || 'N/A'
          : 'N/A';

        return {
          id: item._id,
          serial: page * pageSize + index + 1,
          ...item,
          amountStatus,
          projectType:
            Array.isArray(item.projectType) && item.projectType.length > 0
              ? item.projectType[0]?.ProjectTypeName || 'N/A'
              : item.projectType || 'N/A',
        };
      });

      setData(transformedData);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await deleteProjectsById(id);
        if (response.data.statuscode === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Warning!',
          text: response.data.message,
          timer: 2500,
          showConfirmButton: false
        });
        fetchData();
      }
        if (response.data.statuscode === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false
        });
        fetchData();
      }
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error?.message || 'Something went wrong!'
      });
    }
  };

  const columns = [
    {
      field: 'serial',
      headerName: 'S. No.',
      width: 70,
      sortable: false,
      filterable: false
    },
    { field: 'orginisationName', headerName: 'Organisation Name', flex: 1.5, minWidth: 200 },
    { field: 'type', headerName: 'Org Type', flex: 1, minWidth: 100 },
    { field: 'orderType', headerName: 'Order Type', flex: 1, minWidth: 110 },    
    { field: 'projectName', headerName: 'Project Name', flex: 1.5, minWidth: 180 },
    { field: 'typeOfWork', headerName: 'Type Of Work', flex: 1, minWidth: 120 },
    { field: 'directrate', headerName: 'Directorates', flex: 1.5, minWidth: 180 },
    { field: 'amountStatus', headerName: 'Status', flex: 1, minWidth: 110 },
    {
      field: 'projectValue',
      headerName: 'Project Value (Lakh INR)',
      flex: 1,
      align: 'right',
      minWidth: 120,
      renderCell: (params) => {
        const val = params?.row?.projectValue;
        if (!val || isNaN(val)) return 'N/A';
        const croreValue = Number(val) / 100000;
        const formattedCr = croreValue.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const fullValue = 'Rs. ' + Number(val).toLocaleString('en-IN');
        return (
          <Tooltip title={fullValue} INR>
            <span>{formattedCr} Lakh</span>
          </Tooltip>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={() => navigate(`/projectDetails/${params.row.id}`)} size="small"
          >
            <Visibility />
          </IconButton>
          {(userRole !== 'User') && (
            <>
              <IconButton
                onClick={() => navigate(`/projectDetailsEdit/${params.row.id}`)} size="small"
              >
                <Edit />
              </IconButton>
              <IconButton onClick={() => handleDelete(params.row.id)} size="small">
                <Delete color="error" />
              </IconButton>
            </>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Heading title="Project List" />

        {(userRole !== 'User') && (
          <Button variant="contained" onClick={() => navigate('/projectDetails')}>
            Add New
          </Button>
        )}
      </Stack>
<hr></hr>
      <TextField
        fullWidth
        label="Search here..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        variant="outlined"
        margin="normal"
        size="small"
        sx={{
          backgroundColor: 'white',
        }}
      />
      
  <Box sx={{ width: '100%', overflowX: 'auto' }}>
  <CustomDataGrid
  key={pageSize}
  rows={data}
  columns={columns}
  loading={loading}
  paginationModel={{ page, pageSize }}
  onPaginationModelChange={({ page, pageSize }) => {
    setPage(page);
    setPageSize(pageSize);
  }}
  rowCount={totalCount}
  paginationMode="server"
  autoHeight
/>
      </Box>
    </Box>
  );
}

export default ProjectDetailsList;