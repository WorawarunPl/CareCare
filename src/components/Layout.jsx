import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomBar from "./BottomBar";
import "./Layout.css";

const Layout = () => {
  const location = useLocation(); 
  const currentPath = location.pathname; 

  return (
    <div className="layout-container">
      <div className="page-content">
        <Outlet />
      </div>
      <BottomBar currentPath={currentPath} />{" "}
    </div>
  );
};

export default Layout;
