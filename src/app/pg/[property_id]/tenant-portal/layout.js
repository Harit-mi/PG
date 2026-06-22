export default function TenantPortalLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-primary)', padding: '1rem', fontFamily: 'var(--font-inter)' }}>
      <main style={{ maxWidth: '480px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <header style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, background: 'linear-gradient(135deg, var(--text-primary), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tenant Portal</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Stay updated with your PG</p>
        </header>
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
