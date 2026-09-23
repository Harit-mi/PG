import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/app/actions";
import DashboardClient from "./DashboardClient";
import FAIcon from "@/components/FAIcon";
import { Building2 } from "lucide-react";

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
          background: '#FFFFFF', 
          padding: '4rem 2rem', 
          borderRadius: '16px', 
          border: '1px solid #E2E8F0', 
          textAlign: 'center', 
          color: '#64748B',
          maxWidth: '540px',
          margin: '3rem auto',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
        }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '12px', 
            background: '#EFF6FF', 
            border: '1px solid #BFDBFE',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            color: '#2563EB' 
          }}>
            <Building2 size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 750, color: '#0F172A', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            No Outlets Provisioned Yet
          </h3>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Activate your first PG branch outlet from the sidebar selector to start monitoring real-time occupancy and rent collections.
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
