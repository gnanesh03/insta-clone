import styles from "./List.module.css";
import ListItem from "./ListItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const List = ({ users }) => {
  if (users.length > 0) {
    return (
      <div className={styles.root}>
        <Card sx={{ boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.2)" }}>
          <CardContent sx={{ overflowY: " scroll", maxHeight: "65vh" }}>
            {users.map((user) => {
              return <ListItem user={user} key={user._id} />;
            })}
          </CardContent>
        </Card>
      </div>
    );
  }
};
export default List;
