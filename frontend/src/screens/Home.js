import React, { useContext, useEffect, useState, useRef } from "react";
import { HomePostsContext } from "../context/HomePostsContext";
import PostBox from "../components/Post/PostBox";
import axios from "axios";
import { toast } from "react-toastify";
import spinner_svg from "../img/tube-spinner.svg";

export default function Home() {
  const [isFetching, setIsFetching] = useState(false); // Local state for isFetching
  const { home_posts, skip, setHomePosts, setSkip } =
    useContext(HomePostsContext);

  const skipRef = useRef(skip); // To track the latest skip value
  const isFetchingRef = useRef(isFetching); // To track the latest isFetching value

  const fetchHomePosts = (skip_value) => {
    console.log("skip value inside parent", skip_value);

    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/allposts`, {
        params: { limit: 3, skip: skip_value },
        withCredentials: true,
      })
      .then((response) => {
        const result = response.data;
        if (result && result.length > 0) {
          console.log("response inside parent", result);
          setHomePosts((prevData) => [...prevData, ...result]); // Append new posts
          setSkip((prevSkip) => prevSkip + 3); // Increment skip
        }
        setIsFetching(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Update refs whenever the state changes
  useEffect(() => {
    skipRef.current = skip;
    isFetchingRef.current = isFetching;
  }, [skip, isFetching]);

  const handleScroll = () => {
    if (
      document.documentElement.clientHeight + window.pageYOffset >=
      document.documentElement.scrollHeight - 50 // Add a buffer
    ) {
      console.log(isFetchingRef.current);
      if (!isFetchingRef.current) {
        console.log("handle scroll fetching");
        fetchHomePosts(skipRef.current); // Pass the current skip value from the ref
        setIsFetching(true); // Set fetching state to true
      }
    }
  };

  useEffect(() => {
    fetchHomePosts(skip);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="home">
      {home_posts.length > 0 ? (
        home_posts.map((post) => (
          <PostBox key={post._id} post={post} height="300px" />
        ))
      ) : (
        <img className="home-page-loading-svg" src={spinner_svg} />
      )}
      {isFetching && (
        <img className="getting-more-posts-loading" src={spinner_svg} />
      )}
    </div>
  );
}
