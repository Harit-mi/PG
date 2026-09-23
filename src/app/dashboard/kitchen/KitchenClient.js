"use client";

import { useState } from "react";
import { Utensils, Award, ShieldAlert, CheckCircle, Clock } from "lucide-react";

export default function KitchenClient({ initialTenants = [], initialLeaves = [] }) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Local date formatter
  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
    }
    return dateStr;
  };

  // Calculations for today's counts
  const totalTenantsCount = initialTenants.length;
  
  let leaveBF = 0;
  let leaveLN = 0;
  let leaveDN = 0;
  
  initialTenants.forEach(tenant => {
    // Find approved leaves today
    const leavesToday = initialLeaves.filter(l => 
      l.tenant_id === tenant.id && 
      l.status === 'Approved' && 
      todayStr >= l.start_date && 
      todayStr <= l.end_date
    );
    
    leavesToday.forEach(l => {
      if (l.breakfast) leaveBF++;
      if (l.lunch) leaveLN++;
      if (l.dinner) leaveDN++;
    });
  });
  
  const presentBF = Math.max(totalTenantsCount - leaveBF, 0);
  const presentLN = Math.max(totalTenantsCount - leaveLN, 0);
  const presentDN = Math.max(totalTenantsCount - leaveDN, 0);

  // Sorting tenants by room number
  const sortedTenants = [...initialTenants].sort((a,b) => {
    return String(a.room_number || "").localeCompare(String(b.room_number || ""));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 750, display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, color: 'var(--foreground)' }}>
          🍳 Kitchen Preparation Monitor
        </h2>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', background: '#EFF6FF', padding: '6px 14px', borderRadius: '9999px', border: '1px solid #BFDBFE' }}>
          Today: {formatDateString(todayStr)}
        </div>
      </div>

      {/* Portion Counts Gauges Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        
        {/* Breakfast */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderTop: '4px solid #F59E0B', borderRadius: '14px', padding: '1.75rem 1.25rem', textAlign: 'center', position: 'relative', boxShadow: 'var(--cst-shadow)' }}>
          <div style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>🍳</div>
          <h3 style={{ fontSize: '0.95rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1.25rem', marginTop: 0, fontWeight: 700 }}>Breakfast Count</h3>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', border: '6px solid rgba(245, 158, 11, 0.25)', borderTopColor: '#F59E0B' }}>
            <span style={{ fontSize: '2.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{presentBF}</span>
            <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>Portions</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.82rem', color: '#64748B' }}>
            <span>🔴 On Leave: <strong>{leaveBF}</strong></span>
            <span>🟢 Present: <strong>{presentBF}</strong></span>
          </div>
        </div>

        {/* Lunch */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderTop: '4px solid #2563EB', borderRadius: '14px', padding: '1.75rem 1.25rem', textAlign: 'center', position: 'relative', boxShadow: 'var(--cst-shadow)' }}>
          <div style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>🍱</div>
          <h3 style={{ fontSize: '0.95rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1.25rem', marginTop: 0, fontWeight: 700 }}>Lunch Count</h3>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', border: '6px solid rgba(37, 99, 235, 0.25)', borderTopColor: '#2563EB' }}>
            <span style={{ fontSize: '2.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{presentLN}</span>
            <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>Portions</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.82rem', color: '#64748B' }}>
            <span>🔴 On Leave: <strong>{leaveLN}</strong></span>
            <span>🟢 Present: <strong>{presentLN}</strong></span>
          </div>
        </div>

        {/* Dinner */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderTop: '4px solid #10B981', borderRadius: '14px', padding: '1.75rem 1.25rem', textAlign: 'center', position: 'relative', boxShadow: 'var(--cst-shadow)' }}>
          <div style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>🥗</div>
          <h3 style={{ fontSize: '0.95rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1.25rem', marginTop: 0, fontWeight: 700 }}>Dinner Count</h3>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', border: '6px solid rgba(16, 185, 129, 0.25)', borderTopColor: '#10B981' }}>
            <span style={{ fontSize: '2.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{presentDN}</span>
            <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>Portions</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.82rem', color: '#64748B' }}>
            <span>🔴 On Leave: <strong>{leaveDN}</strong></span>
            <span>🟢 Present: <strong>{presentDN}</strong></span>
          </div>
        </div>

      </div>

      {/* Occupant meal schedule status grid */}
      <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem', boxShadow: 'var(--cst-shadow)' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', marginTop: 0, color: 'var(--foreground)', fontWeight: 750 }}>📋 Today&apos;s Occupant Meal Schedule</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 650, fontSize: '0.72rem', textTransform: 'uppercase' }}>Room</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 650, fontSize: '0.72rem', textTransform: 'uppercase' }}>Tenant Name</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 650, fontSize: '0.72rem', textTransform: 'uppercase' }}>Breakfast</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 650, fontSize: '0.72rem', textTransform: 'uppercase' }}>Lunch</th>
                <th style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: 650, fontSize: '0.72rem', textTransform: 'uppercase' }}>Dinner</th>
              </tr>
            </thead>
            <tbody>
              {sortedTenants.map(t => {
                const tenantLeaves = initialLeaves.filter(l => 
                  l.tenant_id === t.id && 
                  l.status === 'Approved' && 
                  todayStr >= l.start_date && 
                  todayStr <= l.end_date
                );

                let isBFOnLeave = false;
                let isLNOnLeave = false;
                let isDNOnLeave = false;

                tenantLeaves.forEach(l => {
                  if (l.breakfast) isBFOnLeave = true;
                  if (l.lunch) isLNOnLeave = true;
                  if (l.dinner) isDNOnLeave = true;
                });

                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.95rem 1rem', fontWeight: 700, color: 'var(--foreground)' }}>Room {t.room_number || 'N/A'}</td>
                    <td style={{ padding: '0.95rem 1rem', color: 'var(--foreground)', fontWeight: 550 }}>{t.name}</td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <span style={{ 
                        background: isBFOnLeave ? '#FEE2E2' : '#ECFDF5',
                        color: isBFOnLeave ? '#DC2626' : '#059669',
                        padding: '3px 8px',
                        borderRadius: '99px',
                        fontSize: '0.72rem',
                        fontWeight: 650
                      }}>
                        {isBFOnLeave ? '🔴 Leave' : '🟢 Present'}
                      </span>
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <span style={{ 
                        background: isLNOnLeave ? '#FEE2E2' : '#ECFDF5',
                        color: isLNOnLeave ? '#DC2626' : '#059669',
                        padding: '3px 8px',
                        borderRadius: '99px',
                        fontSize: '0.72rem',
                        fontWeight: 650
                      }}>
                        {isLNOnLeave ? '🔴 Leave' : '🟢 Present'}
                      </span>
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <span style={{ 
                        background: isDNOnLeave ? '#FEE2E2' : '#ECFDF5',
                        color: isDNOnLeave ? '#DC2626' : '#059669',
                        padding: '3px 8px',
                        borderRadius: '99px',
                        fontSize: '0.72rem',
                        fontWeight: 650
                      }}>
                        {isDNOnLeave ? '🔴 Leave' : '🟢 Present'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
