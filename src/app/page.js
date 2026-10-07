import Link from "next/link";
import { ArrowRight, MessageSquareText, BedDouble, Terminal } from "lucide-react";
import styles from "./page.module.css";
import MarketingNavbar from "@/components/MarketingNavbar";

export const metadata = {
  title: "PGPlus // Next-Gen PGPlus",
  description: "Eliminate empty beds, automate WhatsApp rent collections, and manage multiple branches from a single dashboard.",
};

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <MarketingNavbar />

      <main className={styles.hero}>
        <div className={styles.badge}>Next-Gen PGPlus</div>
        <h1 className={styles.title}>
          Run your PG like a modern tech company.
        </h1>
        <p className={styles.subtitle}>
          Eliminate empty beds, automate WhatsApp rent collections, and manage multiple branches from a single, minimalist dashboard.
        </p>
        <div className={styles.ctaGroup}>
          <Link href="/pricing" className={styles.btnLarge} style={{ textDecoration: 'none' }}>
            View Pricing <ArrowRight size={18} />
          </Link>
          <Link href="/features" className={styles.btnLargeSecondary} style={{ textDecoration: 'none' }}>
            Explore Features
          </Link>
        </div>
      </main>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <MessageSquareText size={24} />
          </div>
          <h3 className={styles.featureTitle}>WhatsApp Rent Collection</h3>
          <p className={styles.featureText}>
            Send automated rent reminders with pre-filled UPI links directly to tenants' WhatsApp. 85% of dues cleared in 24 hours.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <BedDouble size={24} />
          </div>
          <h3 className={styles.featureTitle}>Visual Bed Management</h3>
          <p className={styles.featureText}>
            Assign beds, track vacancies, and manage check-ins with an intuitive, drag-and-drop visual floor plan.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Terminal size={24} />
          </div>
          <h3 className={styles.featureTitle}>AI-Powered Copilot</h3>
          <p className={styles.featureText}>
            Draft polite notices, resolve disputes, and analyze your financial metrics instantly using Gemini AI.
          </p>
        </div>
      </section>
    </div>
  );
}
