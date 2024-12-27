import React from "react";
import { NavLink } from "react-router-dom";
import mainIcon from "../assets/main-icon.png";
import dailyIcon from "../assets/daily-icon.png";
import infoIcon from "../assets/info-icon.png";
import "./BottomBar.css";

const BottomBar = ({ currentPath }) => {
  return (
    <div className="bottom-bar">
      <NavLink
        to="/daily"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <div className="icon-wrapper">
          <img src={dailyIcon} alt="Daily Icon" className="icon" />
        </div>
      </NavLink>
      <NavLink
        to="/main"
        className={({ isActive }) =>
          `nav-item ${
            currentPath === "/main" ||
            currentPath === "/emotoday" ||
            currentPath === "/calendar"
              ? "active"
              : ""
          }`
        }
      >
        <div className="icon-wrapper">
          <img src={mainIcon} alt="Main Icon" className="icon" />
        </div>
      </NavLink>
      <NavLink
        to="/info"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <div className="icon-wrapper">
          <img src={infoIcon} alt="Info Icon" className="icon" />
        </div>
      </NavLink>
    </div>
  );
};

export default BottomBar;
