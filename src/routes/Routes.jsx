import React from "react";
import { Routes, Route } from "react-router-dom";
import ReportList from '../pages/report/reportList/reportList'
import ProjectDetailsList from "../pages/projectDetails/ProjectDetailsList/projectDetailsList";
import ReportPdfGenerator from "../pages/ReportPdfGenerator/ReportPdfGenerator"
import AdminSyncEmploy from "../pages/adminEmp/adminEmp"
import ProjectMapping from "../pages/ProjectMapping/ProjectMapping"
import SkillMapping from "../pages/skillMapping/SkillMappimg"
import ToolsAndHardwareList from "../pages/toolsandHardware/ToolsAndHardwareList/ToolsAndHardwareList"
import ToolsAndHardwareMappingList from "../pages/ToolsandHardwareMaster/toolsAndHardwareList/ToolsAndHardwareList"
import TimelineEvent from "../pages/Timeline/timeline"
import PieChart from "../pages/charts/piechartscomponent"
import Dashboard from "../pages/dashboard/dashboard"
import TenderTracking from "../pages/tender/TenderForm/tendertracking"
import TenderList from "../pages/tender/TenderList/tenderlist";
import UserLoginForm from "../pages/userAdmin/userLoginForm/UserLoginForm"
import UserLoginList from "../pages/userAdmin/userAdminList/userAdminList"
import LoginPanel from "../pages/login/loginPannel/LoginPanel"
import ForgotPassword from "../pages/login/forgotPasswordPannel/ForgotPanel"
import ChangePassword from '../pages/login/changePasswordPannel/changePasswordPannel';
import ResetPasswordVerify from "../pages/login/ResetPasswordVerification/ResetPasswordVerification"
import ScopeOfWorkMasterList from "../pages/scopeOfWorkMaster/ScopeOfWorkMasterList/ScopeOfWorkMasterList"
import CertificateList from "../pages/Certification/CertificationList/CertificationList";
import TaskForceMemberList from "../pages/taskForceMember/TaskForceMemberList/TaskForceMemberList"
import DocumentRepository from "../pages/documentRepository/documentRepository";
import Profile from "../pages/profile/Profile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPanel/>}/>
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/ProjectDetailsList" element={<ProjectDetailsList />} />
      <Route path="/reportList" element={<ReportList />} />
      <Route Path="/ReportPdfGenerator" element={<ReportPdfGenerator/>}/>
      <Route Path="/admin-Emp" element = {<AdminSyncEmploy/>}/>
      <Route Path="/user-Emp" element = {<ProjectMapping/>}/>
      <Route Path="/skills-Mapping" element={<SkillMapping/>}/>
      <Route path="/Tools-Hardware-list" element={<ToolsAndHardwareList/>}/>
      <Route path="/Tools-Hardware-Master-List" element={<ToolsAndHardwareMappingList/>}/>
      <Route path="/Timeline" element={<TimelineEvent/>}/>
      <Route path="/PieChart" element={<PieChart/>}/>
      <Route path="/tender-tracking" element={<TenderTracking/>}/>
      <Route path="/tender-list" element={<TenderList />} />
      <Route path="/register-list" element ={<UserLoginList/>}/>
      <Route path="/change-password" element ={<ChangePassword/>}/>
      <Route path="/reset-password" element={<ResetPasswordVerify/>}/>
      <Route path="/Scope-Of-Work-Master" element={<ScopeOfWorkMasterList/>}/>
      <Route path="/certificate" element={<CertificateList/>}/>
      <Route path="/Task-Force-member" element={<TaskForceMemberList/>}/>
      <Route path="/Document-Reprositary" element={<DocumentRepository/>}/>
      <Route path="/profile" element={<Profile/>}/>
    </Routes>
  );
};

export default AppRoutes;