import { createClient } from "@/utils/supabase/server";
import { getAuthenticatedUser } from "@/app/actions";
import OutletsClient from "./OutletsClient";

export const revalidate = 0;

export default async function OutletsManagementPage() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser();
  const orgId = user?.user_metadata?.organization_id || 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0';

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
    .is("assigned_property_id", null);

  return (
    <div style={{ padding: "2rem" }}>
      <OutletsClient 
        initialProperties={properties || []}
        initialSlots={slots || []}
        initialUnassignedSlots={unassignedSlots || []}
        organizationId={orgId}
      />
    </div>
  );
}
