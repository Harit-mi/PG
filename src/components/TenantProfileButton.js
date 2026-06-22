"use client";

import { useState } from "react";
import { User, X, MapPin, Phone, Briefcase } from "lucide-react";
import styles from "./Modal.module.css";

export default function TenantProfileButton({ tenant }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className={styles.actionBtn} 
        onClick={() => setIsOpen(true)}
        title="View Profile"
        style={{ color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
      >
        <User size={18} />
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2>Tenant Profile</h2>
              <button type="button" onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{tenant.name}</h3>
                <p style={{ color: 'var(--text-muted)' }}>Room: {tenant.room_number || 'Unassigned'} | Status: {tenant.status}</p>
                {tenant.blood_group && <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.8rem' }}>Blood Group: {tenant.blood_group}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Phone size={18} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: '500' }}>Contact Info</p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{tenant.phone}</p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Emergency: {tenant.emergency_contact || 'N/A'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <User size={18} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: '500' }}>Parent Details</p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Name: {tenant.father_mother_name || 'N/A'}</p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contact: {tenant.parent_contact_number || 'N/A'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <MapPin size={18} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: '500' }}>Permanent Address</p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{tenant.permanent_address || 'Not provided'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Briefcase size={18} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: '500' }}>Workplace / College</p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{tenant.workplace_details || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
