import React, { useState } from "react";
import "../css/Createpost.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading/Loading";

export default function Createpost() {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  const postDetails = async () => {
    if (!body) {
      notifyA("Caption cannot be empty.");
      return;
    }

    if (files.length === 0) {
      notifyA("Please select at least one file to upload.");
      return;
    }

    const isValid = await validatePostFiles(
      Array.from(files),
      notifyA,
      notifyB
    );

    if (!isValid) return;

    const formData = new FormData();
    formData.append("body", body);

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      setIsLoading(true);
      const url = process.env.REACT_APP_BACKEND_URL;

      const response = await axios.post(url + "/createPost", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.status === 201) {
        notifyB("Post created successfully!");
        setIsLoading(true);
        navigate("/");
      } else {
        notifyA("Failed to create post. Try again.");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      notifyA("An error occurred while creating the post.");
    }
  };

  const loadFilePreview = (event) => {
    const file = event.target.files[0];
    if (file) {
      const output = document.getElementById("output");
      output.src = URL.createObjectURL(file);
      output.onload = () => URL.revokeObjectURL(output.src); // Free memory
    }
  };

  return (
    <div className="createPost">
      {isLoading && <Loading />}
      {/* Header */}
      <div className="post-header">
        <h4 style={{ margin: "3px auto" }}>Create New Post</h4>
        <button id="post-btn" onClick={postDetails}>
          Share
        </button>
      </div>

      {/* Image/Video Preview */}
      <div className="main-div">
        <img
          id="output"
          src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png"
          alt="Preview"
        />
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(event) => {
            loadFilePreview(event);
            setFiles(event.target.files);
          }}
        />
      </div>

      {/* Caption */}
      <div className="details">
        <div className="card-header">
          <div className="card-pic">{/* Profile picture placeholder */}</div>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          type="text"
          placeholder="Write a caption...."
        ></textarea>
      </div>
    </div>
  );
}

const validatePostFiles = async (files, notifyA, notifyB) => {
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  const MAX_VIDEO_DURATION = 600; // 10 minutes in seconds

  let isValid = true;

  for (let file of files) {
    // Check file size

    if (file.size > MAX_FILE_SIZE) {
      notifyA(`File ${file.name} exceeds the maximum size of 500MB.`);
      isValid = false;
      continue;
    }

    // Check video duration
    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);

      // Wait for the metadata to load
      const duration = await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video.duration);
          URL.revokeObjectURL(video.src); // Free memory
        };
      });

      if (duration > MAX_VIDEO_DURATION) {
        notifyA(
          `Video ${file.name} exceeds the maximum duration of 10 minutes.`
        );
        isValid = false;
      }
    }
  }

  return isValid;
};
