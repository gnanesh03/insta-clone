import { useEffect, useState } from "react";
import HorizontalSlider from "../PostContentSlider";
import styles from "./PostDetails.module.css";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function PostDetails() {
  const [post_details, setPostDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [reply, setReply] = useState("");
  const [reply_id, setReplyId] = useState(null);
  const [replies_id, setRepliesId] = useState("");

  const { post_id } = useParams();

  // to get the post details on page render
  useEffect(() => {
    console.log("individual post page mounted");
    console.log("HERE", post_id);
    fetchData();
  }, []);

  const fetchData = async () => {
    const url = process.env.REACT_APP_BACKEND_URL + `/single-post/${post_id}`;
    try {
      const result = await axios.get(url, { withCredentials: true });
      console.log(result.data);
      setPostDetails(result.data.post_data);
      setComments(result.data.comments_data);
    } catch (error) {
      console.log(error);
    }
  };

  const showReplyInput = (comment_id) => {
    setReplyId(comment_id);
  };

  const handleSend = async (comment_id) => {
    console.log("sending...");

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
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.image}>
          {post_details && (
            <HorizontalSlider items={post_details?.photo} height="85vh" />
          )}
        </div>
        <div className={styles.comments_container}>
          <div className={styles.header}>
            <img
              className={styles.profile_pic_of_person_who_posted}
              src={post_details?.postedBy.Photo}
              alt="poster-profile-pic"
            />
            <div>
              <span className={styles.user_name}>
                {post_details?.postedBy.userName}
              </span>
              <span>{post_details?.body}</span>
            </div>
          </div>
          <hr className={styles.comments_divider} />
          <div className={styles.all_comments}>
            {comments && comments.length > 0
              ? comments.map((item) => (
                  <div className={styles.individual_comment} key={item._id}>
                    <img
                      className={styles.profile_pic_of_person_who_commented}
                      src={item.posted_by.Photo}
                      alt="commenter-profile-pic"
                    />
                    <div className={styles.username_and_comment}>
                      <span className={styles.user_name}>
                        {item.posted_by.user_name}
                      </span>
                      <span> {item.body}</span>
                      <br />
                      {item.replies && item.replies.length > 0 ? (
                        <span
                          className={styles.view_replies}
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
                          <div className={styles.reply_container}>
                            <div className={styles.input_wrapper}>
                              <input
                                type="text"
                                className={styles.reply_input_text_field}
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
                                className={styles.send_button}
                              >
                                <SendIcon />
                              </button>
                              <button
                                onClick={handleCancel}
                                className={styles.cancel_button}
                              >
                                <CancelIcon />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <span
                          className={styles.reply_button}
                          onClick={() => showReplyInput(item._id)}
                        >
                          reply
                        </span>
                      )}

                      {replies_id === item._id ? (
                        <div className={styles.replies}>
                          {item.replies.map((reply) => (
                            <div
                              className={styles.individual_reply}
                              key={reply._id}
                            >
                              <img
                                className={
                                  styles.profile_pic_of_person_who_replied
                                }
                                src={reply.posted_by.Photo}
                                alt="replier-profile-pic"
                              />
                              <div className={styles.reply_details}>
                                <span className={styles.user_name}>
                                  {reply.posted_by.userName}
                                </span>
                                <span className={styles.reply_body}>
                                  {reply.body}
                                </span>
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
