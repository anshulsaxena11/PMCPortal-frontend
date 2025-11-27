import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import {getCertificateMasterList} from '../../../api/certificateMaster/certificateMaster'

const CertificateMasterList = () => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0); 
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getCertificateMasterList({
                page: page + 1,
                limit: pageSize,
                search: searchQuery.trim()
            });
            const data = response?.data
            console.log("Certificate Master List",data)
            const transformedData = data.map((item, index) => {
                return {
                    id: item._id,
                    serial: page * pageSize + index + 1,
                    ...item,
                };
            });
           
            setData(transformedData);
            setTotalCount(response?.pagination?.total);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
        setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [page, pageSize, searchQuery]);
    const handleViewClick = (id) => {
        navigate(`/Certificate-Master-View`, { state: { id } });
    };
    const handleEditClick = (id) => {
        navigate(`/Certificate-Master-Edit`, { state: { id } });
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
        {
          field: 'actions',
          headerName: 'Actions',
          flex: 1,
          minWidth: 120,
          sortable: false,
          renderCell: (params) => (
            <Stack direction="row" spacing={1}>
              <IconButton
                 onClick={() => handleViewClick(params.row.id)} size="small"
              >
                <Visibility />
              </IconButton>
             
                <>
                  <IconButton
                    onClick={() => handleEditClick(params.row.id)} size="small"
                  >
                    <Edit />
                  </IconButton>
                  {/* <IconButton onClick={() => handleDelete(params.row.id)} size="small">
                    <Delete color="error" />
                  </IconButton> */}
                </>
            </Stack>
          )
        }
      ];
    
    return(
        <Box sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Heading title="Certificate Master List" />
                <Button variant="contained" onClick={() => navigate('/Certificate-Master-Form')}>
                    Add New
                </Button>
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
    )
}

export default CertificateMasterList;