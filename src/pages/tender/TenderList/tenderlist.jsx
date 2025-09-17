import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, TextField, Typography, IconButton, Stack } from '@mui/material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import Heading from '../../../components/Heading/heading';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { RestoreFromTrash } from '@mui/icons-material';


import { getTenderDetailsList, deleteTenderById, updatetendermessage } from '../../../api/TenderTrackingAPI/tenderTrackingApi';

const TenderDetailsList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0); // DataGrid uses 0-based index
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false); 
  const navigate = useNavigate();

  
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);;
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getTenderDetailsList({
        page: page + 1,
        search: searchQuery.trim(),
        limit: pageSize,
        isDeleted: showDeleted,
      });
      const transformedData = (response?.data || []).map((item, index) => ({
        id: item?._id,
        sno: page * pageSize + index + 1,
        tenderName: item?.tenderName || 'N/A',
        organizationName: item?.organizationName || 'N/A',
        state: item?.state || 'N/A',
        taskForce: item?.taskForce || 'N/A',
        valueINR: item?.valueINR?.toLocaleString('en-IN') || '0',
        status: item?.status || 'N/A',
        lastDate: item?.lastDate?.split('T')[0] || 'N/A',
      }));

      setData(transformedData);
      setTotalCount(response?.total || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery,showDeleted]);

  const handleViewClick = (id) => {
    navigate(`/tender-View`, { state: { id } });
  };

  const handleEditClick = (id) => {
    navigate('/tender-Edit', { state: { id } });
  };

  const handleDeleteClick = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;

    try {
      const statusResult = await Swal.fire({
        title: 'Set Tender Status',
        text: `Tender is Success or Failure ?`,
        icon: 'question',
        showCancelButton: false,
        showDenyButton: true,
        confirmButtonText: 'Success',
        denyButtonText: 'Failure',
      });
      let tenderStatus = '';
      if (statusResult.isConfirmed) tenderStatus = 'success';
      else if (statusResult.isDenied) tenderStatus = 'failure';

      if (!tenderStatus) return;
      const messageResult = await Swal.fire({
        title: 'Submit your message',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off',
        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: async (message) => {
          if (!message || message.trim() === '') {
            Swal.showValidationMessage('Message is required');
            return false;
          }
          try {
            const response = await updatetendermessage(id, message, tenderStatus);
            if (response.status !== 200 && response.status !== 201) {
              Swal.showValidationMessage(`Error: ${response.statusText}`);
              return false;
            }
            return response.data;
          } catch (error) {
            Swal.showValidationMessage(
              `Request failed: ${error?.response?.data?.message || error.message}`
            );
            return false;
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (messageResult.isDismissed) return;

      await deleteTenderById(id);
      toast.success('Tender deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error?.message || 'Something went wrong!',
      });
    }
  };

  const columns = [
    { field: 'sno', headerName: 'S.No.', width: 80 },
    { field: 'tenderName', headerName: 'Tender Name', flex: 1 },
    { field: 'organizationName', headerName: 'Organization', flex: 1 },
    { field: 'state', headerName: 'State', flex: 1 },
    { field: 'taskForce', headerName: 'Task Force Member', flex: 1 },

    {
          field: 'valueINR',
          headerName: 'Value (Cr INR)',
          flex: 1,
          align: 'right',
          renderCell: (params) => {
            const val = params?.row?.valueINR;
            if (!val || isNaN(val)) return 'N/A';
            const croreValue = Number(val) / 10000000;
            const formattedCr = croreValue.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            const fullValue = 'Rs. ' + Number(val).toLocaleString('en-IN');
            return (
              <Tooltip title={fullValue} INR>
                <span>{formattedCr} Cr</span>
              </Tooltip>
            );
          }
        },
   // { field: 'valueINR', headerName: 'Value (INR)', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'lastDate', headerName: 'Last Date', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>

 <Stack direction="row" spacing={1}>
          <IconButton 
            onClick={() => handleViewClick(params.row.id)} 
            size="small"
           >
          <Visibility />
              </IconButton>
                {(!showDeleted && userRole !== 'User') && (
                <>
                  <IconButton 
                    onClick={() => handleEditClick(params.row.id)} 
                    size="small"
                    >
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteClick(params.row.id)}>
                <Delete />
              </IconButton>
            </>
           )}
          </Stack>
        </Box>
      ),
    },
  ];

  return (
    <Box p={2}>
      <ToastContainer position="top-center" autoClose={5000} />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Heading title="Sales Tracking" />
      </Box>
      <hr></hr>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Button
              variant="contained"
              color="error"
              startIcon={<RestoreFromTrash />}
              onClick={() => {
              setShowDeleted(!showDeleted);
              setPage(0);
            }}
            >
            {showDeleted ? "Back to Active" : "Recycle Bin"}
          </Button>
            {(userRole !== 'User') && (
              <Button variant="contained" onClick={() => navigate('/Tender-Tracking')}>
                Add New
              </Button>
            )}
        </Box>

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
                  columns={columns}
                  rowCount={totalCount}
                  page={page}
                  onPageChange={(newPage) => setPage(newPage)}
                  pageSize={pageSize}        
                  paginationModel={{ page, pageSize }}
                  paginationMode="server"
                  onPageSizeChange={(newSize) => setPageSize(newSize)}
                  onPaginationModelChange={({ page, pageSize }) => {
                    setPage(page);
                    setPageSize(pageSize);
                  }}
                rowsPerPageOptions={[10, 15, 25]}
                loading={loading}
                />
      </div>
    </Box>
  );
};

export default TenderDetailsList;
