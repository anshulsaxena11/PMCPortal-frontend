import React, { useState, useEffect } from "react";
import {BrowserRouter as Router,Routes,Route,useLocation} from "react-router-dom";
import Sidebar from "./layout/Sidebar/Sidebar";
import ContentBody from "./components/contentBody/ContentBody";
import LoginPanel from "./pages/login/loginPannel/LoginPanel.jsx";
import { Box } from '@mui/material';
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoutes/GetRoutes.jsx";
import IdleTimerWrapper from "./components/IdleTimerWrapper/IdleTimerWrapper.jsx"; 
import ForgotPassword from "./pages/login/forgotPasswordPannel/ForgotPanel"
import ChangePassword from '../src/pages/login/changePasswordPannel/changePasswordPannel.jsx';
import ResetPasswordVerify from "./pages/login/ResetPasswordVerification/ResetPasswordVerification.jsx"
import NProgress from 'nprogress';
import Footer from "./layout/footer/footer .jsx"
import 'nprogress/nprogress.css';
import "./App.css";

function AppWrapper() {
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  NProgress.configure({ showSpinner: false });

  const handleSidebarToggle = (isExpanded) => {
    setIsSidebarExpanded(isExpanded);
  };

   useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 1000); 

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Routes>
      <Route  
        path="/login"
        element={
          <GuestRoute>
            <LoginPanel />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <GuestRoute>
            <ChangePassword />
          </GuestRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPasswordVerify />
          </GuestRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
             <IdleTimerWrapper />
              <Box sx={{ display: 'flex', flexDirection: 'column', }}>
                <Box>
                  <Sidebar onToggle={handleSidebarToggle} />
                  <ContentBody key={location.pathname} isSidebarExpanded={isSidebarExpanded} />
                </Box>
                <Footer isSidebarExpanded={isSidebarExpanded}/>
              </Box>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;