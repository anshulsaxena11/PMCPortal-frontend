import React, { useState,useEffect } from "react";
import { FaBars, FaHome, FaSitemap, FaTools, FaSignOutAlt } from "react-icons/fa";
import { FaTimeline } from "react-icons/fa6";
import { TbReportAnalytics } from "react-icons/tb";
import { RiAdminFill } from "react-icons/ri";
import { BiSolidReport } from "react-icons/bi";
import { useNavigate } from "react-router-dom"; 
import { GiSkills } from "react-icons/gi";
import { RiDashboard3Fill } from "react-icons/ri";
import { IoHardwareChipOutline } from "react-icons/io5";
import { MdSpatialTracking } from "react-icons/md";
import { CgListTree } from "react-icons/cg";
import { GoProjectSymlink } from "react-icons/go";
import { BsMicrosoftTeams } from "react-icons/bs";
import { logoutUser } from "../../api/loginApi/loginApi";
import Swal from "sweetalert2";
import "./Sidebar.css";

const Sidebar = ({ onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

    useEffect(() => {
      const role = localStorage.getItem("userRole");
      setUserRole(role);
    }, []);

  const toggleSidebar = () => {
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

  const handlePageSelect = (page) => {
    if (page === "ProjectDetailsList") {
      navigate("/home");
    } else if (page === "report") {
      navigate("/report");
    } else if (page === "ReportPdfGenerator") {
      navigate("/ReportPdfGenerator");
    } else if (page === "adminEmp") {
      navigate("/admin-Emp");
    } else if (page === "projectMapping") {
      navigate("/user-Emp");
    } else if (page === "SkillMapping") {
      navigate("/skills-Mapping");
    } else if (page === "ToolsAndHardwareMapping") {
      navigate("/Tools-Hardware-Master-List");
    } else if (page === "ToolsHradwareList") {
      navigate("/Tools-Hardware-list");
    } else if (page === "Timeline") {
      navigate("/Timeline");
    } else if (page === "TenderList") {
      navigate("/tender-list");
    } else if (page === "/") {
      navigate("/");
    } else if (page === "UserLoginForm") {
      navigate("/register");
    }
  };

  
  return (
    <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        <FaBars />
      </button>
       {(userRole === "Admin") &&( 
      <ul className="menu">
        <li className="menu-item" onClick={() => handlePageSelect("UserLoginForm")}>
          <MdSpatialTracking className="icon" />
          {isExpanded && <span className="label">User Registration</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("/")}>
          <RiDashboard3Fill className="icon" />
          {isExpanded && <span className="label">Dashboard</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("ProjectDetailsList")}>
          <GoProjectSymlink className="icon" />
          {isExpanded && <span className="label">Projects</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("report")}>
          <BiSolidReport className="icon" />
          {isExpanded && <span className="label">Vulnerability</span>}
        </li>
        {/* <li className="menu-item" onClick={() => handlePageSelect("ReportPdfGenerator")}>
          <TbReportAnalytics className="icon" />
          {isExpanded && <span className="label">Generate File</span>}
        </li> */}
        <li className="menu-item" onClick={() => handlePageSelect("adminEmp")}>
          <BsMicrosoftTeams className="icon" />
          {isExpanded && <span className="label">VAPT Team Members</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("projectMapping")}>
          <FaSitemap className="icon" />
          {isExpanded && <span className="label">Project-EMP Mapping</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("SkillMapping")}>
          <GiSkills className="icon" />
          {isExpanded && <span className="label">Skill Mapping</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("ToolsAndHardwareMapping")}>
          <IoHardwareChipOutline className="icon" />
          {isExpanded && <span className="label">Tools/Hardware Master</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("ToolsHradwareList")}>
          <FaTools className="icon" />
          {isExpanded && <span className="label">Tools/Hardware Mapping</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("Timeline")}>
          <FaTimeline className="icon" />
          {isExpanded && <span className="label">Project Management</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("TenderList")}>
          <CgListTree className="icon" />
          {isExpanded && <span className="label">Tender Tracking</span>}
        </li>

        <li className="menu-item" onClick={logout}>
          <FaSignOutAlt className="icon" />
          {isExpanded && <span className="label">Logout</span>}
        </li>
      </ul>
    )} 
     {(userRole === "SubAdmin") &&( 
       <ul className="menu">
        <li className="menu-item" onClick={() => handlePageSelect("/")}>
          <RiDashboard3Fill className="icon" />
          {isExpanded && <span className="label">Dashboard</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("ToolsAndHardwareMapping")}>
          <IoHardwareChipOutline className="icon" />
          {isExpanded && <span className="label">Tools/Hardware Master</span>}
        </li>
        <li className="menu-item" onClick={logout}>
          <FaSignOutAlt className="icon" />
          {isExpanded && <span className="label">Logout</span>}
        </li>
      </ul>
     )}
    </div>
  );
};

export default Sidebar;
