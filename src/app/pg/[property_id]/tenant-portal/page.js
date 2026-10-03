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

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(property_id)) {
    return <TenantPortalClient propertyId={property_id} propertyName="Demo PG" todayMenu={null} weeklyMenu={[]} paymentMethods={[]} notices={[]} />;
  }

  // 1. Fetch property info
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', property_id)
    .single();

  // 2. Fetch food menu for the week (with fallback to latest published menu)
  let { data: weeklyMenu } = await supabase
    .from('food_menus')
    .select('*')
    .eq('property_id', property_id)
    .eq('week_start_date', currentWeekStart);

  if (!weeklyMenu || weeklyMenu.length === 0) {
    const { data: latestMenu } = await supabase
      .from('food_menus')
      .select('*')
      .eq('property_id', property_id)
      .order('week_start_date', { ascending: false });

    if (latestMenu && latestMenu.length > 0) {
      const latestDate = latestMenu[0].week_start_date;
      weeklyMenu = latestMenu.filter(m => m.week_start_date === latestDate);
    }
  }

  // If still empty, check for any menu items for this property or general
  if (!weeklyMenu || weeklyMenu.length === 0) {
    const { data: fallbackAny } = await supabase
      .from('food_menus')
      .select('*')
      .or(`property_id.eq.${property_id},property_id.is.null`)
      .limit(7);
    weeklyMenu = fallbackAny || [];
  }

  const menuData = weeklyMenu?.find(m => m.day_of_week === today) || weeklyMenu?.[0];

  // 3. Fetch payment methods for UPI/bank details
  const { data: paymentMethods } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('property_id', property_id)
    .eq('is_active', true);

  // 4. Fetch notices
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .eq('property_id', property_id)
    .order('created_at', { ascending: false });

  return (
    <TenantPortalClient
      property={property}
      propertyId={property_id}
      propertyName={property?.name || "Hostel PG"}
      todayMenu={menuData}
      weeklyMenu={weeklyMenu || []}
      paymentMethods={paymentMethods || []}
      notices={notices || []}
    />
  );
}
