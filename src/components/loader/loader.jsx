import React from "react";
import "./loader.css";

const VaptLoader = () => {
  return (
    <div className="vapt-loader-overlay">
      <div className="vapt-loader">
        <div className="spinner"></div>
        <div className="vapt-text">STPI NOIDA</div> {/* Animated Text */}
      </div>
    </div>
  );
};

export default VaptLoader;