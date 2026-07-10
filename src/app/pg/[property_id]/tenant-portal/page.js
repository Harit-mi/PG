import { supabase } from "@/utils/supabase";
import { Utensils, Bell, Calendar } from "lucide-react";
import ComplaintSection from "./ComplaintSection";
import LeaveSection from "./LeaveSection";

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

  // Fetch today's menu
  const { data: menuData } = await supabase
    .from('food_menus')
    .select('*')
    .eq('property_id', property_id)
    .eq('week_start_date', currentWeekStart)
    .eq('day_of_week', today)
    .single();

  // Fetch latest notices (last 5)
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .eq('property_id', property_id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch tenants for leave submission select
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, room_number')
    .eq('property_id', property_id)
    .eq('status', 'Active');

  // Fetch leaves for status tracking
  const { data: leaves } = await supabase
    .from('leaves')
    .select('*')
    .eq('property_id', property_id)
    .order('created_at', { ascending: false });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Today's Menu */}
      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Utensils size={20} style={{ color: 'var(--accent)' }} /> Today's Menu ({today})
        </h2>
        {menuData ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Breakfast</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{menuData.breakfast || 'Not specified'}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Lunch</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{menuData.lunch || 'Not specified'}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Evening Snack</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{menuData.evening_snack || 'Not specified'}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Dinner</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{menuData.dinner || 'Not specified'}</p>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
            No menu updated for today yet.
          </div>
        )}
      </section>

      {/* Leave Submission Section */}
      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} style={{ color: 'var(--accent)' }} /> Leave / Absence Tracker
        </h2>
        <LeaveSection propertyId={property_id} tenants={tenants || []} leaves={leaves || []} />
      </section>

      {/* Notice Board */}
      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} style={{ color: 'var(--accent)' }} /> Notice Board
        </h2>
        {notices && notices.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notices.map(notice => (
              <div key={notice.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{notice.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(notice.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {notice.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
            No recent notices.
          </div>
        )}
      </section>

      {/* Complaint Section (Client Component) */}
      <section>
        <ComplaintSection propertyId={property_id} />
      </section>

    </div>
  );
}
