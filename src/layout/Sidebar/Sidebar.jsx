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
  Avatar,
  Collapse
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
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { logoutUser } from "../../api/loginApi/loginApi";

const drawerWidth = 240;
const miniDrawerWidth = 70;

const Sidebar = ({ onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [openedByHamburger, setOpenedByHamburger] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [openGroups, setOpenGroups] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const isDrawerOpen = openedByHamburger ? isExpanded : isHovered || isExpanded;

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    setUserRole(role);
    setUserName(name);
  }, []);

  const toggleDrawer = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    setOpenedByHamburger(newState);
    onToggle(newState);
  };


const handleMouseEnter = () => {
  if (!openedByHamburger) {   // only allow hover expand if NOT controlled by hamburger
    setIsHovered(true);
    onToggle(true);
  }
};

  const handleMouseLeave = () => {
  if (!openedByHamburger) {   // only collapse on hover if not hamburger-expanded
    setIsHovered(false);
    onToggle(false);
  }
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
    { role: "Admin", label: "Vulnerabilities", icon: <BiSolidReport />, path: "/report" },
    // { role: "Admin", label: "Generate File", icon: <TbReportAnalytics />, path: "/ReportPdfGenerator" },
    { role: "Admin", label: "VAPT Team Members", icon: <BsMicrosoftTeams />, path: "/admin-Emp" },
    { role: "Admin", label: "Project-EMP Mapping", icon: <FaSitemap />, path: "/user-Emp" },
    { role: "Admin", label: "Skill Mapping", icon: <GiSkills />, path: "/skills-Mapping" },

    { role: "Admin", label: "Tools/Hardware Mapping", icon: <FaTools />, path: "/Tools-Hardware-list" },
    { role: "Admin", label: "Tender Tracking", icon: <CgListTree />, path: "/tender-list" },
    { role: "Admin", label: "User Registration", icon: <MdSpatialTracking />, path: "/register-list" },
    
    {
      role: "Admin",
      label: "Master",
      icon: <FaTools />,
      children: [
        { role: "Admin", label: "Tools and Hardware", icon: <IoHardwareChipOutline />, path: "/Tools-Hardware-Master-List" },
        { role: "Admin", label: "Type Of Work", icon: <MdSpatialTracking />, path: "/type-of-work-master-list" },
      ],
    },
    //subadmin
    { role: "SubAdmin", label: "Dashboard", icon: <RiDashboard3Fill />, path: "/" },
    { role: "SubAdmin", label: "Projects", icon: <GoProjectSymlink />, path: "/home" },
    { role: "SubAdmin", label: "Project Management", icon: <FaTimeline />, path: "/Timeline" },
    { role: "SubAdmin", label: "Project-EMP Mapping", icon: <FaSitemap />, path: "/user-Emp" },
    { role: "SubAdmin", label: "Tools/Hardware Mapping", icon: <FaTools />, path: "/Tools-Hardware-list" },
    { role: "SubAdmin", label: "Tender Tracking", icon: <CgListTree />, path: "/tender-list" },
    //user
    { role: "User", label: "Dashboard", icon: <RiDashboard3Fill />, path: "/" },
    { role: "User", label: "Projects", icon: <GoProjectSymlink />, path: "/home" },
    // { role: "User", label: "Project Management", icon: <FaTimeline />, path: "/Timeline" },
    { role: "User", label: "Project-EMP Mapping", icon: <FaSitemap />, path: "/user-Emp" },
    { role: "User", label: "Tools/Hardware Mapping", icon: <FaTools />, path: "/Tools-Hardware-list" },
    { role: "User", label: "Tender Tracking", icon: <CgListTree />, path: "/tender-list" },
  ];

  const handleToggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          width: isDrawerOpen ? drawerWidth : miniDrawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: isDrawerOpen ? drawerWidth : miniDrawerWidth,
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
      <List>
        {menuItems
          .filter((item) => item.role === userRole)
          .map((item, index) => {
            if (item.children) {
              // 🔽 Dropdown
              const isOpen = openGroups[item.label] || location.pathname.includes(item.children?.map(c => c.path).join(","));
              return (
                <React.Fragment key={index}>
                  <ListItem button onClick={() => handleToggleGroup(item.label)} sx={{ px: 2,  cursor: !isDrawerOpen  ? "default" : "pointer", }}>
                    <ListItemIcon sx={{ color: "white", minWidth: 0, mr: isDrawerOpen  ? 2 : "auto", justifyContent: "center", }}>
                      {item.icon}
                    </ListItemIcon>
                    {isDrawerOpen  && (
                      <>
                        <ListItemText primary={item.label} />
                        {isOpen ? <ExpandLess /> : <ExpandMore />}
                      </>
                    )}
                    </ListItem>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children.map((child, childIndex) => (
                          <ListItem
                            key={childIndex}
                            button
                            onClick={() => navigate(child.path)}
                            selected={location.pathname === child.path}
                            sx={{
                              pl: isDrawerOpen  ? 4 : 4,
                              cursor: !isDrawerOpen  ? "default" : "pointer",
                              backgroundColor:
                                location.pathname === child.path ? "rgba(255, 255, 255, 0.12)" : "inherit",
                              borderLeft:
                                location.pathname === child.path ? "4px solid #1abc9c" : "4px solid transparent",
                              "&:hover": {
                                backgroundColor: !isDrawerOpen 
                                  ? "transparent"
                                  : "rgba(255, 255, 255, 0.2)",
                              },
                            }}
                          >
                            <ListItemIcon sx={{ color: "white", minWidth: 0, mr: isDrawerOpen  ? 2 : "auto", justifyContent: "center" }}>
                              {child.icon}
                            </ListItemIcon>
                            {isDrawerOpen  && <ListItemText primary={child.label} />}
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </React.Fragment>
                );
              } else {
                // 🔹 Single item
                return (
                  <Tooltip title={!isDrawerOpen  ? item.label : ""} placement="right" key={index}>
                    <ListItem
                      button
                      onClick={() => navigate(item.path)}
                      selected={location.pathname === item.path}
                      sx={{
                        px: 2,
                        cursor: !isDrawerOpen  ? "default" : "pointer",
                        backgroundColor:
                          location.pathname === item.path ? "rgba(255, 255, 255, 0.12)" : "inherit",
                        borderLeft:
                          location.pathname === item.path ? "4px solid #1abc9c" : "4px solid transparent",
                        "&:hover": {
                          backgroundColor: !isDrawerOpen  ? "transparent" : "rgba(255, 255, 255, 0.2)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "white", minWidth: 0, mr: isDrawerOpen  ? 2 : "auto", justifyContent: "center" }}>
                        {item.icon}
                      </ListItemIcon>
                      {isDrawerOpen  && <ListItemText primary={item.label} />}
                    </ListItem>
                  </Tooltip>
                );
              }
            })}

          <Divider sx={{ bgcolor: "gray", my: 1 }} />

          {/* Logout */}
          <Tooltip title={!isDrawerOpen  ? "Logout" : ""} placement="right" >
            <ListItem button onClick={logout} sx={{ px: 2 ,  cursor: !isDrawerOpen  ? "default" : "pointer",}}>
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: isDrawerOpen  ? 2 : "auto", justifyContent: "center" }}>
                <FaSignOutAlt />
              </ListItemIcon>
              {isDrawerOpen  && <ListItemText primary="Logout" />}
            </ListItem>
          </Tooltip>
        </List>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
