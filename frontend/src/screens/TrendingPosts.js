import React, { useContext, useRef, useEffect } from "react";
import { TrendingPostsContext } from "../context/TrendingPostsContext";
import PostBox from "../components/Post/PostBox";
import spinner_svg from "../img/tube-spinner.svg";
import styles from "./TrendingPosts.module.css";

export default function TrendingPosts() {
  const { posts, fetchPosts, hasMore, isLoading, setPosts } =
    useContext(TrendingPostsContext);
  const observer_ref = useRef();

  // Observer to trigger fetching the next page
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchPosts();
        }
      },
      { threshold: 0.7 }
    );

    if (observer_ref.current) {
      observer.observe(observer_ref.current);
    }

    return () => {
      if (observer_ref.current) {
        observer.unobserve(observer_ref.current);
      }
    };
  }, [hasMore, isLoading, fetchPosts]);

  const updatePost = (post) => {
    if (posts.length > 0) {
      const updated_posts = posts.map((e) => {
        if (e._id === post._id) {
          return post;
        } else {
          return e;
        }
      });
      setPosts(updated_posts);
    }
  };

  return (
    <div className={styles.root}>
      {isLoading && posts.length === 0 ? (
        <img className="home-page-loading-svg" src={spinner_svg} />
      ) : (
        posts.map((post) => (
          <PostBox
            key={post._id}
            post={post}
            height="300px"
            updatePosts={updatePost}
          />
        ))
      )}

      {/* Observer element to trigger infinite loading */}
      <div ref={observer_ref} style={{ height: "1px" }}></div>

      {isLoading && posts.length > 0 && (
        <img className="getting-more-posts-loading" src={spinner_svg} />
      )}
    </div>
  );
}
