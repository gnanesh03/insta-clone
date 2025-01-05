import React, { useContext, useEffect } from "react";
import logo from "../img/logo.png";
import "../css/Navbar.css";
import { Link } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function Navbar({ login }) {
  const { setModalOpen } = useContext(LoginContext);
  const navigate = useNavigate();

  // console.log("navbar rendered");

  const loginStatus = () => {
    const token = localStorage.getItem("jwt");
    //const indexes = [1,2,3,4]

    if (Cookies.get("is_logged_in") === "true") {
      return (
        <>
          <Link to="/profile">
            <li>Profile</li>
          </Link>
          <Link to="/createPost">Create Post</Link>
          <Link style={{ marginLeft: "20px" }} to="/followingpost">
            My Following
          </Link>
          <Link to={""}>
            <button className="primaryBtn" onClick={() => setModalOpen(true)}>
              Log Out
            </button>
          </Link>
        </>
      );
    } else {
      return (
        <>
          <Link to="/signup">
            <li>SignUp</li>
          </Link>
          <Link to="/signin">
            <li>SignIn</li>
          </Link>
        </>
      );
    }
  };
  const loginStatusMobile = () => {
    const token = localStorage.getItem("jwt");
    if (Cookies.get("is_logged_in") === "true") {
      return (
        <>
          <Link to="/">
            <li>
              <span className="material-symbols-outlined">home</span>
            </li>
          </Link>
          <Link to="/profile">
            <li>
              <span className="material-symbols-outlined">account_circle</span>
            </li>
          </Link>
          <Link to="/createPost">
            <li>
              <span className="material-symbols-outlined">add_box</span>
            </li>
          </Link>
          <Link style={{ marginLeft: "20px" }} to="/followingpost">
            <li>
              <span className="material-symbols-outlined">explore</span>
            </li>
          </Link>
          <Link to={""}>
            <li onClick={() => setModalOpen(true)}>
              <span className="material-symbols-outlined">logout</span>
            </li>
          </Link>
        </>
      );
    } else {
      return (
        <>
          <Link to="/signup">
            <li>SignUp</li>
          </Link>
          <Link to="/signin">
            <li>SignIn</li>
          </Link>
        </>
      );
    }
  };

  return (
    <div className="navbar">
      <img
        id="insta-logo"
        src={logo}
        alt=""
        className="navbar-main-logo"
        onClick={() => {
          navigate("/");
        }}
      />
      <ul className="nav-menu">{loginStatus()}</ul>
      <ul className="nav-mobile">{loginStatusMobile()}</ul>
    </div>
  );
}
