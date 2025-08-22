import React ,{useState,useEffect}from 'react'
import {getTypeOfWork, deleteTypeOfWork} from '../../../api/typeOfWorkAPi/typeOfWorkApi'
import { useNavigate } from 'react-router-dom';
import Heading from '../../../components/Heading/heading';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
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
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2'

const TypesOfWorkMasterList = ()=>{
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowCount, setRowCount] = useState(0);
    const navigate = useNavigate();
    const MySwal = withReactContent(Swal);

    const handleDeleteClick = async (data) => {
        const result = await MySwal.fire({
          title: 'Are you sure?',
          text: "This action cannot be undone.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'Cancel',
        });
      
        if (!result.isConfirmed) return;
        try {
          const id =data
          const response = await deleteTypeOfWork(id);
      
          if (response?.data?.statusCode === 200) {
             MySwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: response?.data?.message,
              timer: 1500,
              showConfirmButton: false,
            });
            fetchData()
      
          } else {
             MySwal.fire({
              icon: 'error',
              title: 'Error!',
              text: response?.data?.message,
            });
          }
        } catch (error) {
          MySwal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error?.message || 'Something went wrong!',
        });
        }
      };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getTypeOfWork({
                page: page + 1,
                limit: pageSize, 
                search: searchQuery.trim(),
            });
            const rowsWithSno = response?.data?.data.map((item, index) => ({
                ...item,
                id: item._id, 
                sno: page * pageSize + index + 1,
            }));
            setData(rowsWithSno);
            setRowCount(response.total || 0); 
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
        { field: 'sno', headerName: 'S.No', width: 90 },
        { field: 'typeOfWork', headerName: 'typeOfWork', flex: 1 },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 160,
          sortable: false,
          renderCell: (params) => (
            <Stack direction="row" spacing={1}>
                <IconButton
                    onClick={() => navigate(`/type-of-work-master-view/${params.row._id}`)} size="small"
                >
                    <Visibility />
                </IconButton>
                <IconButton
                    onClick={() => navigate(`/type-of-work-master-edit/${params.row._id}`)} size="small"
                >
                    <Edit />
                </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(params.row.id)}>
                            <Delete />
                    </IconButton>
            </Stack>
          ),
        },
    ];
    
    return(
        <div>
            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Heading title=" Types Of Work Master List" />        
                        <Button variant="contained" onClick={() => navigate('/type-of-work-master-form')}>
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
        </div>
    )
}

export default TypesOfWorkMasterList;
