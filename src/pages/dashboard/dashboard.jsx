// Dashboard.jsx

import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material'; 
import { TbCertificate } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import WorkIcon from '@mui/icons-material/Work';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ProjectsDashboard from '../../components/dashboard/ProjectsDashboard'; 
import SalesTrackingDashboard from '../../components/dashboard/SalesTrackingDashboard'; 
import CertificateDashboard from '../../components/dashboard/CertificateDashboard'; 
import UsersDashboard from '../../components/dashboard/UsersDashboard'; 
import ReportDashboard from '../../components/dashboard/ReportDashboard';
import "./dashboard.css"; 

const tabData = [
  { label: 'Projects', icon: <WorkIcon />, key: 'projects' },
  { label: 'Sales Tracking', icon: <RequestQuoteIcon />, key: 'salesTracking' },
  { label: 'Users', icon: <CgProfile />, key: 'users' },
  { label: 'Certificates', icon: <TbCertificate />, key: 'certificates' },
  // { label: 'Reports', icon: <TbCertificate />, key: 'reports' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 0:
        return <ProjectsDashboard />; 
      case 1:
        return <SalesTrackingDashboard />;
        case 2:
        return <UsersDashboard />;
         case 3:
        return <CertificateDashboard />;
        //   case 4: 
        // return <ReportDashboard />;
      default:
        return <ProjectsDashboard />;
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        {tabData.map((tab, index) => (
          <Paper
            key={index}
            onClick={() => setActiveTab(index)}
            elevation={3}
            sx={{
              width: 200,
              height: 70,
              cursor: 'pointer',
              borderRadius: 3,
              px: 2,
              py: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background:
                activeTab === index ? 'linear-gradient(to right, #2196f3, #21cbf3)' : '#f5f5f5',
              color: activeTab === index ? '#fff' : '#000',
              '&:hover': { boxShadow: 6 },
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              display="flex"
              alignItems="center"
              gap={1}
            >
              {tab.icon}
              {tab.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Render the selected dashboard component */}
      <Box>
        {renderActiveComponent()}
      </Box>
    </>
  );
}