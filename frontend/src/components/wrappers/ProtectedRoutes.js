import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate, Outlet } from "react-router-dom";

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

  return <Outlet />;
}

export default ProtectedRoutes;
