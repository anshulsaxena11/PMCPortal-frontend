import React, { useState, useEffect } from "react";
import {BrowserRouter as Router,Routes,Route,useNavigate,useLocation} from "react-router-dom";
import Sidebar from "./layout/Sidebar/Sidebar";
import ContentBody from "./components/contentBody/ContentBody";
import LoginPanel from "./pages/login/loginPannel/LoginPanel.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoutes/GetRoutes.jsx";
import IdleTimerWrapper from "./components/IdleTimerWrapper/IdleTimerWrapper.jsx"; 
import ForgotPassword from "./pages/login/forgotPasswordPannel/ForgotPanel"
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import "./App.css";

function AppWrapper() {
  const navigate = useNavigate();
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
        path="/*"
        element={
          <ProtectedRoute>
             <IdleTimerWrapper />
            <div className="App">
              <Sidebar onToggle={handleSidebarToggle} />
              <ContentBody isSidebarExpanded={isSidebarExpanded} />
            </div>
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