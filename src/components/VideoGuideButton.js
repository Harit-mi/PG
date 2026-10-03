"use client";

import { useState } from "react";
import { Info, Play, X, ExternalLink, Video } from "lucide-react";
import styles from "./Modal.module.css";

const DEFAULT_GUIDES = {
  "Rooms": {
    title: "How to Manage Rooms & Bed Allocations",
    desc: "Learn how to add single/double/triple sharing rooms, set rent per bed, update amenities, and view occupancy.",
    videoUrl: "https://www.youtube.com/results?search_query=hostel+room+management+tutorial",
    tips: [
      "Add room types and capacities before allocating tenants.",
      "Vacant and partially occupied rooms update automatically.",
      "Room assets and inventory can be tracked in Assets section."
    ]
  },
  "Tenants": {
    title: "How to Add & Manage PG Tenants",
    desc: "Complete walkthrough on adding residents with KYC, assigning rooms, emergency parent contacts, and DPDP compliance.",
    videoUrl: "https://www.youtube.com/results?search_query=pg+tenant+onboarding+tutorial",
    tips: [
      "Select blood group from the dropdown for emergency medical readiness.",
      "Only digits are accepted for mobile numbers to prevent invalid records.",
      "Tenants can access their own resident portal using their registered phone number."
    ]
  },
  "Dues": {
    title: "Rent Collection, Billing & Receipt Generation",
    desc: "Master rent collection: when rent is due, sending 1-click WhatsApp reminders, marking dues as paid, and downloading PDF receipts.",
    videoUrl: "https://www.youtube.com/results?search_query=rent+collection+ledger+tutorial",
    tips: [
      "Rent cycle is active from the 1st to 5th of each month.",
      "Click the green WhatsApp button to send an instant reminder with your UPI ID.",
      "Click 'Mark Paid' when cash or transfer arrives to generate an official PDF receipt."
    ]
  },
  "Complaints": {
    title: "Handling Resident Complaints & Maintenance",
    desc: "Track maintenance requests for plumbing, electrical, WiFi, and housekeeping with high/medium priority status.",
    videoUrl: "https://www.youtube.com/results?search_query=maintenance+ticketing+system+tutorial",
    tips: [
      "Tenants can submit maintenance requests directly from the Tenant Portal.",
      "Update status from Open -> In Progress -> Resolved to keep residents informed.",
      "Use 'Export CSV' to share repair logs with contractors or maintenance staff."
    ]
  },
  "Kitchen": {
    title: "Kitchen Preparation & Meal Count Monitor",
    desc: "Real-time kitchen board calculating exact portions for breakfast, lunch, and dinner based on tenant leaves.",
    videoUrl: "https://www.youtube.com/results?search_query=hostel+mess+management+tutorial",
    tips: [
      "Portion counts update automatically when residents log approved leaves.",
      "Check the occupant meal schedule table to see who is present or skipping meals today.",
      "Reduces food wastage by calculating exact plates needed per meal."
    ]
  },
  "Leaves": {
    title: "Tenant Leave Tracker & Absence Approval",
    desc: "Log and approve upcoming resident leaves, skip meals (Breakfast/Lunch/Dinner), and view active absent residents.",
    videoUrl: "https://www.youtube.com/results?search_query=hostel+leave+management+system",
    tips: [
      "Residents can submit leave requests from their mobile portal.",
      "Click 'Approve' or 'Reject' to update the kitchen portion count automatically.",
      "Export full leave logs to CSV for warden records."
    ]
  },
  "Visitors": {
    title: "Visitor Gate Passes & Entry Logs",
    desc: "Manage guest entry/exit logs for family, friends, contractors, and delivery personnel.",
    videoUrl: "https://www.youtube.com/results?search_query=visitor+management+system+tutorial",
    tips: [
      "Click '+ Log Visitor' to record a guest entry directly from the dashboard.",
      "Residents can request digital visitor passes in advance from their portal.",
      "Use Check-In and Check-Out actions to maintain real-time hostel security."
    ]
  },
  "Menu": {
    title: "Configuring the Weekly Food Menu",
    desc: "Set breakfast, lunch, and dinner plans for Monday through Sunday and publish them to all residents.",
    videoUrl: "https://www.youtube.com/results?search_query=hostel+weekly+food+menu+system",
    tips: [
      "Update meals for each day of the week and click 'Save Menu'.",
      "Use 'Copy Previous Week' to quickly duplicate last week's dining schedule.",
      "Published menus immediately reflect on both the Tenant Portal and Kitchen Board."
    ]
  },
  "Finances": {
    title: "Income, Expense & Profit/Loss Ledger",
    desc: "Track utility bills, staff salaries, repairs, and total rental revenue with comprehensive financial analytics.",
    videoUrl: "https://www.youtube.com/results?search_query=hostel+pg+accounting+cashflow+tutorial",
    tips: [
      "Log non-rent incomes and all daily expenses (electricity, groceries, internet).",
      "Monthly Net Profit and cashflow charts update in real-time.",
      "Export full financial transactions for tax filing and audits."
    ]
  },
  "Settings": {
    title: "PG Setup, Payment Methods & Outlets",
    desc: "Configure your PG property details, UPI IDs, bank accounts, staff memberships, and subscription packages.",
    videoUrl: "https://www.youtube.com/results?search_query=saas+settings+and+payment+setup",
    tips: [
      "Add your receiving UPI ID in Payment Methods so residents see it in their portal.",
      "Switch between multiple PG branches seamlessly from the top selector.",
      "Upgrade your plan for unlimited capacity and advanced automation."
    ]
  },
  "Dashboard": {
    title: "PG Operations & Live Dashboard Overview",
    desc: "Understand your PG business health at a glance: real-time bed occupancy, rent collected vs overdue, recent activities, and quick actions.",
    videoUrl: "https://www.youtube.com/results?search_query=hostel+management+software+overview",
    tips: [
      "Use the date range buttons to toggle between Today, This Month, and Last Month.",
      "Review urgent action items like overdue rents and pending complaints directly from the activity feed.",
      "Switch between multiple PG branches or view aggregated stats across all outlets."
    ]
  },
  "Employees": {
    title: "Staff & Employee Management Guide",
    desc: "Add PG managers, cooks, wardens, and cleaners, track monthly salaries, and manage property assignments.",
    videoUrl: "https://www.youtube.com/results?search_query=hostel+staff+management+tutorial",
    tips: [
      "Assign staff to specific PG properties or outlets.",
      "Track monthly salary payout dates and payment status.",
      "Store emergency contact information for all on-site personnel."
    ]
  },
  "Assets": {
    title: "Room Assets & Physical Inventory Guide",
    desc: "Keep an immutable inventory of appliances, air conditioners, geysers, beds, and furniture room by room.",
    videoUrl: "https://www.youtube.com/results?search_query=hostel+asset+inventory+management",
    tips: [
      "Log purchase cost, installation date, and serial number for major appliances.",
      "Filter assets by Working, Damaged, or In Repair status.",
      "Conduct quick physical audits before tenant move-outs."
    ]
  },
  "Room Board": {
    title: "Visual Bed Matrix & Room Board Guide",
    desc: "Interactive visual matrix showing real-time occupancy, empty beds, and room-level details at a single glance.",
    videoUrl: "https://www.youtube.com/results?search_query=hostel+bed+matrix+visual+board",
    tips: [
      "Color-coded badges immediately signal fully occupied vs vacant rooms.",
      "Click any room card to see current residents and vacant bed slots.",
      "Filter by floor or room sharing type."
    ]
  }
};

export default function VideoGuideButton({ section = "Rooms", customUrl, customTitle }) {
  const [isOpen, setIsOpen] = useState(false);

  const guide = DEFAULT_GUIDES[section] || {
    title: customTitle || `${section} Tutorial & Video Guide`,
    desc: `Learn how to use the ${section} section effectively with our step-by-step video guide.`,
    videoUrl: customUrl || "https://www.youtube.com",
    tips: ["Follow the step-by-step workflow", "Refer to tooltips for instant help"]
  };

  const videoLink = customUrl || guide.videoUrl;

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        title={`Watch Video Guide for ${section}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(30, 72, 119, 0.08)',
          color: 'var(--primary, #1e4877)',
          border: '1px solid rgba(30, 72, 119, 0.25)',
          padding: '0.45rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--primary, #1e4877)';
          e.currentTarget.style.color = 'var(--surface)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(30, 72, 119, 0.08)';
          e.currentTarget.style.color = 'var(--primary, #1e4877)';
        }}
      >
        <span style={{ 
          width: '18px', 
          height: '18px', 
          borderRadius: '50%', 
          background: 'currentColor', 
          color: '#FFFFFF', 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 900
        }}>
          i
        </span>
        <span>Video Guide</span>
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div 
            className={`${styles.modal} glass`} 
            style={{ maxWidth: '560px', width: '90%' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(30, 72, 119, 0.1)', color: 'var(--primary, #1e4877)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{guide.title}</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    {section} Tutorial
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
              {guide.desc}
            </p>

            {/* Video Player / Action Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #1E4877, #0F2A4A)', 
              color: 'white', 
              padding: '1.75rem 1.25rem', 
              borderRadius: '14px', 
              textAlign: 'center',
              marginBottom: '1.25rem',
              boxShadow: '0 8px 24px rgba(30, 72, 119, 0.25)'
            }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'rgba(255, 255, 255, 0.2)', 
                margin: '0 auto 1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}>
                <Play size={28} fill="white" style={{ marginLeft: '4px' }} />
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800 }}>
                Step-by-Step Video Walkthrough
              </h4>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', opacity: 0.85 }}>
                Watch our quick 2-minute visual walkthrough for this section.
              </p>
              <a 
                href={videoLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--surface)',
                  color: '#1E4877',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                Watch Video Guide <ExternalLink size={14} />
              </a>
            </div>

            {/* Key Tips */}
            {guide.tips && guide.tips.length > 0 && (
              <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 800 }}>
                  💡 Quick Tips:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {guide.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className={styles.cancelBtn}
                style={{ padding: '0.55rem 1.25rem' }}
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
