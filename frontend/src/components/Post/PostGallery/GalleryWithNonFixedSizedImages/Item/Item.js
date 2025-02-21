import styles from "./Item.module.css";
import { Card } from "@mui/material";
const Item = ({ post }) => {
  return <img className={styles.image} src={post.photo[0]} />;
};

export default Item;
