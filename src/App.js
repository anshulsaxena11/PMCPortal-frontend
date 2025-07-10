import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./layout/Sidebar/Sidebar";
import ContentBody from "./components/contentBody/ContentBody";
import LoginPanel from "./pages/login/loginPannel/LoginPanel.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoutes/GetRoutes.jsx"
import "./App.css";

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleSidebarToggle = (isExpanded) => {
    setIsSidebarExpanded(isExpanded);
  };

  return (
    <Router>
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
    </Router>
  );
}

export default App;
