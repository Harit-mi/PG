import { createClient } from "@/utils/supabase/server";
import styles from "./page.module.css";
import { Utensils, CalendarDays, Coffee, Sunrise, Sunset, Moon } from "lucide-react";

export const revalidate = 0;

export default async function PublicMenuPage({ params }) {
  const supabase = await createClient();
  const propertyId = (await params).property_id;
  
  const getMonday = (d) => {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6: 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };
  
  const currentWeekStart = getMonday(new Date());

  const { data: menuItems, error } = await supabase
    .from('food_menus')
    .select('*')
    .eq('property_id', propertyId)
    .eq('week_start_date', currentWeekStart);

  const items = menuItems || [];

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Utensils style={{ color: "var(--accent)" }} size={28} />
          <h1 className={styles.title}>Weekly Dining Menu</h1>
        </div>
        <p className={styles.subtitle}>Fresh meal schedule updated for week starting {currentWeekStart}</p>
      </div>

      <div className={styles.grid}>
        {daysOfWeek.map((day) => {
          const dayMenu = items.find((item) => item.day_of_week === day) || {};
          return (
            <div key={day} className={`${styles.dayCard} glass`}>
              <h3 className={styles.dayTitle}>
                <CalendarDays size={18} style={{ display: "inline", marginRight: "6px" }} />
                {day}
              </h3>

              <div className={styles.mealSection}>
                <div className={styles.mealHeader}>
                  <Sunrise size={16} style={{ color: "#F59E0B" }} />
                  <span>Breakfast</span>
                </div>
                <div className={styles.mealText}>{dayMenu.breakfast || "Not specified"}</div>
              </div>

              <div className={styles.mealSection}>
                <div className={styles.mealHeader}>
                  <Sunset size={16} style={{ color: "#EF4444" }} />
                  <span>Lunch</span>
                </div>
                <div className={styles.mealText}>{dayMenu.lunch || "Not specified"}</div>
              </div>

              <div className={styles.mealSection}>
                <div className={styles.mealHeader}>
                  <Coffee size={16} style={{ color: "#8B5CF6" }} />
                  <span>Snacks</span>
                </div>
                <div className={styles.mealText}>{dayMenu.snacks || "Not specified"}</div>
              </div>

              <div className={styles.mealSection}>
                <div className={styles.mealHeader}>
                  <Moon size={16} style={{ color: "#3B82F6" }} />
                  <span>Dinner</span>
                </div>
                <div className={styles.mealText}>{dayMenu.dinner || "Not specified"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
