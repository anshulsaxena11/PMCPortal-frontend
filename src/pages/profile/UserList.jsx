import React, { useState, useEffect } from 'react';
// Assuming these imports are correct paths to your API functions
import { empList, centreList, srpiEmpTypeList, directoratesList } from '../../api/syncEmp/syncEmp'; 
import { useNavigate } from 'react-router-dom';
import { InputGroup, FormControl, Button, Spinner } from 'react-bootstrap';
import { IconButton, Stack } from '@mui/material';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';
import Heading from '../../components/Heading/heading';
import Select from 'react-select';
                                                             
const Userlist = () => {
    const [loader, setLoader] = useState(false);
    const [data, setData] = useState([]);
    const [centreOptions, setCentreOptions] = useState([]);
    const [dirOptions, setDirOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [totalCount, setTotalCount] = useState(0); 
    
    // Pagination and Filter States
    const [selectedCentre, setSelectedCentre] = useState(null);
    const [selecteddir, setSelectedDir] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null); // Assuming Status filter is still relevant
    const [selectedType, setSelectedType] = useState(null);
    const [page, setPage] = useState(0); // 0-indexed page for DataGrid
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false); // Using 'loading' for DataGrid, 'loader' for general
    
    const navigate = useNavigate();

    // --- API Functions ---

    // Function to fetch the main employee list
    const fetchEmpList = async () => {
        setLoading(true); // Use loading for the grid
        try {
            // NOTE: API call adjusts for 1-based index if needed, using 'page + 1'
            const response = await empList({
                page: page + 1, 
                limit: pageSize,
                search: searchQuery.trim(),
                centre: selectedCentre?.value,
                StatusNoida: selectedStatus?.value,
                etpe: selectedType?.value,
                dir: selecteddir?.value
            });
            
            // console.log(response);

            const transformedData = response.data.map((item, index) => ({
                ...item,
                id: item._id, // IMPORTANT: The row ID used by DataGrid and handleViewClick
                serial: page * pageSize + index + 1,
                // Include other raw fields if needed elsewhere
            }));

            setData(transformedData);
            setTotalCount(response.total);
            // setTotalPages(response.totalPages); // No longer needed if using totalCount for pagination
        } catch (error) {
            console.error('Failed to fetch employee list:', error);
        } finally {
            setLoading(false);
        }
    };

    // Functions to fetch dropdown options (Centre, Directorates, Type)
    const fetchCentreData = async () => {
        try {
            if(!selecteddir) return;
            const response = await centreList({dir:selecteddir?.label});
            const options = response.data.data.map((centre) => ({
                value: centre,
                label: centre,
            }));
            setCentreOptions(options);
        } catch (error) {
            console.error('Error fetching centre list:', error);
        }
    };
    
    const fetchDiretoratesData = async () => {
        try {
            const response = await directoratesList();
            const options = response.data.data.map((dir) => ({
                value: dir,
                label: dir,
            }));
            setDirOptions(options);
        } catch (error) {
            console.error('Error fetching Directorates list:', error);
        }
    };

    const fetchTypeData = async () => {
        try {
            const response = await srpiEmpTypeList();
            const options = response.data.data.map((type) => ({
                value: type,
                label: type,
            }));
            setTypeOptions(options);
        } catch (error) {
            console.error('Error fetching type list:', error);
        }
    };


    // --- useEffect Hooks ---

    // 1. Fetch Dropdown Data - Runs ONCE on mount
    useEffect(() => {
        fetchDiretoratesData();
        fetchCentreData();
        fetchTypeData();
    }, [selecteddir]); // Empty array ensures this runs only once

    // 2. Fetch Employee List - Runs on pagination/filter change
    useEffect(() => {
        fetchEmpList();
    }, [page, pageSize, searchQuery, selectedCentre, selectedStatus, selectedType, selecteddir]);


    // --- Handlers ---

    // Handler for View Profile Button (The core of your original issue's intent)
    const handleViewClick = (id) => {
        // 'id' is params.row.id, which should be item._id
        navigate(`/user-profile/${id}`);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(0); // FIX: Reset to the first page (index 0)
    };

    const handleCentreChange = (selectedOption) => {
        setSelectedCentre(selectedOption);
        setPage(0); // FIX: Reset to the first page (index 0)
    };

    const handleDirChange = (selectedOption) => {
        setSelectedDir(selectedOption);
        setSelectedCentre(null)
        setPage(0); // FIX: Reset to the first page (index 0)
    };

    const handleTypeChange = (e) => {
        setSelectedType(e);
        setPage(0); // FIX: Reset to the first page (index 0)
    };


    // --- DataGrid Columns Definition ---
    const columns = [
        {
            field: 'serial',
            headerName: 'S.No',
            width: 60,
            sortable: false,
        },
        { field: 'empid', headerName: 'Employee ID', flex: 1 },
        { field: 'ename', headerName: 'Employee Name', flex: 1 },
        { field: 'centre', headerName: 'Centre', flex: 1 },
        { field: 'dir', headerName: 'Directorates', flex: 1 },
        { field: 'etpe', headerName: 'Employee Type', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Button 
                        variant="outline-info" 
                        size="sm" 
                        style={{ marginTop: "5px" }}
                        onClick={() => handleViewClick(params.row.id)} // Uses the correctly set row.id (which is item._id)
                    >
                        View Profile
                    </Button>
                </Stack>
            ),
        },
    ];

    // --- Render ---
    return (
        <div className='admin-portal'>
           
            
            <div className='row pb-3'>
                <div className='col-sm-6 col-lg-6 col-md-6'>
                    <Heading title="User List" />
                </div>
            </div>
            <hr></hr>
            
            <div className='container-fluid'>
                <div className='row mb-3 align-items-end'>
                    {/* Directorates Filter */}
                    <div className='col-sm-2 col-md-2 col-lg-2'>
                        <Select
                            options={dirOptions}
                            value={selecteddir}
                            onChange={handleDirChange}
                            placeholder="Directorates"
                            isClearable
                        />
                    </div>
                    {/* Centre Filter */}
                    {selecteddir && 
                        <div className='col-sm-2 col-md-2 col-lg-2'>
                            <Select
                                options={centreOptions}
                                value={selectedCentre}
                                onChange={handleCentreChange}
                                placeholder="Centre"
                                isClearable
                            />
                        </div>
                    }
                    {/* Type Filter */}
                    <div className='col-sm-2 col-md-2 col-lg-2'>
                        <Select
                            options={typeOptions}
                            value={selectedType}
                            onChange={handleTypeChange}
                            placeholder="Type"
                            isClearable
                        />
                    </div>
                    {/* Search Input */}
                    <div className='col-sm-4 col-md-4 col-lg-4'>
                        <InputGroup>
                            <FormControl
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </InputGroup>
                    </div>
                </div>
            </div>
            
            {/* Custom Data Grid Component */}
            <CustomDataGrid
                rows={data}
                columns={columns}
                rowCount={totalCount}
                page={page}
                pageSize={pageSize}
                paginationModel={{ page, pageSize }}
                paginationMode="server"
                onPaginationModelChange={({ page: newPage, pageSize: newPageSize }) => {
                    setPage(newPage);
                    setPageSize(newPageSize);
                }} 
                rowsPerPageOptions={[10, 15, 25]}
                loading={loading}
            />
        </div>
    );
}

export default Userlist;