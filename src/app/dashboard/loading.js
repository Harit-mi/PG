import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.headerSkeleton}>
        <div className={styles.titleSkeleton}></div>
        <div className={styles.subtitleSkeleton}></div>
      </div>
      
      <div className={styles.gridSkeleton}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`${styles.cardSkeleton} glass`}></div>
        ))}
      </div>
      
      <div className={`${styles.tableSkeleton} glass`}></div>
    </div>
  );
}
