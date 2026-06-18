import styles from "./page.module.css";
import { Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={`${styles.main} glass`}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Building2 size={48} className={styles.logo} />
          </div>
          <h1 className={styles.title}>PG Owner Portal</h1>
          <p className={styles.subtitle}>
            Manage your paying guest properties, tenants, and finances in one place.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton}>Sign In with Phone</button>
        </div>
      </main>
    </div>
  );
}
