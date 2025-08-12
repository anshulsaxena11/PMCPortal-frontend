import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, MenuItem, TextField, Typography, IconButton, Stack } from '@mui/material';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import Heading from '../../../components/Heading/heading';
import { getToolsAndHardware } from '../../../api/toolsAndHardware/toolsAndHardware';
import { directoratesList } from '../../../api/syncEmp/syncEmp';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Visibility, Edit, Delete } from '@mui/icons-material';

const ToolsAndHardware = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0); // MUI DataGrid uses 0-based indexing
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDir, setSelectedDir] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dirOptions, setDirOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);;
  }, []);

  useEffect(() => {
    fetchDiretoratesData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchQuery, selectedDir]);

  const fetchDiretoratesData = async () => {
    setLoading(true);
    try {
      const response = await directoratesList();
      const options = response.data.data;
      setDirOptions(options);
    } catch (error) {
      console.error('Error fetching Directorates list:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getToolsAndHardware({
        page: page + 1, // Your API is 1-indexed
        limit: pageSize,
        search: searchQuery.trim(),
        directorates: selectedDir || '',
      });

      const formattedData = response.data.map((item, index) => ({
        id: item._id,
        sno: page * pageSize + index + 1,
        purchasedOrder: item.purchasedOrder,
        tollsName: item.tollsName,
        quantity: item.quantity,
        assignedTo: item.assignedTo,
        directorates: item.directorates,
        startDate: item.startDate ? dayjs(item.startDate).format('DD/MM/YYYY') : '',
        endDate: item.endDate ? dayjs(item.endDate).format('DD/MM/YYYY') : '',
      }));

      setData(formattedData);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'sno', headerName: 'S.No', width: 80 },
    { field: 'purchasedOrder', headerName: 'Purchased Order', flex: 1 },
    { field: 'tollsName', headerName: 'Tools Name', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 0.7 },
    { field: 'assignedTo', headerName: 'Assigned To', flex: 1 },
    { field: 'directorates', headerName: 'Directorates', flex: 1 },
    { field: 'startDate', headerName: 'Start Date', flex: 1 },
    { field: 'endDate', headerName: 'End Date', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => (
       
        <Stack direction="row" spacing={1}>
          <IconButton 
            onClick={() => navigate(`/Tools-Hardware-View/${params.row.id}`)} 
            size="small"
           >
          <Visibility />
        </IconButton>
         {(userRole !== 'User') && (
          <>
            <IconButton 
              onClick={() => navigate(`/Tools-Hardware-Edit/${params.row.id}`)} 
              size="small"
              >
              <Edit />
            </IconButton>
            </>
          )}
          </Stack>
       
      ),
    },
  ];

  return (
    <Box p={2}>


      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Heading title=" Tools And Hardware List" />
         {(userRole !== 'User') && (        
          <Button variant="contained" onClick={() => navigate('/Tools-Hardware')}>
            Add New
          </Button>
           )}
        </Stack>
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
        <TextField
          label="Select Directorate"
          select
          size="small"
          fullWidth
          value={selectedDir}
          onChange={(e) => {
            setSelectedDir(e.target.value);
            setPage(0);
          }}
        >
          <MenuItem value="">All</MenuItem>
          {dirOptions.map((dir, index) => (
            <MenuItem key={index} value={dir}>
              {dir}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <div style={{ height: 550, width: '100%' }}>
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

export default ToolsAndHardware;
