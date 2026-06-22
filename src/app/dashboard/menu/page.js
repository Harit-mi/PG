import { supabase } from "@/utils/supabase";
import { cookies } from "next/headers";
import MenuGrid from "@/components/MenuGrid";
import { Utensils } from "lucide-react";

export const revalidate = 0;

function getMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default async function MenuPage() {
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  const currentWeekStart = getMondayOfCurrentWeek();
  
  let query = supabase
    .from('food_menus')
    .select('*')
    .eq('week_start_date', currentWeekStart);

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }
  
  const { data: initialMenus, error } = await query;
  
  if (error) console.error("Error fetching menu:", error);

  if (!propertyId || propertyId === 'all') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <Utensils size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Select a Property</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
          Food Menus are property-specific. Please select a specific PG from the dropdown in the sidebar to manage its menu.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', 
            background: 'linear-gradient(135deg, var(--text-primary), var(--text-muted))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Food Menu
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage weekly meals for your tenants.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
          <Utensils size={18} />
          <span>Week of {new Date(currentWeekStart).toLocaleDateString()}</span>
        </div>
      </div>

      <MenuGrid initialMenus={initialMenus || []} weekStartDate={currentWeekStart} />
    </div>
  );
}
