import logo from "./logo.svg";
import React, { createContext, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Profie from "./screens/Profie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Createpost from "./screens/Createpost";
import { LoginContext } from "./context/LoginContext";
import Modal from "./components/Modal";
import UserProfie from "./components/UserProfile";
import MyFolliwngPost from "./screens/MyFollowingPost";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ProtectedRoutes from "./components/wrappers/ProtectedRoutes";
import { QueryClient, QueryClientProvider } from "react-query";
import "@fontsource/roboto"; // Defaults to weight 400
import HomePostsContextProvider from "./context/HomePostsContext";
import TrendingPostsContextProvider from "./context/TrendingPostsContext";
import PostDetails from "./components/Post/IndividualPostPage/PostDetails";
import TrendingPosts from "./screens/TrendingPosts";
import Search from "./screens/Search";

const queryClient = new QueryClient();

function App() {
  const [userLogin, setUserLogin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <LoginContext.Provider value={{ setUserLogin, setModalOpen }}>
            <HomePostsContextProvider>
              <TrendingPostsContextProvider>
                <BrowserRouter>
                  <Navbar login={userLogin} />

                  <Routes>
                    <Route element={<ProtectedRoutes />}>
                      <Route path="/" element={<Home />}></Route>
                      <Route exact path="/profile" element={<Profie />}></Route>
                      <Route
                        path="/createPost"
                        element={<Createpost />}
                      ></Route>
                      <Route
                        path="/profile/:userid"
                        element={<UserProfie />}
                      ></Route>
                      <Route
                        path="/profile/:user_id/:post_id"
                        element={<PostDetails />}
                      />

                      <Route
                        path="/followingpost"
                        element={<MyFolliwngPost />}
                      ></Route>

                      <Route
                        path="/trending-posts"
                        element={<TrendingPosts />}
                      />

                      <Route path="/search" element={<Search />} />
                    </Route>

                    <Route path="/signup" element={<SignUp />}></Route>
                    <Route path="/signin" element={<SignIn />}></Route>
                  </Routes>
                  <ToastContainer theme="dark" />

                  {modalOpen && <Modal setModalOpen={setModalOpen}></Modal>}
                </BrowserRouter>
              </TrendingPostsContextProvider>
            </HomePostsContextProvider>
          </LoginContext.Provider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
