import React, { createContext, useState } from "react";
import axios from "axios";

export const HomePostsContext = createContext();

const HomePostsContextProvider = ({ children }) => {
  const [home_posts, setHomePosts] = useState([]);
  const [skip, setSkip] = useState(0); // State to track skip value

  const value = { home_posts, setHomePosts, skip, setSkip };

  return (
    <HomePostsContext.Provider value={value}>
      {children}
    </HomePostsContext.Provider>
  );
};

export default HomePostsContextProvider;
