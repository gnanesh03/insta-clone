import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ProfilePic({ changeprofile }) {
  const hiddenFileInput = useRef(null);
  const [image, setImage] = useState(null);

  // Handle uploading profile picture to backend
  const postPic = async () => {
    const formData = new FormData();
    formData.append("file", image);

    try {
      const url = process.env.REACT_APP_BACKEND_URL + "/uploadProfilePic";

      // Posting the form data to your backend
      const response = await axios.put(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        console.log("Profile picture updated successfully!");
        setImage(null);
        changeprofile(); // Call the function passed via props to update profile
        window.location.reload(); // Reload to apply the changes
      } else {
        console.log("Failed to upload profile picture.");
        setImage(null);
      }
    } catch (error) {
      setImage(null);
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  useEffect(() => {
    if (!image) {
      return;
    } else {
      postPic();
    }
  }, [image]);

  return (
    <div className="profilePic darkBg">
      <div className="changePic centered">
        <div>
          <h2>Change Profile Photo</h2>
        </div>
        <div style={{ borderTop: "1px solid #00000030" }}>
          <button
            className="upload-btn"
            style={{ color: "#1EA1F7" }}
            onClick={handleClick}
          >
            Upload Photo
          </button>
          <input
            type="file"
            ref={hiddenFileInput}
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <div style={{ borderTop: "1px solid #00000030" }}>
          <button
            className="upload-btn"
            onClick={() => {
              setImage(null); // To remove the selected image
              postPic(); // Upload the image to backend (even for removal)
            }}
            style={{ color: "#ED4956" }}
          >
            {" "}
            Remove Current Photo
          </button>
        </div>
        <div style={{ borderTop: "1px solid #00000030" }}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "15px",
            }}
            onClick={changeprofile}
          >
            cancel
          </button>
        </div>
      </div>
    </div>
  );
}
