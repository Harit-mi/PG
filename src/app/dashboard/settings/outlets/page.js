import { supabase } from "@/utils/supabase";
import OutletsClient from "./OutletsClient";

export const revalidate = 0;

export default async function OutletsManagementPage() {
  const orgId = 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0';

  // 1. Fetch properties
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });

  // 2. Fetch slots mapped to these properties
  const propertyIds = properties?.map(p => p.id) || [];
  const { data: slots } = propertyIds.length > 0 
    ? await supabase.from("outlet_slots").select("*").in("assigned_property_id", propertyIds)
    : { data: [] };

  // 3. Fetch unassigned slots
  const { data: unassignedSlots } = await supabase
    .from("outlet_slots")
    .select("*")
    .eq("organization_id", orgId)
    .eq("status", "Unassigned");

  // Mix slot details into properties list
  const outlets = (properties || []).map(p => {
    const slot = slots?.find(s => s.assigned_property_id === p.id);
    return {
      ...p,
      plan_name: slot?.plan_name || 'Professional',
      slot_status: slot?.status || 'Assigned'
    };
  });

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>My Property Outlets</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review subscriptions, handle independent renewals, or deactivate locations.</p>
      </div>

      <OutletsClient initialOutlets={outlets} unassignedSlots={unassignedSlots || []} />

    </div>
  );
}
