import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { getToolsAndHardwareMappping } from '../../../api/toolsAndHardware/toolsAndHardware';
import { useNavigate } from 'react-router-dom';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import Heading from '../../../components/Heading/heading';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  Typography,
  Stack,
  IconButton
} from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';

const ToolsAndHardwareList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0); // MUI DataGrid starts from 0
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'Software', label: 'Software' },
    { value: 'Hardware', label: 'Hardware' },
  ];


      const fetchData = async () => {
  setLoading(true);
  try {
    const response = await getToolsAndHardwareMappping({
      page: page + 1,
  limit: pageSize, // <-- dynamic!
  search: searchQuery.trim(),
  toolsAndHardwareType: selectedStatus || "",
    });

    const rowsWithSno = response.data.map((item, index) => ({
      ...item,
      id: item._id, // MUI needs `id`
      sno: page * pageSize + index + 1,
    }));

    setData(rowsWithSno);
    setRowCount(response.total || 0); // total items from backend
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchQuery, selectedStatus]);

  const columns = [
    { field: 'sno', headerName: 'S.No', width: 90 },
    { field: 'tollsName', headerName: 'Tools Name', flex: 1 },
    { field: 'toolsAndHardwareType', headerName: 'Type', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>


             <IconButton
                        onClick={() => navigate(`/Tools-Hardware-Master-View/${params.row._id}`)} size="small"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        onClick={() => navigate(`/Tools-Hardware-Master-Edit/${params.row._id}`)} size="small"
                      >
                        <Edit />
                      </IconButton>
         
        </Stack>
      ),
    },
  ];

  return (
    <Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Heading title=" Tools And Hardware Master List" />        
          <Button variant="contained" onClick={() => navigate('/Tools-Hardware-Master')}>
            Add New
          </Button>
        </Stack>
        <hr></hr>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          sx={{ width: '70%' }}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
        />

        <TextField
          select
          label="Type"
          size="small"
          value={selectedStatus}
          sx={{ width: '30%' }}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(0);
          }}
        >
          {statusOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        
      </Stack>

      <Box height={500}>
        <CustomDataGrid
  rows={data}
  columns={columns}
  page={page}
  onPageChange={(newPage) => setPage(newPage)}
  pageSize={pageSize}
 
  paginationModel={{ page, pageSize }}
  onPaginationModelChange={({ page, pageSize }) => {
    setPage(page);
    setPageSize(pageSize);
  }}
  rowCount={rowCount}
  paginationMode="server"
  rowsPerPageOptions={[10, 15, 25]}
  loading={loading}
/>

      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default ToolsAndHardwareList;
