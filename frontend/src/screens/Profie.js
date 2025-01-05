import React, { useEffect, useState } from "react";
import "../css/Profile.css";
import ProfilePic from "../components/ProfilePic";
import PostBox from "../components/Post/PostBox";
import PostGallery from "../components/Post/PostGallery/PostGallery";
import { useUserProfile } from "../ReactQuery/UserProfile";

export default function Profile() {
  var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const [pic, setPic] = useState([]);
  const [show, setShow] = useState(false);
  // const [posts, setPosts] = useState([]);
  //const [user, setUser] = useState("");
  const [changePic, setChangePic] = useState(false);

  const { data, error, isLoading } = useUserProfile();

  const user = data?.user;
  const posts = data?.posts;

  console.log("user profie component being called");

  const changeprofile = () => {
    if (changePic) {
      setChangePic(false);
    } else {
      setChangePic(true);
    }
  };

  return (
    <div className="profile">
      {/* Profile frame */}
      <div className="profile-fram-wrapper-div">
        <div className="profile-frame">
          {/* profile-pic */}
          <div className="profile-pic">
            <img
              onClick={changeprofile}
              src={user?.Photo ? user?.Photo : picLink}
              alt=""
            />
          </div>
          {/* profile-data */}
          <div className="pofile-data">
            <h1>{JSON.parse(localStorage.getItem("user")).name}</h1>
            <div className="profile-info" style={{ display: "flex" }}>
              <p>{pic ? pic.length : "0"} posts</p>
              <p>{user?.followers ? user?.followers.length : "0"} followers</p>
              <p>{user?.following ? user?.following.length : "0"} following</p>
            </div>
          </div>
        </div>
        <hr
          style={{
            width: "60%",

            opacity: "0.8",
            margin: "25px auto",
          }}
        />

        {/* Gallery */}

        {/* POSTS - heading    */}
        <h3 style={{ margin: "10px" }}>POSTS</h3>

        {<PostGallery items={posts} />}
      </div>
      {changePic && <ProfilePic changeprofile={changeprofile} />}
    </div>
  );
}
