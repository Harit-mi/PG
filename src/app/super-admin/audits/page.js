import { fetchSuperAdminAuditLogs } from "../actions";
import { ShieldAlert, Calendar, Clock, User } from "lucide-react";

export const revalidate = 0;

export default async function SuperAdminAuditLogsPage() {
  const res = await fetchSuperAdminAuditLogs();
  const logs = res.logs || [];

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>Security & Action Audit Logs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Immutable ledger tracking administrative actions, impersonation logs, and subscription overrides.</p>
      </div>

      <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No audit events logged yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)', width: '180px' }}>Timestamp</th>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)', width: '220px' }}>Admin</th>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)', width: '180px' }}>Action</th>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Mutation Details</th>
                <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Mandated Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {new Date(log.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Clock size={12} /> {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} style={{ color: 'var(--primary)' }} /> {log.admin_email}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{log.details}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    "{log.reason || 'No reason provided'}"
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
