import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate, Outlet } from "react-router-dom";
import SideBar from "../Menu/SideBar";

function ProtectedRoutes() {
  const is_logged_in = Cookies.get("is_logged_in");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("protected route rendered");

    if (is_logged_in === "true") {
      return;
    } else {
      navigate("/signin");
    }
  }, []);

  return (
    <div className="temp">
      <SideBar />

      <div
        className="protect-pages-main-routes-content"
        style={{
          position: "relative",
          marginTop: "92px",
          left: "280px",
          zIndex: 1,
          width: "80vw",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default ProtectedRoutes;
