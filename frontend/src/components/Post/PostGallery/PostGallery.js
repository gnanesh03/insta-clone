import GalleryItem from "./GalleryItem/GalleryItem";
import styles from "./PostGallery.module.css";
export default function PostGallery({ items }) {
  return (
    <div className={styles.post_gallery_container}>
      {items && items.length > 0
        ? items.map((item, index) => {
            return <GalleryItem key={index} item={item} />;
          })
        : null}
    </div>
  );
}
