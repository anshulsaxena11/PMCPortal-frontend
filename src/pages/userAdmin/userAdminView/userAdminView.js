import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetailsById } from '../../../api/loginApi/loginApi'
import { Box, Typography, Button, IconButton, Tooltip, Paper,Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import dayjs from 'dayjs';
import { TiArrowBack } from "react-icons/ti";

const UserAdminView = ({ ID }) => {
    const { id } = useParams();
    const userId = ID || id;
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
       const fetchuserDetails = async () => {
         try {
            const data = await getUserDetailsById(userId);
            const item = data?.data;
            const formattedData = {
              ...item,
              createdAt: item?.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY') : '',
              StatusNoida: item?.StatusNoida ? (
                <span className="text-success fw-bold">Active</span>
              ) : (
                <span className="text-danger fw-bold">Inactive</span>
              ),
                taskForceMember: item?.taskForceMember === 'No' ? (
                  <span className="text-danger fw-bold">No</span>
              ) : (
                <span className="text-success fw-bold">Yes</span>
              )
            };
           setUserDetails(formattedData);
         } catch (error) {
           console.error("Error fetching project details:", error);
         }
       };
       fetchuserDetails();
     }, []);

     const handleBackClick = ()=>{
        navigate(`/register-list`) 
      }

    return(
        <div className="container-fluid">
            <div className="row">
              <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                    mb={3}
                >
                    <Box position="absolute" left={0}>
                    <Tooltip title="Back">
                        <IconButton
                        onClick={handleBackClick}
                        sx={{
                            backgroundColor: 'error.main',
                            color: 'white',
                            '&:hover': {
                            backgroundColor: 'error.dark',
                            },
                            width: 48,
                            height: 48,
                        }}
                        >
                        <ArrowBackIcon  size={24} />
                        </IconButton>
                    </Tooltip>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      User Details
                    </Typography>
                </Box>
            </div>
            <hr className="my-3" style={{  width: '100%',height: '100%', backgroundColor: '#000', opacity: 1 }}></hr>
             {userDetails ? (
                <Paper elevation={3} sx={{ maxWidth: '100%', margin: "auto", p: 3, borderRadius: 2 }}>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <div className="row">
                      <div className="col-sm-6 col-md-6 col-lg-6">
                        <tr className="py-3" style={{ display: 'flex', width: '100%' }}>
                          <td style={{ fontWeight: "bold", textAlign: "left", paddingRight: '10px' }}>
                            <Typography fontWeight="bold">Employee ID :- </Typography>
                          </td>
                          <td style={{ textAlign: "left" }}>
                            <Typography>{userDetails.empId}</Typography>
                          </td>
                        </tr>
                        <tr className="pb-3" style={{ display: 'flex', width: '100%' }}>
                          <td style={{ fontWeight: "bold", textAlign: "left", paddingRight: '10px' }}>
                            <Typography fontWeight="bold">Directorate :- </Typography>
                          </td>
                          <td style={{ textAlign: "left" }}>
                            <Typography>{userDetails.dir}</Typography>
                          </td>
                        </tr>
                        <tr style={{ display: 'flex', width: '100%' }}>
                          <td style={{ fontWeight: "bold", textAlign: "left", paddingRight: '10px' }}>
                            <Typography fontWeight="bold">Employee Type :- </Typography>
                          </td>
                          <td style={{ textAlign: "left" }}>
                            <Typography>{userDetails.etpe}</Typography>
                          </td>
                        </tr>
                        <tr className= 'py-3'style={{ display: 'flex', width: '100%' }}>
                          <td style={{ fontWeight: "bold", textAlign: "left", paddingRight: '10px' }}>
                            <Typography fontWeight="bold">Role :- </Typography>
                          </td>
                          <td style={{ textAlign: "left" }}>
                            <Typography>{userDetails.role}</Typography>
                          </td>
                        </tr>
                        <tr className= 'pb-3'style={{ display: 'flex', width: '100%' }}>
                          <td style={{ fontWeight: "bold", textAlign: "left", paddingRight: '10px' }}>
                            <Typography fontWeight="bold">Task Force Member :- </Typography>
                          </td>
                          <td style={{ textAlign: "left" }}>
                            <Typography>{userDetails.taskForceMember}</Typography>
                          </td>
                        </tr>
                        <tr className= 'pb-3'style={{ display: 'flex', width: '100%' }}>
                          <td style={{ fontWeight: "bold", textAlign: "left", paddingRight: '10px' }}>
                            <Typography fontWeight="bold">Created At :- </Typography>
                          </td>
                          <td style={{ textAlign: "left" }}>
                            <Typography>{userDetails.createdAt}</Typography>
                          </td>
                        </tr>
                      </div>
                      <div className="col-sm-6 col-md-6 col-lg-6">
                        <tr className="py-3" style={{ display: 'flex', width: '100%' }}>
                          <td style={{ fontWeight: "bold", textAlign: "left", paddingRight: '10px' }}>
                            <Typography fontWeight="bold">Employee Name :- </Typography>
                          </td>
                          <td style={{ textAlign: "left" }}>
                            <Typography>{userDetails.ename}</Typography>
                          </td>
                        </tr>
                          <tr style={{ display: 'flex', width: '100%' }}>
                            <td style={{ fontWeight: "bold", textAlign: "left", paddingRight: '10px' }}>
                              <Typography fontWeight="bold">Centre :- </Typography>
                            </td>
                            <td style={{ textAlign: "left" }}>
                              <Typography>{userDetails.centre}</Typography>
                            </td>
                          </tr>
                          <tr className="py-3" style={{ display: 'flex', width: '100%' }}>
                            <td style={{ fontWeight: "bold", textAlign: "left", paddingRight: '10px' }}>
                              <Typography fontWeight="bold">E-Mail :- </Typography>
                            </td>
                            <td style={{ textAlign: "left" }}>
                              <Typography>{userDetails.email}</Typography>
                            </td>
                          </tr>
                          <tr className="pb-3" style={{ display: 'flex', width: '100%' }}>
                            <td style={{ fontWeight: "bold", textAlign: "left", paddingRight: '10px' }}>
                              <Typography fontWeight="bold">Designation :- </Typography>
                            </td>
                            <td style={{ textAlign: "left" }}>
                              <Typography>{userDetails.edesg}</Typography>
                            </td>
                          </tr>
                          <tr className="pb-3" style={{ display: 'flex', width: '100%' }}>
                            <td style={{ fontWeight: "bold", textAlign: "left", paddingRight: '10px' }}>
                              <Typography fontWeight="bold">Vapt Team Member :- </Typography>
                            </td>
                            <td style={{ textAlign: "left" }}>
                              <Typography>{userDetails.StatusNoida}</Typography>
                            </td>
                          </tr>
                      </div>
                    </div> 
                  </Box>
                </Paper>
             ):(
              <Typography align="center" variant="body1">
                Loading user details...
              </Typography>
             )}
            <Box
              sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 4, 
              }}
              >
              <Button
                  variant="contained"
                  color="error"
                  onClick={handleBackClick}
                  startIcon={<TiArrowBack />}
                  sx={{
                  paddingX: 3,
                  paddingY: 1,
                  fontWeight: 'bold',
                  borderRadius: 3,
                  fontSize: '1rem',
                  letterSpacing: '0.5px',
                  boxShadow: 3,
                  }}
              >
                  BACK
              </Button>
            </Box>
        </div>
    )

}

export default UserAdminView;
