import React, { useContext } from "react";
import CompanyLogo from "./logo/CompanyLogo";
import "../css/Navbar.css";
import { LoginContext } from "../context/LoginContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Navbar() {
  const { setModalOpen } = useContext(LoginContext);
  const navigate = useNavigate();

  return (
    <div
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
      }}
    >
      {/* Company Logo on the Left */}
      <span className="company-logo" onClick={() => navigate("/")}>
        <CompanyLogo />
      </span>

      {/* Logout Button on the Right */}
      <Button
        style={{ color: "black", fontSize: "15px" }}
        onClick={() => setModalOpen(true)}
      >
        Logout
        <LogoutIcon
          style={{ marginLeft: "5px", marginBottom: "2px", height: "21px" }}
        />
      </Button>
    </div>
  );
}
