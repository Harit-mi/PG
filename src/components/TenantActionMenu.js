"use client";

import { useState, useEffect } from "react";
import { Eye, Edit, Trash2, CalendarClock, ArrowRightLeft, LogOut, Receipt, FileText, X } from "lucide-react";
import ActionDropdown from "./ActionDropdown";
import { useRouter } from "next/navigation";
import EditTenantModal from "./EditTenantModal";
import { updateTenantStatusAndRoom, deleteTenant } from "@/app/actions";
import { supabase } from "@/utils/supabase";
import styles from "./Modal.module.css";

export default function TenantActionMenu({ tenant }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [showMoveOut, setShowMoveOut] = useState(false);
  const [showShift, setShowShift] = useState(false);
  const [showKyc, setShowKyc] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [kycFile, setKycFile] = useState(null);

  // Fetch rooms only when shifting room modal is opened
  useEffect(() => {
    if (showShift) {
      async function fetchRooms() {
        const { data } = await supabase
          .from("rooms")
          .select("room_number, type, status")
          .eq("property_id", tenant.property_id);
        if (data) {
          setRooms(data);
        }
      }
      fetchRooms();
    }
  }, [showShift, tenant.property_id]);

  const handleNoticePeriod = async () => {
    setLoading(true);
    const res = await updateTenantStatusAndRoom(tenant.id, "Notice Period", tenant.room_number);
    setLoading(false);
    if (res.success) {
      setShowNotice(false);
      router.refresh();
    } else {
      alert(res.error || "Failed to mark notice period");
    }
  };

  const handleMoveOut = async () => {
    setLoading(true);
    // Vacates the room by setting room_number to null, status to Past
    const res = await updateTenantStatusAndRoom(tenant.id, "Past", null);
    setLoading(false);
    if (res.success) {
      setShowMoveOut(false);
      router.refresh();
    } else {
      alert(res.error || "Failed to mark move out");
    }
  };

  const handleShiftRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateTenantStatusAndRoom(tenant.id, tenant.status, selectedRoom || null);
    setLoading(false);
    if (res.success) {
      setShowShift(false);
      router.refresh();
    } else {
      alert(res.error || "Failed to shift room");
    }
  };

  const handleKycUpload = async (e) => {
    e.preventDefault();
    if (!kycFile) return;
    setLoading(true);

    const fileExt = kycFile.name.split('.').pop();
    const fileName = `${tenant.id}_${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, kycFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('tenants')
        .update({ document_url: publicUrl })
        .eq('id', tenant.id);

      if (updateError) throw updateError;

      setShowKyc(false);
      setKycFile(null);
      router.refresh();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async () => {
    setLoading(true);
    const res = await deleteTenant(tenant.id);
    setLoading(false);
    if (res.success) {
      setShowDelete(false);
      router.refresh();
    } else {
      alert(res.error || "Failed to delete tenant");
    }
  };

  const actions = [
    {
      label: "Edit Details",
      icon: <Edit size={14} />,
      onClick: () => setShowEdit(true)
    },
    {
      label: "Notice Period",
      icon: <CalendarClock size={14} />,
      onClick: () => setShowNotice(true)
    },
    {
      label: "Shift Room",
      icon: <ArrowRightLeft size={14} />,
      onClick: () => {
        setSelectedRoom(tenant.room_number || "");
        setShowShift(true);
      }
    },
    {
      label: "Move Out",
      icon: <LogOut size={14} />,
      onClick: () => setShowMoveOut(true)
    },
    {
      label: "Payment History",
      icon: <Receipt size={14} />,
      onClick: () => router.push(`/dashboard/dues?search=${encodeURIComponent(tenant.name)}`)
    },
    {
      label: "Documents",
      icon: <FileText size={14} />,
      onClick: () => setShowKyc(true)
    },
    {
      label: "Delete",
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => setShowDelete(true)
    }
  ];

  return (
    <>
      <ActionDropdown actions={actions} />
      
      {showEdit && (
        <EditTenantModal tenant={tenant} onClose={() => setShowEdit(false)} />
      )}

      {/* Notice Period Confirmation Modal */}
      {showNotice && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h2>Notice Period</h2>
              <button type="button" onClick={() => setShowNotice(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1rem', color: 'var(--foreground)' }}>
              <p>Are you sure you want to mark <strong>{tenant.name}</strong> as on Notice Period?</p>
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={() => setShowNotice(false)} className={styles.cancelBtn}>Cancel</button>
              <button type="button" disabled={loading} onClick={handleNoticePeriod} className={styles.submitBtn}>
                {loading ? "Updating..." : "Confirm Notice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Out Confirmation Modal */}
      {showMoveOut && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h2>Move Out Tenant</h2>
              <button type="button" onClick={() => setShowMoveOut(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1rem', color: 'var(--foreground)' }}>
              <p>Are you sure you want to move out <strong>{tenant.name}</strong>?</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                This will set their status to <strong>Past</strong> and release their current bed (Room {tenant.room_number || 'N/A'}).
              </p>
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={() => setShowMoveOut(false)} className={styles.cancelBtn}>Cancel</button>
              <button type="button" disabled={loading} onClick={handleMoveOut} className={styles.submitBtn} style={{ background: 'var(--rust)' }}>
                {loading ? "Updating..." : "Confirm Move Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Room Modal */}
      {showShift && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`} style={{ maxWidth: '450px' }}>
            <div className={styles.modalHeader}>
              <h2>Shift Room: {tenant.name}</h2>
              <button type="button" onClick={() => setShowShift(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleShiftRoom}>
              <div style={{ padding: '1.25rem' }}>
                <div className={styles.formGroup}>
                  <label>Select New Room Assignment</label>
                  <select 
                    value={selectedRoom} 
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className={styles.input}
                    required
                  >
                    <option value="">-- Unassigned --</option>
                    {rooms.map(r => (
                      <option key={r.room_number} value={r.room_number}>
                        Room {r.room_number} ({r.type}) - {r.status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={() => setShowShift(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Updating..." : "Shift Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents/KYC Modal */}
      {showKyc && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`} style={{ maxWidth: '450px' }}>
            <div className={styles.modalHeader}>
              <h2>KYC Documents: {tenant.name}</h2>
              <button type="button" onClick={() => setShowKyc(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleKycUpload} style={{ padding: '1.25rem' }}>
              {tenant.document_url && (
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>A document is already uploaded on file.</p>
                  <a 
                    href={tenant.document_url} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                  >
                    <FileText size={14} /> View Current Proof
                  </a>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Upload New ID Proof (PDF, JPG, PNG)</label>
                <input 
                  type="file" 
                  accept=".pdf,image/png,image/jpeg"
                  required={!tenant.document_url}
                  onChange={(e) => setKycFile(e.target.files[0])}
                  className={styles.input}
                  style={{ padding: '0.5rem' }}
                />
              </div>
              <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowKyc(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={loading || (!kycFile && !tenant.document_url)} className={styles.submitBtn}>
                  {loading ? "Saving..." : "Save Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h2>Delete Tenant</h2>
              <button type="button" onClick={() => setShowDelete(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1rem', color: 'var(--foreground)' }}>
              <p>Are you sure you want to permanently delete <strong>{tenant.name}</strong>?</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--danger)', marginTop: '0.5rem' }}>
                Warning: This action is permanent and cannot be undone.
              </p>
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={() => setShowDelete(false)} className={styles.cancelBtn}>Cancel</button>
              <button type="button" disabled={loading} onClick={handleDeleteTenant} className={styles.submitBtn} style={{ background: 'var(--danger)' }}>
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
