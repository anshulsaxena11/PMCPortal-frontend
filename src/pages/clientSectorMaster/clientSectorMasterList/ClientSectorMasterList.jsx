import React, { useState, useEffect } from 'react';
import Heading from '../../../components/Heading/heading';
import { useNavigate } from 'react-router-dom';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import {getClientSector,getType} from '../../../api/clientSectorApi/clientSectorApi'
import { Visibility, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  Stack,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';

const ClienSectortMasterList = () =>{
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0); 
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [selectType,setSelectedType] = useState([])
    const [type,setType] = useState([])
    const navigate = useNavigate();
    useEffect(() => {
        const role = localStorage.getItem("userRole");
        setUserRole(role);
    }, []);
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getClientSector({
                page: page + 1,
                limit: pageSize,
                search: searchQuery.trim(),
                type: selectType || '',
            });
            const transformedData = response.data.map((item, index) => {
                return {
                id: item._id,
                serial: page * pageSize + index + 1,
                    ...item,
                };
            });
            setData(transformedData);
            setTotalCount(response?.pagination.total);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [page, pageSize, searchQuery,selectType]);

    const handleViewClick = (id) => {
        navigate(`/Client-Sector-Master-View`, { state: { id } });
    };

    const handleEditClick = (id) => {
        navigate(`/Client-Sector-Master-Edit`, { state: { id } });
    };
    
    const columns = [
        {
            field: 'serial',
            headerName: 'S. No.',
            width: 70,
            sortable: false,
            filterable: false
        },
        { field: 'type', headerName: 'Type', flex: 1.5, minWidth: 200 },
        { field: 'clientType', headerName: 'Client Sector', flex: 1.5, minWidth: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 120,
            sortable: false,
            renderCell: (params) => (
            <Stack direction="row" spacing={1}>
                <IconButton
                onClick={() => handleViewClick(params.row.id)}  size="small"
                >
                <Visibility />
                </IconButton>
                {/* {(userRole !== 'User') && (
                <>
                    <IconButton
                        onClick={() => handleEditClick(params.row.id)} size="small"
                    >
                    <Edit />
                    </IconButton>
                </>
                )} */}
            </Stack>
            )
        }
    ];

    useEffect(()=>{
        const fetchType = async() =>{
            try{
            const response = await getType();
            if(response.data && Array.isArray(response.data.data)){
                const option = response.data.data.map((Type)=>({
                value:Type,
                label:Type
                }))
                setType(option)
            }else{
                console.log("Expect an Array")
            }
            }catch(error){
            console.error("Error fetching Type Of Work:");
            }
        }
        fetchType()
    },[])
    return(
       <Box sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Heading title="Client sector List" />
                <Button variant="contained" onClick={() => navigate('/Client-Sector-Master-Form')}>
                    Add New
                </Button>
            </Stack>
            <hr></hr>
            <Box display="flex" gap={2} mb={2}>
                <TextField
                    fullWidth
                    label="Search here..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                    backgroundColor: 'white',
                    }}
                />
                <TextField
                    select
                    fullWidth
                    size="small"
                    label="Select Type"
                    value={selectType}
                    onChange={(e) => {
                    setSelectedType(e.target.value);
                    setPage(0);
                    }}
                    sx={{
                    backgroundColor: 'white',
                    }}
                >
                    <MenuItem value="">All</MenuItem>
                    {type.map((dir, index) => (
                    <MenuItem key={index} value={dir.value}>
                        {dir.label}
                    </MenuItem>
                    ))}
                </TextField>
            </Box>
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
                    getRowId={(row) => row._id} 
                />
            </Box>
        </Box>
    )
}

export default ClienSectortMasterList;