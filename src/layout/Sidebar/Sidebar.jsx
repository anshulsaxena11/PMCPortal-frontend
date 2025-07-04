import React, { useState } from "react";
import { FaBars, FaHome, FaSitemap, FaTools } from "react-icons/fa";
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
import "./Sidebar.css";

const Sidebar = ({ onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle(newState);
  };

  const handlePageSelect = (page) => {
    if (page === "ProjectDetailsList") {
      navigate("/home");
    } else if (page === "report") {
      navigate("/report");
    }else if(page === "ReportPdfGenerator"){
      navigate("/ReportPdfGenerator")
    }else if(page === "adminEmp"){
      navigate("/admin-Emp")
    }else if(page==="projectMapping"){
      navigate("/user-Emp")
    }else if(page==="SkillMapping"){
      navigate("/skills-Mapping")
    } else if(page ==="ToolsAndHardwareMapping"){
      navigate("/Tools-Hardware-Master-List")
    }else if(page ==="ToolsHradwareList"){
      navigate("/Tools-Hardware-list")
    }else if(page === "Timeline"){
      navigate("/Timeline")
    }else if(page === "TenderList"){
      navigate("/tender-list")
    }else if(page === '/'){
      navigate('/')
    }
  };

  return (
    <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <ul className="menu">
        <li className="menu-item" onClick={() => handlePageSelect("/")}>
          <RiDashboard3Fill  className="icon" />
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
        </li>*/}
        <li className="menu-item" onClick={() => handlePageSelect("adminEmp")}>
          <RiAdminFill className="icon" />
          {isExpanded && <span className="label">VAPT Team Members</span>}
        </li> 
        <li className="menu-item" onClick={() => handlePageSelect("projectMapping")}>
          <FaSitemap  className="icon" />
          {isExpanded && <span className="label">Project-EMP Mapping</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("SkillMapping")}>
          <GiSkills  className="icon" />
          {isExpanded && <span className="label">Skill Mapping</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("ToolsAndHardwareMapping")}>
          <IoHardwareChipOutline    className="icon" />
          {isExpanded && <span className="label">Tools/Hardware Master</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("ToolsHradwareList")}>
          <FaTools   className="icon" />
          {isExpanded && <span className="label">Tools/Hardware Mapping</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("Timeline")}>
          <FaTimeline    className="icon" />
          {isExpanded && <span className="label">Project Management</span>}
        </li>
        <li className="menu-item" onClick={() => handlePageSelect("TenderList")}>
          <CgListTree     className="icon" />
          {isExpanded && <span className="label">Tender Tracking</span>}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
