import styles from "./page.module.css";
import { supabase } from "@/utils/supabase";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/app/actions";
import DashboardClient from "./DashboardClient";
import FAIcon from "@/components/FAIcon";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  const orgId = user?.user_metadata?.organization_id || 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0';

  // Read activePropertyId cookie (could be 'all' or specific property id)
  const cookiePropertyId = (await cookies()).get('activePropertyId')?.value || 'all';

  // 1. Fetch properties
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
    // 2. Fetch all other operational datasets concurrently for the organization's properties
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
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          <FAIcon icon="chart-pie" /> Consolidate Summary
        </div>
        <h1 className={styles.title}>Multi-Outlet Owner Dashboard</h1>
        <p className={styles.subtitle}>
          Consolidated business statistics, collections, dues, expenses, and tenant operations logs.
        </p>
      </div>

      {activeProperties.length === 0 ? (
        <div className="glass" style={{ background: 'var(--card-bg)', padding: '4rem 2rem', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FAIcon icon="building-circle-exclamation" style={{ fontSize: '48px', margin: '0 auto 1.5rem', color: 'var(--primary)', display: 'block' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--primary)', marginBottom: '0.5rem' }}>No Active Outlets Provisioned</h3>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem' }}>You need to configure your first PG outlet before you can view metrics or operations stats.</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {/* The PropertySelector modal button handles adding outlet slots */}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Please use the "+ Add Outlet" selector in the sidebar to activate a property.</span>
          </div>
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
