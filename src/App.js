import React, { useState, useEffect } from "react";
import {BrowserRouter as Router,Routes,Route,useNavigate,} from "react-router-dom";
import Sidebar from "./layout/Sidebar/Sidebar";
import ContentBody from "./components/contentBody/ContentBody";
import LoginPanel from "./pages/login/loginPannel/LoginPanel.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoutes/GetRoutes.jsx";
import Swal from "sweetalert2";
import { logoutUser } from "./api/loginApi/loginApi.js";
import useIdleTimer from "./hooks/LogoutTimer.js"; 
import "./App.css";

function AppWrapper() {
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleSidebarToggle = (isExpanded) => {
    setIsSidebarExpanded(isExpanded);
  };

  const handleIdle = async () => {
    const result = await Swal.fire({
      title: "You’ve been idle!",
      text: "You will be logged out in 10 seconds. Do you want to stay logged in?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Stay Logged In",
      cancelButtonText: "Logout Now",
      timer: 10000,
      timerProgressBar: true,
      allowOutsideClick: false,
    });

    if (
      result.dismiss === Swal.DismissReason.timer ||
      result.isDismissed ||
      result.isDenied ||
      result.isCanceled
    ) {
      await logoutUser();
      localStorage.clear();
      Swal.fire({
        icon: 'info',
        title: 'Logged Out", "You have been logged out due to inactivity.',
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/login");
    }
  };

  useIdleTimer(handleIdle, 5 * 60 * 1000); 

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
        path="/*"
        element={
          <ProtectedRoute>
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