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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
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
    { role: "Admin", label: "Vulnerability", icon: <BiSolidReport />, path: "/report" },
    // { role: "Admin", label: "Generate File", icon: <TbReportAnalytics />, path: "/ReportPdfGenerator" },
    { role: "Admin", label: "VAPT Team Members", icon: <BsMicrosoftTeams />, path: "/admin-Emp" },
    { role: "Admin", label: "Project-EMP Mapping", icon: <FaSitemap />, path: "/user-Emp" },
    { role: "Admin", label: "Skill Mapping", icon: <GiSkills />, path: "/skills-Mapping" },
    { role: "Admin", label: "Tools/Hardware Master", icon: <IoHardwareChipOutline />, path: "/Tools-Hardware-Master-List" },
    { role: "Admin", label: "Tools/Hardware Mapping", icon: <FaTools />, path: "/Tools-Hardware-list" },
    { role: "Admin", label: "Project Management", icon: <FaTimeline />, path: "/Timeline" },
    { role: "Admin", label: "Tender Tracking", icon: <CgListTree />, path: "/tender-list" },
    { role: "Admin", label: "User Registration", icon: <MdSpatialTracking />, path: "/register" },
    //subadmin
    { role: "SubAdmin", label: "Dashboard", icon: <RiDashboard3Fill />, path: "/" },
    { role: "SubAdmin", label: "Projects", icon: <GoProjectSymlink />, path: "/home" },
    { role: "SubAdmin", label: "Vulnerability", icon: <BiSolidReport />, path: "/report" },
    { role: "SubAdmin", label: "Project-EMP Mapping", icon: <FaSitemap />, path: "/user-Emp" },
    { role: "SubAdmin", label: "Tools/Hardware Master", icon: <IoHardwareChipOutline />, path: "/Tools-Hardware-Master-List" },
    { role: "SubAdmin", label: "Tools/Hardware Mapping", icon: <FaTools />, path: "/Tools-Hardware-list" },
    { role: "SubAdmin", label: "Project Management", icon: <FaTimeline />, path: "/Timeline" },
    { role: "SubAdmin", label: "Tender Tracking", icon: <CgListTree />, path: "/tender-list" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          width: "100%",
          height: 64,
          bgcolor: "#2c3e50",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          px: 2,
          position: "fixed",
          zIndex: 1201,
        }}
      >
        <IconButton onClick={toggleDrawer} sx={{ color: "white", mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6">STPI</Typography>
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
            top: "7opx",
            height: "max",
            overflowY: "auto",
            transition: "width 0.3s ease-in-out",
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems
            .filter((item) => item.role === userRole)
            .map((item, index) => (
              <Tooltip title={!isExpanded ? item.label : ""} placement="right" key={index}>
                <ListItem
                  button
                  onClick={() => navigate(item.path)}
                  selected={location.pathname === item.path} // ✅ Highlight if active
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: "64px",
          ml: isExpanded ? `${drawerWidth}px` : `${miniDrawerWidth}px`,
          p: 3,
          transition: "margin 0.3s ease-in-out",
        }}
      >
      </Box>
    </Box>
  );
};

export default Sidebar;
