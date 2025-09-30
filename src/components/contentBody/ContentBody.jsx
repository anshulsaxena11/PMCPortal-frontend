import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation  } from "react-router-dom";
import ProjectDetailsList from "../../pages/projectDetails/ProjectDetailsList/projectDetailsList.jsx";
import Home from "../../pages/projectDetails/HomePage/HomePage.jsx"
import ReportList from "../../pages/report/reportList/reportList.jsx";
import EditReportForm from "../../pages/report/reportEdit/reportEdit.jsx"
import Report from "../../pages/report/reportForm/report.jsx"
import ReportView from "../../pages/report/reportView/reportView.jsx"
import ProjectDetailsView from "../../pages/projectDetails/projectDetailView/projectDetailsView.jsx"
import ProjectDetailsEdit from "../../pages/projectDetails/projectDetailsEdit/projectDetailsEdit.jsx"
import VaptLoader from "../../components/loader/loader.jsx";
import ReportPdfGenerator from "../../pages/ReportPdfGenerator/ReportPdfGenerator.jsx"
import AdminSyncEmploy from "../../pages/adminEmp/adminEmp.jsx"
import ProjectMapping from "../../pages/ProjectMapping/ProjectMapping.jsx"
import SkillMapping from "../../pages/skillMapping/SkillMappimg.jsx"
import ToolsAndHardware from "../../pages/toolsandHardware/ToolsAndHardwareEntry/ToolsAndHardware.jsx"
import ToolsAndHardwareMapping from "../../pages/ToolsandHardwareMaster/ToolsAndHardwatreMasterEntry/ToolsAnsHardwareMater.jsx"
import ToolsAndHardwareMappingList from "../../pages/ToolsandHardwareMaster/toolsAndHardwareList/ToolsAndHardwareList.jsx"
import ToolsAndHardwareMappingEdit from '../../pages/ToolsandHardwareMaster/ToolsAndHardwareEdit/ToolsAndHardwareEdit.jsx'
import ToolsAndHardwareMappingView from '../../pages/ToolsandHardwareMaster/TooolsAndHardwareView/ToolsAndHardwareView.jsx'
import ToolsAndHardwarelist from'../../pages/toolsandHardware/ToolsAndHardwareList/ToolsAndHardwareList.jsx'
import ToolsAndHardwareEdit from '../../pages/toolsandHardware/ToolsAndHardwareEdit/ToolsAndHardwareEdit.jsx'
import ToolsAndHardwareView from '../../pages/toolsandHardware/toolsAndHardwareView/TollAndHardwareView.jsx'
import TimelineEvent from '../../pages/Timeline/timeline.jsx'
import PieChart from "../../pages/charts/piechartscomponent.jsx"
import Dashboard from "../../pages/dashboard/dashboard.jsx"
import TenderTracking from "../../pages/tender/TenderForm/tendertracking.jsx"
import TenderList from "../../pages/tender/TenderList/tenderlist.jsx"
import TenderTrackingEdit from "../../pages/tender/TenderEdit/tenderEdit.jsx"
import TenderTrackingView from "../../pages/tender/TenderView/tenderView.jsx"
import UserLoginList from "../../pages/userAdmin/userAdminList/userAdminList.jsx"
import UserLoginForm from "../../pages/userAdmin/userLoginForm/UserLoginForm.jsx"
import UserAdminView from "../../pages/userAdmin/userAdminView/userAdminView.jsx"
import UserAdminEdit from "../../pages/userAdmin/userAdminEdit/userAdminEdit.jsx"
import TypesOfWorkMasterList from "../../pages/TypesOfWorksMaster/TypesOfWorkMasterList/TypeOfWorkMasterList.jsx"
import TypesOfWorkMasterView from "../../pages/TypesOfWorksMaster/TypeOfWorkMasterView/TypesPfWorkMasterView.jsx"
import TypesOfWorkMasterEdit from "../../pages/TypesOfWorksMaster/TypesOfWorkMasterEdit/TypesOfWorkMasterEdit.jsx"
import TypesOfWorkMasterForm from "../../pages/TypesOfWorksMaster/TypesOfWorkMasterForm/TypesOfWorkMasterForm.jsx"
import ScopeOfWorkMasterList from "../../pages/scopeOfWorkMaster/ScopeOfWorkMasterList/ScopeOfWorkMasterList"
import ScopeOfWorkMasterView from "../../pages/scopeOfWorkMaster/ScopeOfWorkMasterView/ScopeOfWorkMasterView.jsx"
import ScopeOfWorkForm from "../../pages/scopeOfWorkMaster/ScopeOfWorkForm/ScopeOfWorkForm.jsx"
import ScopeOfWorkEdit from "../../pages/scopeOfWorkMaster/ScopeOfWorkEdit/ScopeOfWorkEdit.jsx"
import CertificateList from "../../pages/Certification/CertificationList/CertificationList.jsx";
import CertificateForm from "../../pages/Certification/CertificationEntry/CertificationEntry.jsx";
import CertificateView from "../../pages/Certification/CertificateView/CertificateView.jsx";
import CerificateEdit from "../../pages/Certification/CertificateEdit/CerificateEdit.jsx";
import TaskForceMemberList from "../../pages/taskForceMember/TaskForceMemberList/TaskForceMemberList.jsx"
import TaskForceMemberViewDetails from "../../pages/taskForceMember/TaskForceMemberView/TaskForceMemberViewDetails.jsx"
import TaskForceMemberEdit from "../../pages/taskForceMember/TaskForceMemberEdit/TaskForceMemberEdit.jsx"
import DocumentRepository from "../../pages/documentRepository/documentRepository.jsx"
import DomainMasterList from "../../pages/domainMaster/domainMasterList/DomainMasterList.jsx"
import DomainMasterForm from "../../pages/domainMaster/domainMasterForm/DomainMasterForm.jsx"
import DomainMasterView from "../../pages/domainMaster/domainMasterView/DomainMasterView.jsx"
import DomainMasterEdit from "../../pages/domainMaster/domainMasterEdit/DomainMasterEdit.jsx"
import Profile from "../../pages/profile/Profile.jsx";
import UserList from "../../pages/profile/UserList.jsx";
import UserProfile from "../../pages/profile/UserProfile.jsx";
import './contentBody.css'

const ContentBody = ({ isSidebarExpanded }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000); 

    return () => clearTimeout(timer);
  }, [location.pathname]); 

  return (
    <div className={`content-body ${isSidebarExpanded ? "expanded" : "collapsed"}`}>

      {loading && (
        <div className="vapt-loader-overlay">
          <VaptLoader />
        </div>
      )}

      <div className={`page-content ${loading ? "loading" : ""}`}>
        <Routes  key={location.key}>          
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/Dashboard" element={<Dashboard/>}/>
          <Route path="/home" element={<ProjectDetailsList />} />
          <Route path="/ProjectDetails" element={<Home />} />
          <Route path="/projectDetails/:id" element={<ProjectDetailsView />} />
          <Route path="/projectDetailsEdit/:id" element={<ProjectDetailsEdit />} />
          <Route path="/piechart" element={<PieChart />} />
          <Route path="/report" element={<ReportList />} />
          <Route path="/newReport" element={<Report />} />
          <Route path="/newReportView/:id" element={<ReportView />} />
          <Route path="/editReport/:id" element={<EditReportForm />} />
          <Route path="/ReportPdfGenerator" element={<ReportPdfGenerator/>}/>
          <Route path="/admin-Emp" element={<AdminSyncEmploy/>}/>
          <Route path="/user-Emp" element={<ProjectMapping/>}/>
          <Route path="/skills-Mapping" element={<SkillMapping/>}/>
          <Route path="/Tools-Hardware" element={<ToolsAndHardware/>}/>
          <Route path="/Tools-Hardware-list" element={<ToolsAndHardwarelist/>}/>
          <Route path="/Tools-Hardware-Edit/:id" element={<ToolsAndHardwareEdit/>}/>         
          <Route path="/Tools-Hardware-Master" element={<ToolsAndHardwareMapping/>}/>
          <Route path="/Tools-Hardware-Master-List" element={<ToolsAndHardwareMappingList/>}/>
          <Route path="/Tools-Hardware-Master-Edit/:id" element={<ToolsAndHardwareMappingEdit/>}/>
          <Route path="/Tools-Hardware-Master-View/:id" element={<ToolsAndHardwareMappingView/>}/>
          <Route path='/Tools-Hardware-View/:id' element={<ToolsAndHardwareView/>}/>
          <Route path="/Timeline" element={<TimelineEvent/>}/>
          <Route path="/Tender-Tracking" element={<TenderTracking/>}/>
          <Route path="/tender-list" element={<TenderList/>}/>
          <Route path="/tender-Edit" element={<TenderTrackingEdit/>}/>
          <Route path="/tender-View" element={<TenderTrackingView/>}/>
          <Route path="/register" element ={<UserLoginForm/>}/> 
          <Route path="/register-list" element ={<UserLoginList/>}/>
          <Route path="/register-view/:id" element = {<UserAdminView/>}/>
          <Route path="/register-Edit/:id" element = {<UserAdminEdit/>}/>
          <Route path="/type-of-work-master-list" element ={<TypesOfWorkMasterList/>}/>
          <Route path="/type-of-work-master-view/:id" element ={<TypesOfWorkMasterView/>}/> 
          <Route path="/type-of-work-master-edit/:id" element ={<TypesOfWorkMasterEdit/>}/>
          <Route path="/type-of-work-master-form" element={<TypesOfWorkMasterForm/>}/>
          <Route path="/Scope-Of-Work-Master" element={<ScopeOfWorkMasterList/>}/>
          <Route path="/Scope-of-Work-View/:id" element={<ScopeOfWorkMasterView/>}/>
          <Route path="/Scope-of=Work-Form" element={<ScopeOfWorkForm/>}/>
          <Route path="/Scope-Of-Work=Edit/:id" element={<ScopeOfWorkEdit/>}/>
          <Route path="/certificate" element={<CertificateList/>}/>
          <Route path="/certificate-form" element={<CertificateForm/>}/>
          <Route path="/certificate-view/:id" element={<CertificateView/>}/>
          <Route path="/certificate-Edit/:id" element={<CerificateEdit/>}/>
          <Route path="/Task-Force-member" element={<TaskForceMemberList/>}/>
          <Route path="/Task-Force-member-View" element={<TaskForceMemberViewDetails/>}/>
          <Route path="/Task-Force-member-Edit" element={<TaskForceMemberEdit/>}/>
          <Route path="/Document-Reprositary" element={<DocumentRepository/>}/>
          <Route path="/Domain-Sector-Master" element={<DomainMasterList/>}/>
          <Route path="/Domain-Sector-Master-Form" element={<DomainMasterForm/>}/>
          <Route path="/Domain-Sector-Master-View" element={<DomainMasterView/>}/>
          <Route path="/Domain-Sector-Master-Edit" element={<DomainMasterEdit/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/user-list" element={<UserList/>}/>
          <Route path="/user-profile/:id" element={<UserProfile/>}/>
        </Routes>
      </div>
    </div>
  );
};

export default ContentBody;