import { fetchSuperAdminMetrics } from "./actions";
import { Users, Home, IndianRupee, MessageSquare, AlertTriangle, Terminal, TrendingUp, Sparkles, Activity } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function SuperAdminDashboard() {
  const res = await fetchSuperAdminMetrics();

  // If table is missing, show migration instructions
  const isTableMissing = !res.success && res.error?.includes("relation \"public.organizations\" does not exist");

  if (isTableMissing) {
    return (
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Super Admin Setup</h1>
        
        <div style={{ 
          background: 'rgba(20, 184, 166, 0.05)', 
          border: '1px solid var(--border)', 
          borderRadius: '20px', 
          padding: '2.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.25rem',
          maxWidth: '800px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: 800, fontSize: '1.3rem' }}>
            <AlertTriangle size={24} />
            SaaS Table Schema Migration Required
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            To enable Multi-Outlet subscription packages and the Super Admin control center, you need to run the SQL migration script in your Supabase project. We have pre-created the file for you in the project root.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--accent)', marginBottom: '0.75rem', fontWeight: 700 }}>
              <Terminal size={14} /> Setup Instructions:
            </div>
            <ol style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
              <li>Open your **[Supabase Project SQL Editor](https://supabase.com/dashboard/project/creeorxpcmzpcgtzcxaw/editor)**.</li>
              <li>Click **New query** in the top left.</li>
              <li>Open and copy the contents of the file <a href="file:///Users/haritmishra/.gemini/antigravity/scratch/pg-owner-app/setup_super_admin_schema.sql" style={{ color: 'var(--primary)', fontWeight: 600 }}>setup_super_admin_schema.sql</a> in this project directory.</li>
              <li>Paste the code into the SQL editor and click **Run**.</li>
              <li>Refresh this page!</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const metrics = res.metrics || {
    totalCustomers: 0,
    activeCustomers: 0,
    totalOutlets: 0,
    openTickets: 0,
    totalRevenue: 0
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          <Sparkles size={14} /> Control Center
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '4px 0 0' }}>
          SaaS Platform Health
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>
          Consolidated business metrics, subscribers, revenues, and platform activity.
        </p>
      </div>

      {/* Grid Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        
        {/* Total Customers */}
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Owners / Orgs</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{metrics.totalCustomers}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
            🟢 {metrics.activeCustomers} Active Accounts
          </span>
        </div>

        {/* Total Outlets */}
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active PG Outlets</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{metrics.totalOutlets}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Properties footprint on platform
          </span>
        </div>

        {/* Total Revenue */}
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Platform Collections</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>₹{metrics.totalRevenue.toLocaleString()}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <TrendingUp size={12} /> Billed via PhonePe
          </span>
        </div>

        {/* Open Support Tickets */}
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Open Tickets</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{metrics.openTickets}</div>
          <span style={{ fontSize: '0.75rem', color: metrics.openTickets > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
            {metrics.openTickets > 0 ? '⚠️ Action Required' : '✓ SLA Healthy'}
          </span>
        </div>

      </div>

      {/* Overview Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Active Subscriptions Chart Card */}
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Platform Revenue Analytics</h3>
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '60px' }}>
              <div style={{ width: '24px', height: '160px', background: 'var(--primary)', borderRadius: '99px' }} title="Starter: 35%"></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starter</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '60px' }}>
              <div style={{ width: '24px', height: '110px', background: 'var(--accent)', borderRadius: '99px' }} title="Pro: 45%"></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pro</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '60px' }}>
              <div style={{ width: '24px', height: '60px', background: '#38bdf8', borderRadius: '99px' }} title="Enterprise: 20%"></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enterprise</span>
            </div>
          </div>
        </div>

        {/* Quick System Links */}
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/super-admin/customers" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem', borderRadius: '99px', background: 'rgba(20,184,166,0.05)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', border: '1px solid var(--border)', transition: 'all 0.2s' }}>
              👥 Manage Customers Organization
            </Link>
            <Link href="/super-admin/tickets" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem', borderRadius: '99px', background: 'rgba(20,184,166,0.05)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', border: '1px solid var(--border)', transition: 'all 0.2s' }}>
              💬 Open Support Queue
            </Link>
            <Link href="/super-admin/audits" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem', borderRadius: '99px', background: 'rgba(20,184,166,0.05)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', border: '1px solid var(--border)', transition: 'all 0.2s' }}>
              🛡️ Audit Event Logs
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
