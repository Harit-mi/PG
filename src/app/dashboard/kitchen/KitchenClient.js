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
    <div style={{ background: '#0f172a', color: '#f8fafc', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          👨‍🍳 Kitchen Preparation Monitor
        </h2>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 16px', borderRadius: '9999px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          Today: {formatDateString(todayStr)}
        </div>
      </div>

      {/* Portion Counts Gauges Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        
        {/* Breakfast */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderTop: '4px solid #f59e0b', borderRadius: '12px', padding: '2rem 1.5rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍳</div>
          <h3 style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', marginTop: 0 }}>Breakfast Count</h3>
          <div style={{ width: '130px', height: '130px', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', border: '8px solid rgba(245, 158, 11, 0.2)', borderTopColor: '#f59e0b' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{presentBF}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>Portions</span>
          </div>
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-around', fontSize: '0.85rem', color: '#64748b' }}>
            <span>🔴 On Leave: <strong>{leaveBF}</strong></span>
            <span>🟢 Present: <strong>{presentBF}</strong></span>
          </div>
        </div>

        {/* Lunch */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderTop: '4px solid #38bdf8', borderRadius: '12px', padding: '2rem 1.5rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍱</div>
          <h3 style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', marginTop: 0 }}>Lunch Count</h3>
          <div style={{ width: '130px', height: '130px', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', border: '8px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#38bdf8' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{presentLN}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>Portions</span>
          </div>
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-around', fontSize: '0.85rem', color: '#64748b' }}>
            <span>🔴 On Leave: <strong>{leaveLN}</strong></span>
            <span>🟢 Present: <strong>{presentLN}</strong></span>
          </div>
        </div>

        {/* Dinner */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderTop: '4px solid #10b981', borderRadius: '12px', padding: '2rem 1.5rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🥗</div>
          <h3 style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', marginTop: 0 }}>Dinner Count</h3>
          <div style={{ width: '130px', height: '130px', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', border: '8px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{presentDN}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>Portions</span>
          </div>
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-around', fontSize: '0.85rem', color: '#64748b' }}>
            <span>🔴 On Leave: <strong>{leaveDN}</strong></span>
            <span>🟢 Present: <strong>{presentDN}</strong></span>
          </div>
        </div>

      </div>

      {/* Occupant meal schedule status grid */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', marginTop: 0 }}>📋 Today's Occupant Meal Schedule</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '2px solid #334155' }}>
                <th style={{ padding: '12px 16px', color: '#94a3b8', fontWeight: 600 }}>Room</th>
                <th style={{ padding: '12px 16px', color: '#94a3b8', fontWeight: 600 }}>Tenant Name</th>
                <th style={{ padding: '12px 16px', color: '#94a3b8', fontWeight: 600 }}>Breakfast</th>
                <th style={{ padding: '12px 16px', color: '#94a3b8', fontWeight: 600 }}>Lunch</th>
                <th style={{ padding: '12px 16px', color: '#94a3b8', fontWeight: 600 }}>Dinner</th>
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
                  <tr key={t.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>Room {t.room_number || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', color: '#e2e8f0' }}>{t.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: isBFOnLeave ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: isBFOnLeave ? '#ef4444' : '#10b981',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {isBFOnLeave ? '🔴 Leave' : '🟢 Present'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: isLNOnLeave ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: isLNOnLeave ? '#ef4444' : '#10b981',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {isLNOnLeave ? '🔴 Leave' : '🟢 Present'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: isDNOnLeave ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: isDNOnLeave ? '#ef4444' : '#10b981',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600
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
