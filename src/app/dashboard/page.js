import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/app/actions";
import DashboardClient from "./DashboardClient";
import FAIcon from "@/components/FAIcon";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser();
  const orgId = user?.user_metadata?.organization_id || 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0';

  // Read activePropertyId cookie (could be 'all' or specific property id)
  const cookiePropertyId = (await cookies()).get('activePropertyId')?.value || 'all';

  // 1. Fetch properties using authenticated server client
  const { data: properties, error: propertiesErr } = await supabase
    .from('properties')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: true });

  const activeProperties = properties || [];
  const propertyIds = activeProperties.map(p => p.id);

  let rooms = [];
  let tenants = [];
  let transactions = [];
  let complaints = [];
  let leaves = [];
  let visitors = [];
  let employees = [];
  let assets = [];
  let subscription = null;

  if (propertyIds.length > 0) {
    // 2. Fetch operational datasets concurrently using authenticated session
    const [
      { data: roomsData },
      { data: tenantsData },
      { data: txData },
      { data: complaintsData },
      { data: leavesData },
      { data: visitorsData },
      { data: employeesData },
      { data: assetsData },
      { data: subsData }
    ] = await Promise.all([
      supabase.from('rooms').select('*').in('property_id', propertyIds),
      supabase.from('tenants').select('*').in('property_id', propertyIds),
      supabase.from('transactions').select('*').in('property_id', propertyIds).order('date', { ascending: false }),
      supabase.from('complaints').select('*').in('property_id', propertyIds).order('created_at', { ascending: false }),
      supabase.from('leaves').select('*').in('property_id', propertyIds).order('created_at', { ascending: false }),
      supabase.from('visitors').select('*').in('property_id', propertyIds).order('created_at', { ascending: false }),
      supabase.from('employees').select('*').in('property_id', propertyIds),
      supabase.from('room_assets').select('*').in('property_id', propertyIds),
      supabase.from('subscriptions').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(1)
    ]);

    rooms = roomsData || [];
    tenants = tenantsData || [];
    transactions = txData || [];
    complaints = complaintsData || [];
    leaves = leavesData || [];
    visitors = visitorsData || [];
    employees = employeesData || [];
    assets = assetsData || [];
    subscription = subsData?.[0] || null;
  }

  return (
    <div className={styles.container}>
      {activeProperties.length === 0 ? (
        <div style={{ 
          background: 'var(--surface)', 
          padding: '4rem 2rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border)', 
          textAlign: 'center', 
          color: 'var(--text-muted)',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '10px', 
            background: 'var(--surface-muted)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.25rem',
            color: 'var(--primary)' 
          }}>
            <FAIcon icon="building" style={{ fontSize: '20px' }} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 0.5rem' }}>
            No Outlets Provisioned Yet
          </h3>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem' }}>
            Activate your first PG outlet from the sidebar selector to start monitoring real-time occupancy and rent collections.
          </p>
        </div>
      ) : (
        <DashboardClient
          properties={activeProperties}
          rooms={rooms}
          tenants={tenants}
          transactions={transactions}
          complaints={complaints}
          leaves={leaves}
          visitors={visitors}
          employees={employees}
          assets={assets}
          subscription={subscription}
          cookiePropertyId={cookiePropertyId}
        />
      )}
    </div>
  );
}
