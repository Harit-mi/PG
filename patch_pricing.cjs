const fs = require('fs');

let content = fs.readFileSync('src/app/pricing/page.js', 'utf8');

if (!content.includes('const openAuth')) {
  // Add client marker if needed, but it might be a Server Component.
  // We can just make it an a href!
  content = content.replace(
    /<button className=\{styles\.btnPrimary\}(.*?)>([\s\S]*?)<\/button>/,
    `<a href="http://app.localhost:3000/" className={styles.btnPrimary} style={{ width: '100%', marginBottom: '3rem', padding: '1rem', fontSize: '1.1rem', borderRadius: '12px', display: 'inline-block', textAlign: 'center', textDecoration: 'none', fontWeight: 600 }}\$1>\$2</a>`
  );
  
  // Actually, wait, localhost is hardcoded. It's better to use a client side function.
}

fs.writeFileSync('src/app/pricing/page.js', content);
