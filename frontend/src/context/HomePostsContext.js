import React, { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";

export const HomePostsContext = createContext();

const HomePostsContextProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSkip, setPageSkip] = useState(0);
  const limit = 3; // Number of posts to fetch per request

  const fetchPosts = async () => {
    if (isLoading || !hasMore) return; // Avoid duplicate requests or over-fetching

    setIsLoading(true);

    try {
      const result = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/allposts`,
        {
          params: { limit, skip: pageSkip },
          withCredentials: true,
        }
      );

      const newPosts = result.data.posts;
      setPosts((prevPosts) => [
        ...prevPosts,
        ...newPosts.filter(
          (post) => !prevPosts.some((prevPost) => prevPost._id === post._id)
        ),
      ]);

      setHasMore(result.data.has_more);
      setPageSkip((prevSkip) => prevSkip + limit);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HomePostsContext.Provider
      value={{ posts, fetchPosts, hasMore, isLoading, setPosts }}
    >
      {children}
    </HomePostsContext.Provider>
  );
};

export default HomePostsContextProvider;
