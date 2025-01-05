import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HorizontalSlider from "./PostContentSlider";
import "./PostBox.css";
import axios from "axios";
import PostModal from "../modals/PostModal";

const PostBox = ({ post, updatePosts, height }) => {
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(
    post.likes.includes(JSON.parse(localStorage.getItem("user"))._id)
  );
  const [is_comments_shown, setIsCommentsShown] = useState(false);
  const [comments, setComments] = useState([]);

  // Handle Like
  const likePost = (id) => {
    fetch(process.env.REACT_APP_BACKEND_URL + "/like", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      credentials: "include",
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => {
        if (res.status == 200) {
          //  updatePosts(result); // Update the parent component with the new post data
          setLiked(true); // Update the local liked state
        }
      })
      .catch((err) => console.log(err));
  };

  // Handle Unlike
  const unlikePost = (id) => {
    fetch(process.env.REACT_APP_BACKEND_URL + "/unlike", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      credentials: "include",
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        updatePosts(result); // Update the parent component with the new post data
        setLiked(false); // Update the local liked state
      })
      .catch((err) => console.log(err));
  };

  // Handle Comment
  const makeComment = (text, id) => {
    fetch(process.env.REACT_APP_BACKEND_URL + "/comment", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      credentials: "include",
      body: JSON.stringify({
        text: text,
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        updatePosts(result); // Update the parent component with the new post data
        setComment(""); // Clear the comment input field
      })
      .catch((err) => console.log(err));
  };

  //show comments
  const showComments = async () => {
    const result = await fetchComments();
    setIsCommentsShown(true);
    setComments(result);
  };

  const fetchComments = async () => {
    const url =
      process.env.REACT_APP_BACKEND_URL +
      `/comments-of-post?post_id=${post._id}`;
    try {
      const result = await axios.get(url, { withCredentials: true });
      console.log(result.data);
      return result.data;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div key={post._id} className="card">
      {/* card header */}
      {post.postedBy ? (
        <div className="card-header">
          <div className="card-pic">
            <img
              src={
                post.postedBy.Photo
                  ? post.postedBy.Photo
                  : "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"
              }
              alt=""
            />
          </div>
          <h5>
            <Link to={`/profile/${post.postedBy._id}`}>
              {post.postedBy.userName}
            </Link>
          </h5>
        </div>
      ) : null}
      {/* card image */}
      <HorizontalSlider items={post.photo} height={height} />
      {/* card content */}
      <div className="card-content">
        {liked ? (
          <span
            className="material-symbols-outlined material-symbols-outlined-red"
            onClick={() => {
              unlikePost(post._id);
            }}
          >
            favorite
          </span>
        ) : (
          <span
            className="material-symbols-outlined"
            onClick={() => {
              likePost(post._id);
            }}
          >
            favorite
          </span>
        )}

        <p>{post.likes.length} Likes</p>
        <p>{post.body}</p>
        <p
          style={{ fontWeight: "bold", cursor: "pointer" }}
          onClick={() => {
            showComments();
          }}
        >
          View all comments
        </p>
      </div>
      {/*  comments with post modal */}
      {is_comments_shown ? (
        <PostModal
          setIsModalOpen={setIsCommentsShown}
          post_details={post}
          comments={comments}
        />
      ) : null}
      {/* Add Comment */}
      <div className="add-comment">
        <span className="material-symbols-outlined">mood</span>
        <input
          type="text"
          placeholder="Add a comment"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
          }}
        />
        <button
          className="comment"
          onClick={() => {
            makeComment(comment, post._id);
          }}
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default PostBox;
