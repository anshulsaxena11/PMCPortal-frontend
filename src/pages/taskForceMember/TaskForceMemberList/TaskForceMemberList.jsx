import React, { useState, useEffect } from 'react';
import {getStateList} from '../../../api/stateApi/stateApi'
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import { useNavigate } from 'react-router-dom';
import {postEmailSetting, getEmailSetting} from '../../../api/emailSetting/emailSetting'
import PopupForm from '../../../components/PopBoxForm/PopupBoxForm'
import { Table } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { CiViewList } from "react-icons/ci";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Tooltip
} from '@mui/material';
import Select from "react-select";
import { Visibility, Edit } from '@mui/icons-material';
import Heading from '../../../components/Heading/heading';

const TaskForceMemberList = () =>{

    const [data, setData] = useState([]);
    const [page, setPage] = useState(0); // MUI starts pages from 0
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailEnabled, setEmailEnabled] = useState();
    const [showModal, setShowModal] = useState(false);
    const [frequency, setFrequency] = useState('');
    const [dailyTime, setDailyTime] = useState('');
    const [weeklyDay, setWeeklyDay] = useState('');
    const [SelectWeak, setSelectWeak] = useState(null);
    const [weeklyTime, setWeeklyTime] = useState('');
    const [userRole, setUserRole] = useState(null);
    const weekOption = [
      { value: 'Monday', label: 'Monday' },
        { value: 'Tuesday', label: 'Tuesday' },
        { value: 'Wednesday', label: 'Wednesday' },
        { value: 'Thursday', label: 'Thursday' },
        { value: 'Friday', label: 'Friday' },
        { value: 'Saturday', label: 'Saturday' },
        { value: 'Sunday', label: 'Sunday' }
      ];
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

    const handleStopEmail = async () => {
      try{
        const payload={enabled: false,
              frequency,
            time: frequency === 'daily' ? dailyTime : weeklyTime,
            day: frequency === 'weekly' ? weeklyDay : null,
        }
        const response=await postEmailSetting(payload);
        if(response?.data?.statusCode === 200){
          toast.success('Email settings updated successfully!', {
              className: 'custom-toast custom-toast-success',
            });
        }
        handleCloseModal();
        fetchemailData()
      }catch(err){
        console.error(err);
      }
    }

   const handleSave = async () => {
    const payload = {
      enabled: true,
      frequency,
      time: frequency === 'daily' ? dailyTime : weeklyTime,
      day: frequency === 'weekly' ? weeklyDay : null,
    };

    try {
      const response = await postEmailSetting(payload);
        if(response?.data?.statusCode === 200){
          toast.success('Email settings updated successfully!', {
              className: 'custom-toast custom-toast-success',
            });
        }
     
      handleCloseModal();
      fetchemailData()
    } catch (err) {
      console.error(err);
    }
  };

    const fetchemailData = async () => {
        try {
          const response = await getEmailSetting();
          const data = response?.data?.enabled;
             if (!data) return;

          setEmailEnabled(data.weeklyMailEnabled );
          setFrequency(data.frequency || '');

          // DAILY
          if (data.frequency === 'daily') {
            setDailyTime(data.time || '');
            setWeeklyTime('');
            setSelectWeak(null);
            setWeeklyDay('');
          }

          if (data.frequency === 'weekly') {
            setWeeklyTime(data.time || '');
            setDailyTime('');

            const selectedWeek = weekOption.find(
              (item) => item.value === data.day
            );

            setSelectWeak(selectedWeek || null);
            setWeeklyDay(data.day || '');
          }

        }catch (error) {
          console.error('Error fetching email settings:', error);
        }
      }

    useEffect(() => {
        fetchemailData();
    }, []);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

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
      const handleWweakchange = (selectedOption) => {
        setSelectWeak(selectedOption);
        setWeeklyDay(selectedOption ? selectedOption.value : '');
      }


     return(
        <div>
           <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
             <PopupForm
          show={showModal}
          handleClose={handleCloseModal}
          title="Email Settings"
          showFooter={false}
          dialogClassName="modal-xl"
        >
          <FormControl fullWidth>
            <FormLabel>Email Frequency</FormLabel>

            <RadioGroup
              row
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              sx={{ mt: 1 }}
            >
              <FormControlLabel value="daily" control={<Radio />} label="Daily" />
              <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
            </RadioGroup>

            {frequency === 'daily' && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  label="Select Time"
                  type="time"
                  value={dailyTime}
                  onChange={(e) => setDailyTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            )}

            {frequency === 'weekly' && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Select
                  name="tollsName"
                  options={weekOption}
                  value={SelectWeak}
                  onChange={handleWweakchange}
                  isLoading={loading}
                />
                <TextField
                  label="Select Time"
                  type="time"
                  value={weeklyTime}
                  onChange={(e) => setWeeklyTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            )}
          {(emailEnabled === false || emailEnabled === null) && (
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={handleSave}
            >
              Start Email
            </Button>
          )}
          {(emailEnabled === true &&
              <Button
                variant="contained"
                color='error'
                sx={{ mt: 3 }}
                onClick={handleStopEmail}
              >
                Stop Email
              </Button>
          )}
      </FormControl>
    </PopupForm>
            <Box sx={{ width: '100%' }}>
                   <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Heading title="State Assigment"/> 
                            <Button variant="contained" color="primary" disabled={loading} startIcon={!loading && <CiViewList />} onClick={handleShowModal}>Email</Button>
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
