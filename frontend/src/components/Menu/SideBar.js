import styles from "./SideBar.module.css";
import HomeIcon from "@mui/icons-material/Home";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { Link } from "react-router-dom";

const SideBar = ({}) => {
  return (
    <div className={styles.root}>
      <div className={styles.top_section}>
        <Link className={styles.link} to="/">
          <HomeIcon /> <label>Home</label>
        </Link>
        <Link className={styles.link} to="/search">
          <SearchOutlinedIcon /> <label>Search</label>
        </Link>
        <Link className={styles.link} to="/trending-posts">
          <TrendingUpIcon /> <label>Trending</label>
        </Link>
        <Link className={styles.link} to="">
          <SmsOutlinedIcon /> <label>Messages</label>
        </Link>
      </div>

      <div className={styles.bottom_section}>
        <Link className={styles.link} to="/createPost">
          <AddCircleOutlineOutlinedIcon /> <label>Create</label>
        </Link>
        <Link className={styles.link} to="">
          <SettingsOutlinedIcon /> <label>Settings</label>
        </Link>
        <Link className={styles.link} to="/profile">
          <AccountCircleIcon /> <label>Profile</label>
        </Link>

        <div className={styles.link}>
          <MenuOutlinedIcon /> <label>More</label>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
