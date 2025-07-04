import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Sidebar from "./layout/Sidebar/Sidebar";
import ContentBody from "./components/contentBody/ContentBody";
import AppRoutes from "./routes/Routes"; // Ensure you use React Router here
import "./App.css";

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleSidebarToggle = (isExpanded) => {
    setIsSidebarExpanded(isExpanded);
  };

  return (
    <Router>
      <div className="App">
        <Sidebar onToggle={handleSidebarToggle} />
        <ContentBody isSidebarExpanded={isSidebarExpanded} />
      </div>
    </Router>
  );
}

export default App;
