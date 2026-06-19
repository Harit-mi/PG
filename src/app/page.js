"use client";

import { Building2 } from "lucide-react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <main className={`${styles.main} glass`}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Building2 size={48} className={styles.logo} />
          </div>
          <h1 className={styles.title}>PG Owner Portal</h1>
          <p className={styles.subtitle}>
            Manage your paying guest properties, tenants, and finances securely.
          </p>
        </div>

        <div className={styles.authContainer}>
          <button onClick={() => router.push("/dashboard")} className={styles.primaryButton}>
            Enter Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
