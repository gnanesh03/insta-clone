import styles from "./Container.module.css";
import Item from "../Item/Item";

const Container = ({ items }) => {
  return (
    <div className={styles.root}>
      {items.map((e) => {
        return (
          <div className={styles.item} key={e._id}>
            <Item post={e} />{" "}
          </div>
        );
      })}
    </div>
  );
};

export default Container;
