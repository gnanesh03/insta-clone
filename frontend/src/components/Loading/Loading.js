import spinner_svg from "../../img/tube-spinner.svg";
import styles from "./Loading.module.css";

export default function Loading() {
  return (
    <div className={styles.root}>
      <img className={styles.content} src={spinner_svg} />
    </div>
  );
}
