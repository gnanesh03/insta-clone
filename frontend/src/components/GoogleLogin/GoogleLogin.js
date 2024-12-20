import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import Modal from "../modals/Modal";
import google_img from "../../img/google.png";
import "./GoogleLogin.css";
import { toast } from "react-toastify";
import { LoginContext } from "../../context/LoginContext";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

export function MyGoogleLogin() {
  const [user_name, setUserName] = useState("");
  const [is_googleModal_open, setIsGoogleModalOpen] = useState(false);
  const [google_token, setGoogleToken] = useState(null);
  const { setUserLogin } = useContext(LoginContext);

  const navigate = useNavigate();

  const continueWithGoogle = async (credentialResponse) => {
    setGoogleToken(credentialResponse.credential);

    const url = process.env.REACT_APP_BACKEND_URL;

    try {
      const res = await axios.post(
        url + "/api/auth/callback/google",
        {
          google_response: credentialResponse.credential,
        },
        { withCredentials: true }
      );

      if (res.data.token) {
        // localStorage.setItem("jwt", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toastNotifySuccess("Successfully logged in ");

        setUserLogin(true);
        navigate("/");
      } else if (res.data.require_username == true) {
        setIsGoogleModalOpen(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const registerUsingGoogle = async () => {
    try {
      const url =
        process.env.REACT_APP_BACKEND_URL + "/api/register-using-google";
      const res = await axios.post(
        url,
        {
          user_name,
          token: google_token,
        },
        {
          withCredentials: true,
        }
      );

      toastNotifySuccess("Successfully logged in ");
      //localStorage.setItem("jwt", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUserLogin(true);
      navigate("/");
    } catch (error) {
      toastNotify(error.response.data.error);
      console.log(error.response.data);
    }
  };

  return (
    <>
      <GoogleLogin
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
        buttonText="Login with Google"
        onSuccess={(credentialResponse) => {
          continueWithGoogle(credentialResponse);
        }}
        onFailure={(responseGoogle) => {
          console.log("Login Failed", responseGoogle);
        }}
        cookiePolicy={"single_host_origin"}
      />

      {is_googleModal_open ? (
        <Modal
          setIsModalOpen={setIsGoogleModalOpen}
          message="Enter a username to continue"
          children={children_component(
            user_name,
            setUserName,
            registerUsingGoogle
          )}
        />
      ) : null}
    </>
  );
}

const children_component = (user_name, setUserName, registerUsingGoogle) => {
  return (
    <div>
      <input
        value={user_name}
        style={{
          width: "200px",
          marginBottom: "4px",
          border: "1px solid rgb(220, 211, 211)",
          height: "35px",
          borderRadius: "3px",
        }}
        onChange={(e) => {
          setUserName(e.target.value);
        }}
      ></input>

      <hr style={{ border: "none" }}></hr>

      <button
        id="google-login-button"
        onClick={() => {
          registerUsingGoogle();
        }}
      >
        <img src={google_img}></img>
      </button>
    </div>
  );
};

const toastNotify = (msg) => toast.error(msg);
const toastNotifySuccess = (msg) => toast.success(msg);
