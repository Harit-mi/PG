const fs = require('fs');

let content = fs.readFileSync('src/components/RoomBoard.js', 'utf8');

const replacement = `                                  {unassignedTenants.length === 0 && (
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.5rem", textAlign: "center" }}>
                                      No unassigned residents found. Add a tenant in the directory first.
                                    </div>
                                  )}
                                </div>
                                
                                <div style={{ marginTop: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                                  <Link href="/dashboard/tenants" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 650, textDecoration: 'none' }}>
                                    + Create New Tenant Profile ↗
                                  </Link>
                                </div>`;

content = content.replace(/                                  \{unassignedTenants\.length === 0 && \([\s\S]*?No unassigned residents found\.[^<]*<\/div>\s*\)\}\s*<\/div>/, replacement);

fs.writeFileSync('src/components/RoomBoard.js', content);
console.log("Added Create New Tenant link.");
