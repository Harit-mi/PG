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

  let { data: menuItems } = await supabase
    .from('food_menus')
    .select('*')
    .eq('property_id', propertyId)
    .eq('week_start_date', currentWeekStart);

  if (!menuItems || menuItems.length === 0) {
    const { data: latestMenu } = await supabase
      .from('food_menus')
      .select('*')
      .eq('property_id', propertyId)
      .order('week_start_date', { ascending: false });

    if (latestMenu && latestMenu.length > 0) {
      const latestDate = latestMenu[0].week_start_date;
      menuItems = latestMenu.filter(m => m.week_start_date === latestDate);
    }
  }

  if (!menuItems || menuItems.length === 0) {
    const { data: fallbackAny } = await supabase
      .from('food_menus')
      .select('*')
      .or(`property_id.eq.${propertyId},property_id.is.null`)
      .limit(7);
    menuItems = fallbackAny || [];
  }

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
                  <Sunrise size={16} style={{ color: "var(--warning)" }} />
                  <span>Breakfast</span>
                </div>
                <div className={styles.mealText}>{dayMenu.breakfast || "Not specified"}</div>
              </div>

              <div className={styles.mealSection}>
                <div className={styles.mealHeader}>
                  <Sunset size={16} style={{ color: "var(--danger)" }} />
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
