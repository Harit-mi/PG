# Awesome Design MD: Design System Tokens & Craft Standards

> Applied design system tokens, surface layering, and UI craft standards curated from top product designs (Linear, Vercel, Stripe, Supabase).

---

## 1. Surface Layering & Hairline Borders
- **Depth Hierarchy**: Use strict surface layering (`canvas`, `surface-1`, `surface-2`, `surface-3`) with translucent hairline borders (`1px solid rgba(...)`) rather than heavy drop shadows.
- **Card Panels**: Elevate cards with subtle 1px hairline borders and soft inner lighting transitions (`transition: border-color 0.2s ease, box-shadow 0.2s ease`).

---

## 2. Chromatic Restraint & Focal Accents
- **Single Accent Focus**: Use brand accent colors (`--primary` steel blue, `--accent` crimson) purposefully for active states, key CTAs, and focal anchors — never decoratively across random elements.
- **Dark Surface Contrast**: Ensure high legibility on dark panels using crisp light text (`#FFFFFF`, `rgba(255, 255, 255, 0.95)`).

---

## 3. Product-Centric Layout Rhythm
- **Data & Metric Display**: Frame numbers, revenue counters, and bed capacity indicators with tabular numbers (`tabular-nums`) and clean padding grids.
- **Interactive State Feedback**: Apply subtle hover elevation, active scale-down (`active:scale-[0.98]`), and visible focus rings (`focus-visible:ring-2`).
