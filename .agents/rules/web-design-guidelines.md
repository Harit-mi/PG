# Web Interface Guidelines (Vercel)

> Guidelines and standards for accessible, performant, and polished Web UI engineering.

---

## 1. Accessibility (a11y)
- **Icon-Only Buttons**: Must include `aria-label` or `title`.
- **Form Controls**: Must have associated `<label>` (via `htmlFor` or wrapping) or `aria-label`.
- **Keyboard Navigation**: Interactive elements must support keyboard navigation (`onKeyDown` / `onKeyUp`).
- **Semantic HTML**: Use `<button>` for actions, `<a>`/`<Link>` for navigation (never `<div onClick>`).
- **Decorative Elements**: Decorative icons/graphics must have `aria-hidden="true"`.
- **Media & Images**: Informative images need `alt` descriptions; decorative images require `alt=""`.

---

## 2. Focus States & Control
- **Visible Focus**: Interactive elements must render clear focus indicators (`:focus-visible`). Never use `outline-none` without an explicit focus replacement.
- **Compound Controls**: Group focus states with `:focus-within` for combined inputs and drop-downs.

---

## 3. Forms & Data Input
- **Autocomplete & Types**: Inputs must specify proper `autocomplete` and `type` (`email`, `tel`, `url`, `number`).
- **Unblocked Paste**: Never prevent pasting on inputs (`preventDefault()` on `onPaste`).
- **Form Validation**: Display errors inline next to fields and keep submit buttons actionable until processing begins.

---

## 4. Typography & Numbers
- **Ellipses & Punctuation**: Use real ellipses (`…`) and proper curly quotes (`“` `”`).
- **Tabular Numbers**: Use `font-variant-numeric: tabular-nums` (`tabular-nums`) for currency tables, ledger amounts, and numerical columns.
- **Heading Balance**: Apply `text-wrap: balance` or `text-pretty` to prevent orphan words in headings.

---

## 5. Animation & Motion
- **Compositor Efficiency**: Animate only GPU-friendly properties (`transform`, `opacity`). Avoid `transition: all`.
- **Reduced Motion**: Respect `prefers-reduced-motion` to disable or soften animations for users with motion sensitivity.
