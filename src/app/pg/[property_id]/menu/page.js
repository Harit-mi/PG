import { supabase } from "@/utils/supabase";
import styles from "./page.module.css";
import { Utensils, CalendarDays, Coffee, Sunrise, Sunset, Moon } from "lucide-react";

export const revalidate = 0;

export default async function PublicMenuPage({ params }) {
  const propertyId = params.property_id;
  
  // Get current week's Monday date string
  const getMonday = (d) => {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6: 1); // adjust when day is sunday
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };
  
  const currentWeekStart = getMonday(new Date());

  // Fetch the menu for this property and current week
  const { data: menuItems, error } = await supabase
    .from('food_menus')
    .select('*')
    .eq('property_id', propertyId)
    .eq('week_start_date', currentWeekStart);

  // Fetch property details for branding
  const { data: property } = await supabase
    .from('properties')
    .select('name')
    .eq('id', propertyId)
    .single();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getDayMenu = (day) => {
    if (!menuItems) return null;
    return menuItems.find(m => m.day_of_week === day);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.branding}>
          <Utensils size={28} className={styles.icon} />
          <h1>{property?.name || "PG Property"}</h1>
        </div>
        <p className={styles.subtitle}>Weekly Food Menu</p>
        <div className={styles.dateBadge}>
          <CalendarDays size={16} /> Week of {new Date(currentWeekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      <div className={styles.menuList}>
        {daysOfWeek.map(day => {
          const dayMenu = getDayMenu(day);
          const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
          
          return (
            <div key={day} className={`${styles.dayCard} ${isToday ? styles.todayCard : ''} glass`}>
              <div className={styles.dayHeader}>
                <h2>{day}</h2>
                {isToday && <span className={styles.todayBadge}>Today</span>}
              </div>
              
              <div className={styles.mealsGrid}>
                <div className={styles.mealBlock}>
                  <div className={styles.mealTitle}>
                    <Sunrise size={16} /> Breakfast
                  </div>
                  <p>{dayMenu?.breakfast || "Not specified"}</p>
                </div>
                
                <div className={styles.mealBlock}>
                  <div className={styles.mealTitle}>
                    <Coffee size={16} /> Lunch
                  </div>
                  <p>{dayMenu?.lunch || "Not specified"}</p>
                </div>
                
                <div className={styles.mealBlock}>
                  <div className={styles.mealTitle}>
                    <Sunset size={16} /> Snacks
                  </div>
                  <p>{dayMenu?.evening_snack || "Not specified"}</p>
                </div>
                
                <div className={styles.mealBlock}>
                  <div className={styles.mealTitle}>
                    <Moon size={16} /> Dinner
                  </div>
                  <p>{dayMenu?.dinner || "Not specified"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <footer className={styles.footer}>
        <p>Menu is subject to change based on availability.</p>
        <p>Powered by RestroIQ</p>
      </footer>
    </div>
  );
}
