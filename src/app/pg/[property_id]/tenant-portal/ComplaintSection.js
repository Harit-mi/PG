"use client";

import { useState } from "react";
import { Send, Search } from "lucide-react";
import { submitPublicComplaint, checkComplaintStatus } from "./actions";

export default function ComplaintSection({ propertyId }) {
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  
  const [searchId, setSearchId] = useState("");
  const [statusResult, setStatusResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const res = await submitPublicComplaint(propertyId, formData);
    setLoading(false);
    
    if (res.success) {
      setTicketId(res.ticketId);
      e.target.reset();
    } else {
      alert(res.error || "Failed to submit");
    }
  }

  async function handleCheckStatus(e) {
    e.preventDefault();
    if (!searchId.trim()) return;
    
    const res = await checkComplaintStatus(propertyId, searchId);
    if (res.success) {
      setStatusResult(res.data);
    } else {
      alert(res.error || "Ticket not found");
      setStatusResult(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Submit Complaint */}
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Send size={18} style={{ color: 'var(--accent)' }} /> Submit Complaint
        </h2>
        
        {ticketId ? (
          <div style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 500 }}>Complaint Submitted!</p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Your Ticket ID: <strong style={{ fontSize: '1.1rem' }}>{ticketId}</strong></p>
            <button 
              onClick={() => setTicketId(null)} 
              style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #25D366', color: '#25D366', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Name</label>
                <input name="tenant_name" required placeholder="Your Name" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Room</label>
                <input name="room_number" required placeholder="Room No" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }} />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category</label>
              <select name="category" required style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }}>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Internet">Internet</option>
                <option value="Food">Food Quality</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Describe Issue</label>
              <textarea name="issue" required rows="3" placeholder="Please provide details..." style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }}></textarea>
            </div>

            <button type="submit" disabled={loading} style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        )}
      </div>

      {/* Check Status */}
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} style={{ color: 'var(--accent)' }} /> Check Ticket Status
        </h2>
        
        <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Ticket ID (e.g. TKT-123)" 
            required
            style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }} 
          />
          <button type="submit" style={{ background: 'var(--border)', color: 'white', border: 'none', padding: '0.75rem 1rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
            Check
          </button>
        </form>

        {statusResult && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: `4px solid ${statusResult.status === 'Resolved' ? '#25D366' : statusResult.status === 'In Progress' ? '#f59e0b' : '#ef4444'}` }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status: <strong style={{ color: 'white' }}>{statusResult.status}</strong></p>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>{statusResult.category} - {statusResult.issue}</p>
          </div>
        )}
      </div>

    </div>
  );
}
