<div align="center">
  <img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" alt="Next.js Logo" width="80" />
  <h1>HostBoard (PG Owner App)</h1>
  <p><strong>The Ultimate Operating System for PG & Hostel Management</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Architecture-B2B_SaaS-purple?style=for-the-badge" alt="SaaS" />
  </p>
</div>

---

## 📖 Overview

**HostBoard** is a premium, high-density B2B SaaS platform designed to eliminate the chaos of paper registers, messy Excel sheets, and endless WhatsApp groups for PG (Paying Guest) and Hostel owners. 

Built with a sleek, Apple-inspired frosted-glass UI, HostBoard acts as a centralized command center. It empowers owners to remotely monitor real-time bed occupancies, track financial dues, store digital KYC documents, and resolve tenant complaints across multiple properties instantly.

---

## ✨ Core Features

- 🏨 **Visual Room Board:** A drag-and-drop interactive pegboard mimicking a physical hotel key rack. View bed-level occupancies (`Vacant`, `Occupied`, `Notice`) instantly.
- 💰 **Automated Financial Ledger:** Track monthly rent collections, generate invoices, and flag pending dues without manual reconciliation.
- 🗂️ **Digital Tenant Directory:** Securely store tenant KYC documents, lease agreements, and emergency contacts in the cloud.
- 🎫 **Ticketing & Complaints:** A self-service portal for tenants to raise maintenance issues (plumbing, electrical) directly to the Warden.
- 🍲 **Kitchen Board:** Digital daily food menus and mess schedules.
- 🤖 **AI Copilot (Powered by Gemini):** Built-in intelligent assistant to help owners analyze occupancy rates and resolve queries.

---

## 👥 Multi-Tier SaaS Architecture

The platform is designed with a strict Row-Level Security (RLS) multi-tenant architecture to support scaling to thousands of independent businesses:

1. **👑 Superadmin (Platform Owner):** Manages SaaS subscriptions and global feature toggles.
2. **🏢 PG Owner (Client):** Owns multiple buildings; views aggregate revenue and assigns Managers.
3. **🛡️ Manager (Warden):** Assigned to a specific property for day-to-day operations (rent collection, complaints).
4. **👤 Tenant (Resident):** Views rent dues, food menus, and raises maintenance tickets.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** CSS Modules with Global CSS Variables (Glassmorphism Design System)
- **Database & Auth:** Supabase (PostgreSQL, SSR Auth, RLS Policies)
- **AI Integration:** Google Gemini SDK
- **Testing:** Puppeteer (Automated End-to-End UI Testing)

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/pg-owner-app.git
cd pg-owner-app
```

### 2. Install Dependencies
*Note: Use `--legacy-peer-deps` due to testing library configurations.*
```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🔒 Security & Compliance
- **DPDP Act 2023 Compliant:** Built-in tenant data consent and erasure controls for Indian data privacy laws.
- **Data Sanitization:** Strict input sanitization and rate-limiting middleware to prevent injection and spam attacks.

<br/>

<div align="center">
  <i>Designed for Scale. Built for Owners.</i>
</div>
