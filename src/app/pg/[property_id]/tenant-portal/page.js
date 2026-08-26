import { createClient } from "@/utils/supabase/server";
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
  const supabase = await createClient();
  const { property_id } = await params;
  const today = getTodayString();
  const currentWeekStart = getMondayOfCurrentWeek();

  // 1. Fetch property info
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', property_id)
    .single();

  // 2. Fetch food menu for today
  const { data: menuData } = await supabase
    .from('food_menus')
    .select('*')
    .eq('property_id', property_id)
    .eq('week_start_date', currentWeekStart)
    .eq('day_of_week', today)
    .single();

  // 3. Fetch payment methods for UPI/bank details
  const { data: paymentMethods } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('property_id', property_id)
    .eq('is_active', true);

  return (
    <TenantPortalClient
      property={property}
      propertyId={property_id}
      todayMenu={menuData}
      paymentMethods={paymentMethods || []}
    />
  );
}
