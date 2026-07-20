"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronDown, Plus, Sparkles, AlertCircle } from "lucide-react";
import { switchProperty, addProperty, fetchUnassignedSlotsCount, fetchUnassignedSlots, assignSlotToOutlet } from "@/app/actions";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import styles from "./PropertySelector.module.css";

export default function PropertySelector() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [activePropertyId, setActivePropertyId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // SaaS Slot values
  const [slotsCount, setSlotsCount] = useState(0);
  const [unassignedSlots, setUnassignedSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProperties();
    loadSlotsCount();
  }, []);

  const loadSlotsCount = async () => {
    const res = await fetchUnassignedSlotsCount();
    if (res.success) {
      setSlotsCount(res.count);
    }
  };

  const fetchProperties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const orgId = user?.user_metadata?.organization_id || 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0';

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const propertiesWithAll = [{ id: 'all', name: 'All PGs (Aggregated)' }, ...data];
        setProperties(propertiesWithAll);
        // Try to read active property from cookies
        const match = document.cookie.match(new RegExp('(^| )activePropertyId=([^;]+)'));
        if (match) {
          setActivePropertyId(match[2]);
        } else if (data.length > 0) {
          // Default to first property if no cookie
          handleSelect(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };

  const handleSelect = async (id) => {
    setActivePropertyId(id);
    setIsOpen(false);
    await switchProperty(id);
    window.location.reload();
  };

  const handleAddOutletClick = async () => {
    setIsOpen(false);
    const res = await fetchUnassignedSlots();
    if (res.success) {
      setUnassignedSlots(res.slots);
    }
    setShowAddModal(true);
  };

  const handleCreatePropertyWithSlot = async (e) => {
    e.preventDefault();
    if (unassignedSlots.length === 0) {
      alert("No slots available. Please buy a subscription first.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const address = formData.get("address");
    const slotId = unassignedSlots[0].id; // Use the first available slot

    try {
      const res = await assignSlotToOutlet(slotId, name, address);
      if (res.success) {
        setShowAddModal(false);
        fetchProperties();
        loadSlotsCount();
        window.location.reload();
      } else {
        alert(res.error || "Failed to assign slot to outlet.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeProperty = properties.find(p => p.id === activePropertyId) || properties[0];

  if (!activeProperty) return <div className={styles.loading}>Loading Properties...</div>;

  return (
    <div className={styles.container}>
      <button className={styles.selectorBtn} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.left}>
          <Building2 size={18} className={styles.icon} />
          <span className={styles.name}>{activeProperty.name}</span>
        </div>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {properties.map(p => (
            <button 
              key={p.id} 
              className={`${styles.item} ${p.id === activePropertyId ? styles.active : ''}`}
              onClick={() => handleSelect(p.id)}
            >
              {p.name}
            </button>
          ))}
          <div className={styles.divider}></div>
          
          {/* SaaS Slots Count Banner */}
          {slotsCount > 0 && (
            <div style={{ padding: '4px 12px', fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Sparkles size={12} /> {slotsCount} outlet slots available
            </div>
          )}

          <button className={styles.addItem} onClick={handleAddOutletClick}>
            <Plus size={16} /> Add Outlet
          </button>
        </div>
      )}

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '450px' }}>
            <h3>Setup New Property Outlet</h3>
            
            {slotsCount > 0 ? (
              <form onSubmit={handleCreatePropertyWithSlot} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Sparkles size={16} />
                  You have {slotsCount} unused paid slot(s). This setup will consume 1 slot.
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Property Name</label>
                  <input name="name" required placeholder="e.g. PG Sector 62" style={{ padding: '0.6rem 1rem', borderRadius: '99px' }} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Address</label>
                  <input name="address" placeholder="e.g. 123 Main St" style={{ padding: '0.6rem 1rem', borderRadius: '99px' }} />
                </div>
                
                <div className={styles.actions}>
                  <button type="button" onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>Cancel</button>
                  <button type="submit" disabled={submitting} className={styles.saveBtn} style={{ background: 'var(--primary)', color: 'white', borderRadius: '99px' }}>
                    {submitting ? "Processing..." : "Activate Outlet"}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <AlertCircle size={16} />
                  No available slots. You must purchase an outlet subscription first.
                </div>
                <div className={styles.actions} style={{ justifyContent: 'center' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>Cancel</button>
                  <button 
                    onClick={() => { setShowAddModal(false); router.push("/pricing"); }} 
                    style={{ background: 'var(--primary)', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '99px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Buy Subscriptions
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
