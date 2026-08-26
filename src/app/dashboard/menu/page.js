import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import MenuGrid from "@/components/MenuGrid";
import { Utensils } from "lucide-react";

export const revalidate = 0;

function getMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default async function MenuPage() {
  const supabase = await createClient();
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  const currentWeekStart = getMondayOfCurrentWeek();
  
  let query = supabase
    .from('food_menus')
    .select('*')
    .eq('week_start_date', currentWeekStart);

  if (propertyId && propertyId !== 'all') {
    query = query.eq('property_id', propertyId);
  }

  const { data: menuItems, error } = await query;
  if (error) console.error("Error fetching food menu:", error);

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Utensils style={{ color: "var(--accent)" }} /> Weekly Food Menu
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Configure daily meal items for breakfast, lunch, and dinner.
          </p>
        </div>
      </div>

      <MenuGrid initialMenuItems={menuItems || []} propertyId={propertyId} weekStartDate={currentWeekStart} />
    </div>
  );
}
