const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/DashboardClient.js', 'utf8');

const replacement = `      {/* 3. INTERACTIVE REVENUE & CAPACITY DECK */}
      <section className={styles.visualizerDeck}>
        {/* Simplified Clean Metrics Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem', width: '100%' }}>
          
          {/* Occupancy Card */}
          <div className={styles.cleanCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Building2 size={18} style={{ color: "var(--primary)" }} />
                <span>Occupancy Overview</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1rem 0', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="12" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" strokeWidth="12" strokeDasharray={2 * Math.PI * 50} strokeDashoffset={(2 * Math.PI * 50) * (1 - (occupancyRate / 100))} style={{ transition: 'stroke-dashoffset 1s ease' }} />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)' }}>{occupancyRate.toFixed(0)}%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filled</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, maxWidth: '150px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Beds</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)' }}>{totalBeds}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Occupied</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{occupiedBeds}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vacant</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>{totalBeds - occupiedBeds}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Collection Card */}
          <div className={styles.cleanCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <IndianRupee size={18} style={{ color: "var(--success)" }} />
                <span>Rent Collections</span>
              </div>
              <Link href="/dashboard/dues" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Ledger ↗</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
                ₹{rentCollected.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                of ₹{totalRentBase.toLocaleString('en-IN')} expected this month
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Collection Progress</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>
                  {totalRentBase > 0 ? Math.round((rentCollected / totalRentBase) * 100) : 0}%
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: \`\${totalRentBase > 0 ? Math.round((rentCollected / totalRentBase) * 100) : 0}%\`, background: 'var(--success)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>

        </div>
      </section>`;

// Replace from section to /section
const startTag = '{/* 3. INTERACTIVE REVENUE & CAPACITY DECK */}';
const endTag = '</section>';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag, startIndex) + endTag.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/app/dashboard/DashboardClient.js', content);
  console.log("Dashboard modified successfully.");
} else {
  console.log("Could not find section.");
}

