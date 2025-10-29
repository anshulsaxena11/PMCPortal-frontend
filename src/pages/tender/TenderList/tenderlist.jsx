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
    const [selectedDirectorate, setSelectedDirectorate] = useState('All');
    const [directorateOptions, setDirectorateOptions] = useState([]);

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        setUserRole(role);;
    }, []);

    const fetchDirectorateOptions = async () => {
        try {
           
            const allTendersResponse = await getTenderDetailsList({
                page: 1,
                limit: 10000, 
                isDeleted: showDeleted,
            });
            
            const uniqueDirectorates = Array.from(new Set(
                (allTendersResponse?.data || [])
                    .map(item => item?.directorateName)
                    .filter(name => name) 
            )).sort();

            setDirectorateOptions(uniqueDirectorates);

        } catch (error) {
            console.error('Error fetching directorate options:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getTenderDetailsList({
                page: page + 1,
                search: searchQuery.trim(),
                limit: pageSize,
                isDeleted: showDeleted,
                directorate: selectedDirectorate !== 'All' ? selectedDirectorate : undefined,
            });

        
            const transformedData = (response?.data || [])
                .filter(item => item && item._id) 
                .map((item, index) => ({
                
                    id: item._id, 
                    sno: page * pageSize + index + 1,
                    tenderName: item?.tenderName || 'N/A',
                    organizationName: item?.organizationName || 'N/A',
                    stateName: item?.stateName || 'N/A',
                    ename: item?.ename || 'N/A', 
                    directorateName: item?.directorateName || 'N/A',
                    valueINR: (item?.valueINR || 0), 
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
        fetchDirectorateOptions();
    }, [showDeleted]); 

    useEffect(() => {
        fetchData();
    }, [page, searchQuery, showDeleted, selectedDirectorate]); 

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
            const tender = data.find((item) => item.id === id);
            if(tender?.status !== 'Not Bidding'){
                const statusResult = await Swal.fire({
                    title: 'Set Tender Status',
                    text: `Tender is Success or Failure ?`,
                    icon: 'question',
                    showCancelButton: false,
                    showDenyButton: true,
                    confirmButtonText: 'WON',
                    denyButtonText: 'LOST',
                });
                let tenderStatus = '';
                if (statusResult.isConfirmed) tenderStatus = 'WON';
                else if (statusResult.isDenied) tenderStatus = 'LOST';
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
            }
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
        { field: 'stateName', headerName: 'State', flex: 1 },
        { field: 'ename', headerName: 'Task Force Member', flex: 1 },
        { field: 'directorateName', headerName: 'Directorate', flex: 1 },
        {
                  field: 'valueINR',
                  headerName: 'Value (Lakhs INR)',
                  flex: 1,
                  align: 'right',
                  renderCell: (params) => {
                    const val = params.row.valueINR; 
                    if (!val || isNaN(val)) return 'N/A';
                    const croreValue = Number(val) / 100000;
                    const formattedCr = croreValue.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                    const fullValue = 'Rs. ' + Number(val).toLocaleString('en-IN');
                    return (
                      <Tooltip title={fullValue} INR>
                        <span>{formattedCr} Lakhs</span>
                      </Tooltip>
                    );
                  }
                },
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
           
            <Box display="flex" gap={2} mb={2}>
             
               <Box display="flex" gap={2} mb={2} style={{width:'30%'}}>
                    <label style={{ marginRight: '8px' }}>Directorate:</label>
                    <select
                        value={selectedDirectorate}
                        onChange={(e) => {
                            setSelectedDirectorate(e.target.value);
                            setPage(0); 
                        }}
                        style={{ padding: "8px", borderRadius: "4px", border: '1px solid #ccc' }}
                    >
                        <option value="All">All</option>
                        {directorateOptions.map((dir, i) => (
                            <option key={i} value={dir}>{dir}</option>
                        ))}
                    </select>
                    </Box>
              
                <TextField
                    label="Search"
                    variant="outlined"
                    size="small"
                    style={{ width: "50%" }} 
                    fullWidth={false}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(0);
                    }}
                />
                 <Box display="flex" gap={2} mb={2} style={{width:'30%'}}>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<RestoreFromTrash />}
                            onClick={() => {
                            setShowDeleted(!showDeleted);
                            setPage(0);
                            setSelectedDirectorate('All'); 
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