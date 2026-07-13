export default function TenantPortalLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', padding: '1rem', fontFamily: 'var(--font-inter)' }}>
      <main className="glass" style={{ maxWidth: '480px', margin: '0 auto', overflow: 'hidden' }}>
        <header style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>Tenant Portal</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Stay updated with your PG</p>
        </header>
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
