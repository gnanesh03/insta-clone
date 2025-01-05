import styles from "./GallerItem.module.css";

export default function GalleryItem({ item }) {
  let image_src = item.photo[0];

  return (
    <div className={styles.item}>
      {isVideoFormat(image_src) ? (
        <img alt="video.." className={styles.blank_image} />
      ) : (
        <img src={image_src} className={styles.image} />
      )}
    </div>
  );
}

// Utility function to determine if a URL is a video
const isVideoFormat = (url) => {
  const [baseUrl] = url.split("?"); // Remove query parameters
  const fileName = baseUrl.substring(baseUrl.lastIndexOf("/") + 1); // Get the file name
  const videoFormats = ["mp4", "mkv", "mov", "avi", "webm"];
  return videoFormats.some((format) => fileName.endsWith(format)); // Check if it ends with a video format
};
