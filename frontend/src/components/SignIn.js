import React, { useState, useContext } from "react";
import "../css/SignIn.css";
import CompanyLogo from "./logo/CompanyLogo";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LoginContext } from "../context/LoginContext";
import { MyGoogleLogin } from "./GoogleLogin/GoogleLogin";
import Cookies from "js-cookie";

export default function SignIn() {
  const { setUserLogin } = useContext(LoginContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  const postData = () => {
    //checking email
    if (!emailRegex.test(email)) {
      notifyA("Invalid email");
      return;
    }
    // Sending data to server
    fetch(process.env.REACT_APP_BACKEND_URL + "/signin", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          notifyA(data.error);
        } else {
          notifyB("Signed In Successfully");
          console.log(data);
          //  localStorage.setItem("jwt", data.token);
          Cookies.set("is_logged_in", "true", { expires: 2 / 24 }); //2 hours
          localStorage.setItem("user", JSON.stringify(data.user));

          setUserLogin(true);
          navigate("/");
        }
        console.log(data);
      });
  };

  return (
    <div className="signIn">
      <div>
        <div className="loginForm">
          <span style={{ marginLeft: "20px" }}>
            {" "}
            <CompanyLogo />
          </span>
          <div>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              placeholder="Email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>
          <input
            type="submit"
            id="login-btn"
            onClick={() => {
              postData();
            }}
            value="Sign In"
          />

          <MyGoogleLogin />
        </div>
        <div className="loginForm2">
          Don't have an account ?
          <Link to="/signup">
            <span style={{ color: "blue", cursor: "pointer" }}>Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
