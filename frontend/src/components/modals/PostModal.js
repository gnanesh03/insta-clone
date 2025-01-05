import { useState } from "react";
import HorizontalSlider from "../Post/PostContentSlider";
import "./PostModal.css";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

export default function PostModal({ setIsModalOpen, post_details, comments }) {
  const [reply, setReply] = useState("");
  const [reply_id, setReplyId] = useState(null);
  const [replies_id, setRepliesId] = useState("");

  // Component for an individual comment

  const showReplyInput = (comment_id) => {
    setReplyId(comment_id);
  };

  const handleSend = async (comment_id) => {
    console.log("senging..");

    const url = process.env.REACT_APP_BACKEND_URL + "/reply-to-comment";
    try {
      const result = await axios.post(
        url,
        { text: reply, comment_id },
        { withCredentials: true }
      );
      console.log(result.data);
      setReplyId(null); // Optionally clear the reply ID after sending
      setReply(""); // Optionally clear the reply input after sending
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    console.log("Cancel");
    setReplyId(null); // Clear the reply ID on cancel
    setReply(""); // Optionally clear the input field on cancel
  };

  const showReplies = (comment_id) => {
    setRepliesId(comment_id);
  };

  return (
    <div
      id="post-comments-modal-background"
      onClick={() => setIsModalOpen(false)}
    >
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={() => setIsModalOpen(false)}>
          X
        </button>

        <div className="image">
          <HorizontalSlider items={post_details.photo} height="85vh" />
        </div>
        <div className="comments_container">
          <div className="header">
            <img
              className="profile-pic-of-person-who-posted"
              src={post_details.postedBy.Photo}
            />
            <div>
              <span className="user-name">
                {post_details.postedBy.userName}
              </span>
              <span>{post_details.body}</span>
            </div>
          </div>
          <hr className="comments-divider" />
          <div className="all-comments">
            {comments && comments.length > 0
              ? comments.map((item) => (
                  <div className="individual-comment" key={item._id}>
                    <img
                      className="profile-pic-of-person-who-commented"
                      src={item.posted_by.Photo}
                    />
                    <div className="username-and-comment">
                      <span className="user-name">
                        {item.posted_by.user_name}
                      </span>
                      <span> {item.body}</span>
                      <br />
                      {item.replies && item.replies.length > 0 ? (
                        <span
                          className="view-replies"
                          onClick={() => {
                            showReplies(item._id);
                          }}
                        >
                          view replies
                        </span>
                      ) : null}

                      {reply_id === item._id ? (
                        <>
                          <br />
                          <div className="reply-container">
                            <div className="input-wrapper">
                              <input
                                type="text"
                                className="reply-input-text-field"
                                onChange={(event) => {
                                  setReply(event.target.value);
                                }}
                                placeholder="Type your reply..."
                                value={reply}
                              />
                              <button
                                onClick={() => {
                                  handleSend(item._id);
                                }}
                                className="send-button"
                              >
                                <SendIcon />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="cancel-button"
                              >
                                <CancelIcon />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <span
                          className="reply-button"
                          onClick={() => showReplyInput(item._id)}
                        >
                          reply
                        </span>
                      )}

                      {replies_id === item._id ? (
                        <div className="replies">
                          {item.replies.map((reply) => (
                            <div className="individual-reply" key={reply._id}>
                              <img
                                className="profile-pic-of-person-who-replied"
                                src={reply.posted_by.Photo}
                                alt="replier-profile-pic"
                              />
                              <div className="reply-details">
                                <span className="user-name">
                                  {reply.posted_by.userName}
                                </span>
                                <span className="reply-body">{reply.body}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
