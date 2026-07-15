"use client";

import { useState } from "react";
import { Power, ShieldAlert, Sparkles, X, Loader2, ArrowRight } from "lucide-react";
import { deactivateOutlet, cancelRenewal, reactivateOutlet } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function OutletsClient({ initialOutlets = [], unassignedSlots = [] }) {
  const router = useRouter();
  const [outlets, setOutlets] = useState(initialOutlets);
  const [submittingId, setSubmittingId] = useState("");

  const handleDeactivate = async (propertyId) => {
    if (!confirm("Are you sure you want to deactivate operational access to this outlet? This preserves data but suspends operations.")) return;
    setSubmittingId(propertyId);
    const res = await deactivateOutlet(propertyId);
    if (res.success) {
      setOutlets(prev => prev.map(o => o.id === propertyId ? { ...o, subscription_status: 'expired' } : o));
      alert("Property deactivated successfully.");
    } else {
      alert("Failed to deactivate.");
    }
    setSubmittingId("");
  };

  const handleCancelRenewal = async (propertyId) => {
    if (!confirm("Are you sure you want to cancel the renewal schedule for this outlet? The subscription will expire at the paid-through date.")) return;
    setSubmittingId(propertyId);
    const res = await cancelRenewal(propertyId);
    if (res.success) {
      setOutlets(prev => prev.map(o => o.id === propertyId ? { ...o, slot_status: 'Cancelled' } : o));
      alert("Subscription renewal cancelled successfully.");
    } else {
      alert("Failed to cancel renewal.");
    }
    setSubmittingId("");
  };

  const handleReactivate = async (propertyId) => {
    if (unassignedSlots.length === 0) {
      router.push("/pricing");
      return;
    }

    setSubmittingId(propertyId);
    const slotId = unassignedSlots[0].id;
    const res = await reactivateOutlet(propertyId, slotId);
    if (res.success) {
      setOutlets(prev => prev.map(o => o.id === propertyId ? { ...o, subscription_status: 'Active', slot_status: 'Assigned' } : o));
      alert("Outlet reactivated successfully!");
      window.location.reload();
    } else {
      alert("Failed to reactivate.");
    }
    setSubmittingId("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Slots Available Alert Banner */}
      {unassignedSlots.length > 0 && (
        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid var(--success)', padding: '1rem', borderRadius: '12px', color: 'var(--success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
            <Sparkles size={18} />
            You have {unassignedSlots.length} prepaid outlet slot(s) available for activation.
          </div>
        </div>
      )}

      {/* Outlets Directory List */}
      <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Outlet / PG</th>
              <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Address</th>
              <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Subscription Plan</th>
              <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Expiry Date</th>
              <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {outlets.map(o => {
              const isActive = o.subscription_status === 'Active' && o.slot_status !== 'Expired';
              let statusText = "Active";
              let badgeBg = "rgba(16, 185, 129, 0.15)";
              let badgeColor = "var(--success)";

              if (!isActive) {
                statusText = "Inactive / Expired";
                badgeBg = "rgba(239, 68, 68, 0.15)";
                badgeColor = "var(--danger)";
              } else if (o.slot_status === 'Cancelled') {
                statusText = "Cancelling at period end";
                badgeBg = "rgba(245, 158, 11, 0.15)";
                badgeColor = "var(--warning)";
              }

              return (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{o.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{o.address || 'Pending setup'}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{o.plan_name || 'Professional'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: badgeBg, color: badgeColor, padding: '4px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {statusText}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {o.expiry_date ? new Date(o.expiry_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {isActive ? (
                      <>
                        {o.slot_status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelRenewal(o.id)}
                            disabled={submittingId === o.id}
                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--warning)', padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}
                          >
                            Cancel Renewal
                          </button>
                        )}
                        <button
                          onClick={() => handleDeactivate(o.id)}
                          disabled={submittingId === o.id}
                          style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          Deactivate
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleReactivate(o.id)}
                        disabled={submittingId === o.id}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        {unassignedSlots.length > 0 ? "Reactivate (Use Slot)" : "Renew Subscriptions"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
