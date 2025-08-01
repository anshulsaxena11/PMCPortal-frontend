import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { DataGrid } from '@mui/x-data-grid';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';

import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  IconButton
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
      setUserRole(role);;
    }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getProjectDetailsList({
        page: page + 1,
        limit: pageSize,
        search: searchQuery.trim()
      });

      const transformedData = response.data.map((item, index) => ({
        id: item._id,
        serial: page * pageSize + index + 1,
        ...item,
        projectType:
          Array.isArray(item.projectType) && item.projectType.length > 0
            ? item.projectType[0]?.ProjectTypeName || 'N/A'
            : item.projectType || 'N/A'
      }));

      setData(transformedData);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchQuery]);

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
      if (response.data.message) {
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
      width: 80,
      sortable: false,
      filterable: false
    },
    { field: 'workOrderNo', headerName: 'Work Order No', flex: 1 },
    { field: 'orderType', headerName: 'Order Type', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'orginisationName', headerName: 'Organisation Name', flex: 1.5},
    { field: 'projectName', headerName: 'Project Name', flex: 1.5 },
    { field: 'projectManager', headerName: 'Project Manager', flex: 1.2 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
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
    <Box sx={{ p: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Project Details</Typography>
        {(userRole !== 'User') && (
          <Button variant="contained" onClick={() => navigate('/projectDetails')}>
            Add New
          </Button>
        )}
      </Stack>

      <TextField
        fullWidth
        label="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        variant="outlined"
        margin="normal"
         size="small"
      />

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
      />



    </Box>
  );
};

export default ProjectDetailsList;
