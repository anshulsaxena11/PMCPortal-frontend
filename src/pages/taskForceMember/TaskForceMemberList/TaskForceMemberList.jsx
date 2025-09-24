import React, { useState, useEffect } from 'react';
import {getStateList} from '../../../api/stateApi/stateApi'
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import { Visibility, Edit } from '@mui/icons-material';
import Heading from '../../../components/Heading/heading';

const TaskForceMemberList = () =>{

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
    const handleViewClick = (id) => {
        navigate(`/Task-Force-member-View`, { state: { id } });
    };
    const handleEditClick = (id) => {
        navigate(`/Task-Force-member-Edit`, { state: { id } });
    };
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getStateList({
                page: page + 1,
                limit: pageSize,
                search: searchQuery.trim()
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
    }, [page, pageSize, searchQuery]);

    const columns = [
        {
          field: 'serial',
          headerName: 'S. No.',
          width: 70,
          sortable: false,
          filterable: false
        },
        { field: 'stateName', headerName: 'State Name', flex: 1.5, minWidth: 200 },
        { field: 'taskForceMember', headerName: 'Task Force Member', flex: 1.5, minWidth: 200 },
        { field: 'stateCordinator', headerName: 'State Coordinator', flex: 1.5, minWidth: 200 },
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
              {(userRole !== 'User') && (
                <>
                  <IconButton
                     onClick={() => handleEditClick(params.row.id)} size="small"
                  >
                    <Edit />
                  </IconButton>
                </>
              )}
            </Stack>
          )
        }
      ];

     return(
        <div>
            <Box sx={{ width: '100%' }}>
                   <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Heading title="State Assigment"/> 
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
                        getRowId={(row) => row._id} 
                    />
                </Box>
            </Box>
            
        </div>
     )
}

export default TaskForceMemberList;
