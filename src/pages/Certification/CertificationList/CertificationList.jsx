import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import Heading from '../../../components/Heading/heading';
import { getCertificateByUserId } from "../../../api/certificateApi/certificate";
import {
  Box,
  Button,
  Stack,
  TextField,
  IconButton,
} from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import {getCertificateDetailsList,deleteCertificateById} from '../../../api/certificateApi/certificate';

const CertificateList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0); // MUI starts pages from 0
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentUserId = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");
    setUserId(currentUserId);
    setUserRole(role);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (userRole === 'Admin' ) {
      const response = await getCertificateDetailsList({
        page: page + 1,
        limit: pageSize,
        search: searchQuery.trim()
      });
      const transformedData = response.data.map((item, index) => {
       
        return {
          id: item._id,
          serial: page * pageSize + index + 1,
            ...item,
            issuedDate: item?.issuedDate?.split('T')[0] || 'N/A',
            validUpto: item?.validUpto?.split('T')[0] || 'N/A',
        };
      });

      setData(transformedData);
      setTotalCount(response.total);
    } else {
        const response = await getCertificateByUserId(userId, {
          page: page + 1,
          limit: pageSize,
          search: searchQuery.trim()
        });
        
        const transformedData = response.data.map((item, index) => {
          return {
            id: item._id,
            serial: page * pageSize + index + 1,
            ...item,
            issuedDate: item?.issuedDate?.split('T')[0] || 'N/A',
            validUpto: item?.validUpto?.split('T')[0] || 'N/A',
            assignedPerson: item?.assignedPerson?.ename || 'N/A',
            certificateName: item?.certificateName?.certificateName || 'N/A',
            certificateType: item?.certificateType?.certificateType || 'N/A',
          };
        });

        setData(transformedData);
        setTotalCount(response?.pagination?.total);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchQuery,userRole,userId]);

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
      const response = await deleteCertificateById(id);
      console.log(response)
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
      width: 70,
      sortable: false,
      filterable: false
    },
    { field: 'certificateType', headerName: 'Certificate Type', flex: 1.5, minWidth: 200 },
    { field: 'certificateName', headerName: 'Certificate Name', flex: 1.5, minWidth: 200 },
    { field: 'assignedPerson', headerName: 'Assigned Person', flex: 1, minWidth: 100 },
    { field: 'issuedDate', headerName: 'Issued Date', flex: 1, minWidth: 110 },    
    { field: 'validUpto', headerName: 'Valid Upto', flex: 1.5, minWidth: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={() => navigate(`/certificate-view/${params.row.id}`)} size="small"
          >
            <Visibility />
          </IconButton>
          {(userRole !== 'User') && (
            <>
              <IconButton
                onClick={() => navigate(`/certificate-Edit/${params.row.id}`)} size="small"
              >
                <Edit />
              </IconButton>
            </>
          )}
           {(userRole === 'Admin') && (
              <IconButton onClick={() => handleDelete(params.row.id)} size="small">
                <Delete color="error" />
              </IconButton>
           )}
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Heading title="Certificate List" />

        {(userRole !== 'User') && (
          <Button variant="contained" onClick={() => navigate('/certificate-form')}>
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

export default CertificateList;