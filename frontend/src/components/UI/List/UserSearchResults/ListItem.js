import { useNavigate } from "react-router-dom";
import styles from "./ListItem.module.css";

const ListItem = ({ user }) => {
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate(`/profile/${user._id}`);
  };

  return (
    <div className={styles.root} onClick={goToProfile}>
      <img src={user.Photo} />
      <div className={styles.second_column}>
        <h4> {user.name} </h4>
        <h5>@{user.userName}</h5>
      </div>
    </div>
  );
};

export default ListItem;
