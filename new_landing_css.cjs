const fs = require('fs');

const css = `
.container {
  min-height: 100vh;
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-body);
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.02em;
}

.navActions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.themeToggle {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.themeToggle:hover {
  background: var(--surface-muted);
  color: var(--foreground);
}

.btnSecondary {
  background: transparent;
  border: none;
  color: var(--foreground);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.btnPrimary {
  background: var(--foreground);
  color: var(--background);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btnPrimary:hover {
  opacity: 0.9;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6rem 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.badge {
  background: var(--surface-muted, var(--border-light));
  color: var(--text-muted);
  font-family: var(--font-mono-stack);
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 99px;
  margin-bottom: 2rem;
  letter-spacing: 0.02em;
}

.title {
  font-family: var(--font-display);
  font-size: 4rem;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.04em;
  margin-bottom: 1.5rem;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 3rem;
  max-width: 600px;
}

.ctaGroup {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btnLarge {
  background: var(--foreground);
  color: var(--background);
  border: none;
  border-radius: 8px;
  padding: 0.875rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, opacity 0.2s;
}

.btnLarge:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.btnLargeSecondary {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--foreground);
  border-radius: 8px;
  padding: 0.875rem 2rem;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btnLargeSecondary:hover {
  background: var(--surface-muted);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem 8rem;
}

.featureCard {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--cst-shadow);
}

.featureIcon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: var(--surface-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: var(--foreground);
}

.featureTitle {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
}

.featureText {
  color: var(--text-muted);
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Auth Modal Styles */
.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modalContent {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--cst-shadow-hover);
  position: relative;
  overflow: hidden;
}

.modalHeader {
  padding: 1.5rem 2rem 1rem;
}

.modalTitle {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.modalSubtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.closeBtn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}

.closeBtn:hover {
  background: var(--surface-muted);
  color: var(--foreground);
}

.modalBody {
  padding: 0 2rem 2rem;
}

.formGroup {
  margin-bottom: 1rem;
}

.label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: var(--foreground);
}

.input {
  width: 100%;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--foreground);
  font-family: var(--font-body);
  font-size: 0.95rem;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--badge-blue-bg);
}

.submitBtn {
  width: 100%;
  background: var(--foreground);
  color: var(--background);
  border: none;
  border-radius: 8px;
  padding: 0.875rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submitBtn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.authFooter {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.authLink {
  color: var(--foreground);
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.errorBanner {
  background: var(--badge-rose-bg);
  color: var(--danger);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  border: 1px solid var(--danger);
}

.successBanner {
  background: var(--badge-emerald-bg);
  color: var(--success);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  border: 1px solid var(--success);
}
`;

fs.writeFileSync('src/app/page.module.css', css);
console.log("Wrote simplified page.module.css");
