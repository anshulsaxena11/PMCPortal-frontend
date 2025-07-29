import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Divider,
  Toolbar,
  Tooltip,
  Typography,
  Avatar
} from "@mui/material";
import { TbReportAnalytics } from "react-icons/tb";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";

import {
  FaSitemap,
  FaTools,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaTimeline } from "react-icons/fa6";
import { RiDashboard3Fill } from "react-icons/ri";
import { BiSolidReport } from "react-icons/bi";
import { GiSkills } from "react-icons/gi";
import { IoHardwareChipOutline } from "react-icons/io5";
import { MdSpatialTracking } from "react-icons/md";
import { CgListTree } from "react-icons/cg";
import { GoProjectSymlink } from "react-icons/go";
import { BsMicrosoftTeams } from "react-icons/bs";

import { logoutUser } from "../../api/loginApi/loginApi";

const drawerWidth = 240;
const miniDrawerWidth = 70;

const Sidebar = ({ onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    setUserRole(role);
    setUserName(name);
  }, []);

  const toggleDrawer = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle(newState);
  };

  const logout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      Swal.fire("Logged out", "You have been logged out.", "success");
      navigate("/login");
    } catch (error) {
      Swal.fire("Error", "Logout failed", "error");
    }
  };

  const menuItems = [
    { role: "Admin", label: "Dashboard", icon: <RiDashboard3Fill />, path: "/" },
    { role: "Admin", label: "Projects", icon: <GoProjectSymlink />, path: "/home" },
    { role: "Admin", label: "Project Management", icon: <FaTimeline />, path: "/Timeline" },
    { role: "Admin", label: "Vulnerability", icon: <BiSolidReport />, path: "/report" },
    // { role: "Admin", label: "Generate File", icon: <TbReportAnalytics />, path: "/ReportPdfGenerator" },
    { role: "Admin", label: "VAPT Team Members", icon: <BsMicrosoftTeams />, path: "/admin-Emp" },
    { role: "Admin", label: "Project-EMP Mapping", icon: <FaSitemap />, path: "/user-Emp" },
    { role: "Admin", label: "Skill Mapping", icon: <GiSkills />, path: "/skills-Mapping" },
    { role: "Admin", label: "Tools/Hardware Master", icon: <IoHardwareChipOutline />, path: "/Tools-Hardware-Master-List" },
    { role: "Admin", label: "Tools/Hardware Mapping", icon: <FaTools />, path: "/Tools-Hardware-list" },
    { role: "Admin", label: "Tender Tracking", icon: <CgListTree />, path: "/tender-list" },
    { role: "Admin", label: "User Registration", icon: <MdSpatialTracking />, path: "/register-list" },
    //subadmin
    { role: "SubAdmin", label: "Dashboard", icon: <RiDashboard3Fill />, path: "/" },
    { role: "SubAdmin", label: "Projects", icon: <GoProjectSymlink />, path: "/home" },
    { role: "SubAdmin", label: "Vulnerability", icon: <BiSolidReport />, path: "/report" },
    { role: "SubAdmin", label: "Project-EMP Mapping", icon: <FaSitemap />, path: "/user-Emp" },
    { role: "SubAdmin", label: "Tools/Hardware Mapping", icon: <FaTools />, path: "/Tools-Hardware-list" },
    { role: "SubAdmin", label: "Project Management", icon: <FaTimeline />, path: "/Timeline" },
    { role: "SubAdmin", label: "Tender Tracking", icon: <CgListTree />, path: "/tender-list" },
  ];

  return (
    <Box sx={{ display: "flex", transition: "all 0.3s ease-in-out" }}>
      <Box
        sx={{
          width: "100%",
          height: 64,
          bgcolor: "#2c3e50",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          position: "fixed",
          zIndex: 1201,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={toggleDrawer} sx={{ color: "white", mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">STPI</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            alt="Profile"
            src={"/images/default_image_profile.jpg"}
            sx={{
              width: 40,
              height: 40,
              border: "2px solid #1abc9c",
            }}
          />
          <Box textAlign="left"sx={{ pr: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "white" }}>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#bdc3c7" }}>
              {userRole}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Drawer
        variant="permanent"
        sx={{
          width: isExpanded ? drawerWidth : miniDrawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: isExpanded ? drawerWidth : miniDrawerWidth,
            boxSizing: "border-box",
            bgcolor: "#2c3e50",
            color: "#fff",
            height: "max",
            overflowY: "auto",
            transition: "width 0.3s ease-in-out",
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(to bottom, #35a28dff, #2ca58dff)', 
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'linear-gradient(to bottom, #3f766bff, #394a46ff)', 
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#1a252f', 
            },
            scrollbarWidth: 'thin',
            scrollbarColor: '#3a8c7cff #1a252f', 
          },
        }}
      >
      <Toolbar />
      {/* {userName && userRole && (
        <Box
          sx={{
            textAlign: 'center',
            px: isExpanded ? 2 : 0,  
            py: isExpanded ? 2 : 1, 
            borderBottom: '1px solid #34495e',
          }}
        >
        <Box
          component="img"
          src={"/images/default_image_profile.jpg"}
          alt="Profile"
          sx={{
            width: isExpanded ? 64 : 40,     
            height: isExpanded ? 64 : 40,
            borderRadius: '50%',
            objectFit: 'cover',
            margin: '0 auto 10px',
            border: '2px solid #1abc9c',
            transition: "all 0.3s ease-in-out",
          }}
        />
        {isExpanded && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#ecf0f1' }}>
              {userName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#bdc3c7' }}>
              {userRole}
            </Typography>
           </>
        )}
      </Box>
    )} */}
        <List>
          {menuItems
            .filter((item) => item.role === userRole)
            .map((item, index) => (
              <Tooltip title={!isExpanded ? item.label : ""} placement="right" key={index}>
                <ListItem
                  button
                  onClick={() => navigate(item.path)}
                  selected={location.pathname === item.path} 
                  sx={{
                    px: 2,
                    cursor: !isExpanded ? 'default' : 'pointer',
                    backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.12)' : 'inherit', // ✅ Background for active
                    borderLeft: location.pathname === item.path ? '4px solid #1abc9c' : '4px solid transparent', // ✅ Left accent
                    '&:hover': {
                      backgroundColor: !isExpanded
                        ? 'transparent'
                        : 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "white", minWidth: 0, mr: isExpanded ? 2 : "auto", justifyContent: "center" }}>
                    {item.icon}
                  </ListItemIcon>
                  {isExpanded && <ListItemText primary={item.label} />}
                </ListItem>
              </Tooltip>
            ))}
          <Divider sx={{ bgcolor: "gray", my: 1 }} />
          <Tooltip title={!isExpanded ? "Logout" : ""} placement="right">
            <ListItem button onClick={logout} sx={{ px: 2 }}>
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: isExpanded ? 2 : "auto", justifyContent: "center" }}>
                <FaSignOutAlt />
              </ListItemIcon>
              {isExpanded && <ListItemText primary="Logout" />}
            </ListItem>
          </Tooltip>
        </List>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
