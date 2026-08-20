import { supabase } from "@/utils/supabase";
import TenantPortalClient from "./TenantPortalClient";

export const revalidate = 0;

function getTodayString() {
  const d = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[d.getDay()];
}

function getMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default async function TenantPortalPage({ params }) {
  const { property_id } = await params;
  const today = getTodayString();
  const currentWeekStart = getMondayOfCurrentWeek();

  // 1. Fetch property info
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', property_id)
    .single();

  // 2. Fetch today's menu
  const { data: menuData } = await supabase
    .from('food_menus')
    .select('*')
    .eq('property_id', property_id)
    .eq('week_start_date', currentWeekStart)
    .eq('day_of_week', today)
    .single();

  // 3. Fetch latest notices
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .eq('property_id', property_id)
    .order('created_at', { ascending: false })
    .limit(5);

  // 4. Fetch tenants for validation
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .eq('property_id', property_id)
    .eq('status', 'Active');

  // 5. Fetch leaves
  const { data: leaves } = await supabase
    .from('leaves')
    .select('*')
    .eq('property_id', property_id)
    .order('created_at', { ascending: false });

  // 6. Fetch transactions / dues for tenant
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('property_id', property_id)
    .order('date', { ascending: false });

  return (
    <TenantPortalClient
      propertyId={property_id}
      propertyName={property?.name || "Hostel PG"}
      todayMenu={menuData}
      notices={notices || []}
      tenants={tenants || []}
      leaves={leaves || []}
      transactions={transactions || []}
    />
  );
}
