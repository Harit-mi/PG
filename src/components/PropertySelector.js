"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronDown, Plus } from "lucide-react";
import { switchProperty, addProperty } from "@/app/actions";
import { supabase } from "@/utils/supabase";
import styles from "./PropertySelector.module.css";

export default function PropertySelector() {
  const [properties, setProperties] = useState([]);
  const [activePropertyId, setActivePropertyId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      setProperties(data);
      // Try to read active property from cookies
      const match = document.cookie.match(new RegExp('(^| )activePropertyId=([^;]+)'));
      if (match) {
        setActivePropertyId(match[2]);
      } else if (data.length > 0) {
        // Default to first property if no cookie
        handleSelect(data[0].id);
      }
    }
  };

  const handleSelect = async (id) => {
    setActivePropertyId(id);
    setIsOpen(false);
    await switchProperty(id);
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await addProperty(formData);
    if (res.success) {
      setShowAddModal(false);
      fetchProperties();
    } else {
      alert("Failed to add property");
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
          <button className={styles.addItem} onClick={() => { setIsOpen(false); setShowAddModal(true); }}>
            <Plus size={16} /> Add New PG
          </button>
        </div>
      )}

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Add New Property</h3>
            <form onSubmit={handleAddProperty}>
              <div className={styles.inputGroup}>
                <label>Property Name</label>
                <input name="name" required placeholder="e.g. PG Sector 62" />
              </div>
              <div className={styles.inputGroup}>
                <label>Address</label>
                <input name="address" placeholder="e.g. 123 Main St" />
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
