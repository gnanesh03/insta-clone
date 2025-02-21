import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import HorizontalSlider from "./PostContentSlider";
import "./PostBox.css";
import axios from "axios";
import PostModal from "../modals/PostModal";
import PositionedMenu from "../Menu/MenuList";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SendIcon from "@mui/icons-material/Send";
const PostBox = ({ post, updatePosts, height }) => {
  const [comment, setComment] = useState("");
  const user_id = JSON.parse(localStorage.getItem("user"))._id;

  const [liked, setLiked] = useState(
    post?.likes.some(
      (e) => e.user_id === JSON.parse(localStorage.getItem("user"))._id
    )
  );

  const [is_comments_shown, setIsCommentsShown] = useState(false);
  const [comments, setComments] = useState([]);

  // dynamic post page
  const url = `/profile/${post?.postedBy._id}/${post?._id}`;

  // Handle Like
  const likePost = async (id) => {
    try {
      const url = process.env.REACT_APP_BACKEND_URL + "/like";
      const result = await axios.put(
        url,
        { postId: id },
        { withCredentials: true }
      );
      setLiked(true);
      post.likes.push(result.data);
      updatePosts(post);
    } catch (error) {
      console.log(error);
    }
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
        let likes = post.likes.filter((e) => e.user_id !== user_id);
        const updated_post = post;
        updated_post.likes = likes;

        updatePosts(updated_post); // Update the parent component with the new post data
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
          <span className="menu-for-post-options">
            {/* <MoreHorizIcon className="menu-for-post-options-icon" /> */}
            <PositionedMenu url={url} />
          </span>
        </div>
      ) : null}
      {/* card image */}
      <div className="images-container">
        <HorizontalSlider items={post.photo} height={height} />
      </div>
      {/* card content */}
      <div className="card-content">
        {liked ? (
          <span
            onClick={() => {
              unlikePost(post._id);
            }}
          >
            <FavoriteIcon />
          </span>
        ) : (
          <span
            onClick={() => {
              likePost(post._id);
            }}
          >
            <FavoriteBorderIcon />
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
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default PostBox;
