import styles from "./CompanyLogo.module.css";
import logo from "../../img/logo.png";

export default function CompanyLogo() {
  return <img className={styles.logo_img} src={logo} />;
}
