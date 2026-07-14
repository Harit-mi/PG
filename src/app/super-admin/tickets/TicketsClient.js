"use client";

import { useState } from "react";
import { MessageSquare, Calendar, ChevronRight, CornerDownLeft, Lock, Send, RefreshCw } from "lucide-react";
import { addTicketReply, updateTicketStatus } from "../actions";

export default function TicketsClient({ initialTickets = [] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSendReply = async (isPrivate) => {
    if (!replyText.trim()) return;
    setSubmitting(true);

    try {
      const res = await addTicketReply(selectedTicketId, replyText, isPrivate, "Support Team", "Admin");
      if (res.success) {
        // Append reply locally
        const newMsg = {
          id: Math.random().toString(),
          sender_type: "Admin",
          sender_name: "Support Team",
          message: replyText.trim(),
          is_private: isPrivate,
          created_at: new Date().toISOString()
        };

        setTickets(prev => prev.map(t => {
          if (t.id === selectedTicketId) {
            const nextStatus = replyText.toLowerCase().includes('resolved') ? 'Resolved' : 'In Progress';
            return {
              ...t,
              status: nextStatus,
              messages: [...t.messages, newMsg]
            };
          }
          return t;
        }));
        setReplyText("");
      } else {
        alert(res.error || "Failed to add reply.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (e) => {
    const nextStatus = e.target.value;
    try {
      const res = await updateTicketStatus(selectedTicketId, nextStatus);
      if (res.success) {
        setTickets(prev => prev.map(t => t.id === selectedTicketId ? { ...t, status: nextStatus } : t));
      } else {
        alert(res.error || "Failed to update ticket status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', minHeight: '70vh' }}>
      
      {/* Sidebar Tickets List */}
      <div className="glass" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Tickets Inbox</h3>
        {tickets.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tickets submitted yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tickets.map(t => {
              const isSelected = selectedTicketId === t.id;
              let statusColor = "var(--success)";
              if (t.status === 'Open') statusColor = "var(--danger)";
              if (t.status === 'In Progress') statusColor = "var(--warning)";

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    color: isSelected ? 'white' : 'var(--foreground)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: '0.75rem', color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                      {t.category} • {t.priority}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: statusColor, fontWeight: 700, textTransform: 'uppercase' }}>
                      {t.status}
                    </span>
                  </div>
                  <strong style={{ fontSize: '0.85rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {t.title}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                    {t.organization_name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Conversation Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {!selectedTicket ? (
          <div className="glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3>Select a Ticket from the list</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Choose a support ticket to start conversing and auditing notes.</p>
          </div>
        ) : (
          <div className="glass" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px', maxHeight: '75vh', overflow: 'hidden' }}>
            
            {/* Thread Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{selectedTicket.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Submitted by <strong>{selectedTicket.organization_name}</strong>
                </span>
              </div>
              <div>
                <select
                  value={selectedTicket.status}
                  onChange={handleStatusChange}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '99px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border)',
                    color: 'white',
                    fontWeight: 600,
                    outline: 'none',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="Open" style={{ background: '#0a1716' }}>Open</option>
                  <option value="In Progress" style={{ background: '#0a1716' }}>In Progress</option>
                  <option value="Resolved" style={{ background: '#0a1716' }}>Resolved</option>
                  <option value="Closed" style={{ background: '#0a1716' }}>Closed</option>
                </select>
              </div>
            </div>

            {/* Conversation Messages */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.05)' }}>
              
              {/* Original Description */}
              <div style={{ background: 'rgba(20, 184, 166, 0.03)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Original Issue Description</span>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', lineHeight: 1.5 }}>{selectedTicket.description}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
                  {new Date(selectedTicket.created_at).toLocaleString()}
                </div>
              </div>

              {/* Chat Thread */}
              {selectedTicket.messages.map(msg => {
                const isAdmin = msg.sender_type === 'Admin';
                const isPrivate = msg.is_private;

                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: isAdmin ? 'flex-end' : 'flex-start' }}>
                      {msg.sender_name} {isPrivate && <span style={{ color: 'var(--warning)', fontWeight: 700 }}>(Agent Note Only)</span>}
                    </span>
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '16px',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        background: isPrivate 
                          ? 'rgba(245, 158, 11, 0.1)' 
                          : (isAdmin ? 'var(--primary)' : 'rgba(255,255,255,0.05)'),
                        color: (isAdmin && !isPrivate) ? 'white' : 'var(--foreground)',
                        border: isPrivate ? '1px solid var(--warning)' : '1px solid var(--border)'
                      }}
                    >
                      {msg.message}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: isAdmin ? 'flex-end' : 'flex-start' }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.1)' }}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your message here. Mention 'resolved' in your text to automatically close/resolve this ticket."
                rows={2}
                style={{ width: '100%', resize: 'none', border: '1px solid var(--border)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSendReply(true)}
                  style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <Lock size={12} /> Save Private Note
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSendReply(false)}
                  style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <Send size={12} /> Send Public Reply
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
