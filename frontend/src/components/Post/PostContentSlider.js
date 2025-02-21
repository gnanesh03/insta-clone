import React, { useState } from "react";
import "./PostContentSlider.css";

const HorizontalSlider = ({ items, height }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transition_direction, setTransitionDirection] = useState("");

  if (!items || items.length === 0) {
    return null; // Fix: Ensures hooks are called before any return
  }

  const handleNext = () => {
    setTransitionDirection("next");
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setTransitionDirection("");
    }, 400); // Match the transition duration
  };

  const handlePrevious = () => {
    setTransitionDirection("previous");
    setTimeout(() => {
      setCurrentIndex((prev) => prev - 1);
      setTransitionDirection("");
    }, 400); // Match the transition duration
  };

  return (
    <div
      className="post-content-slider-container"
      style={{ height: `${height}` }}
    >
      <div className="content-wrapper">
        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <button className=" left-button" onClick={handlePrevious}>
            {"<"}
          </button>
        )}

        {/* Current Item */}
        <div className={`media-container ${transition_direction}`}>
          {isVideoFormat(items[currentIndex]) ? (
            <video
              src={items[currentIndex]}
              controls
              autoPlay
              className="media"
            />
          ) : (
            <img
              src={items[currentIndex]}
              alt={`item-${currentIndex}`}
              className="media"
            />
          )}
        </div>

        {currentIndex < items.length - 1 && (
          <button className="right-button" onClick={handleNext}>
            {">"}
          </button>
        )}

        {/* dots to represent number of pics present */}
        <div className="dots-container">
          {items.length > 1 &&
            items.map((e, i) => {
              return (
                <span
                  key={i}
                  className={
                    currentIndex == i ? "highlighted-dot" : "other-dots"
                  }
                ></span>
              );
            })}
        </div>
      </div>
    </div>
  );
};

// Utility function to determine if a URL is a video
const isVideoFormat = (url) => {
  const [baseUrl] = url.split("?"); // Remove query parameters
  const fileName = baseUrl.substring(baseUrl.lastIndexOf("/") + 1); // Get the file name
  const videoFormats = ["mp4", "mkv", "mov", "avi", "webm"];
  return videoFormats.some((format) => fileName.endsWith(format)); // Check if it ends with a video format
};

export default HorizontalSlider;
