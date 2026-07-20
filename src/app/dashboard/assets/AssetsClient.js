"use client";

import { useState } from "react";
import FAIcon from "@/components/FAIcon";
import { addRoomAsset, updateRoomAssetStatus, deleteRoomAsset } from "@/app/actions";
import styles from "./AssetsClient.module.css";

export default function AssetsClient({ propertyId, rooms = [], initialAssets = [] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  
  // Add Asset Form States
  const [newAssetName, setNewAssetName] = useState("AC 1.5 Ton");
  const [customAssetName, setCustomAssetName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [assetStatus, setAssetStatus] = useState("Working");
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Group assets by room
  const getRoomAssets = (roomId) => {
    return assets.filter(a => a.room_id === roomId);
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      alert("Please select a room to add the asset to.");
      return;
    }

    const finalName = newAssetName === "Other" ? customAssetName : newAssetName;
    if (!finalName.trim()) {
      alert("Please specify the asset name.");
      return;
    }

    setAdding(true);
    try {
      const res = await addRoomAsset(propertyId, selectedRoomId, finalName, serialNumber, assetStatus);
      if (res.success) {
        alert("Asset added successfully!");
        setSerialNumber("");
        setCustomAssetName("");
        window.location.reload();
      } else {
        alert(res.error || "Failed to add asset.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setAdding(false);
    }
  };

  const handleStatusChange = async (assetId, newStatus) => {
    setUpdatingId(assetId);
    try {
      const res = await updateRoomAssetStatus(assetId, newStatus);
      if (res.success) {
        setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: newStatus } : a));
      } else {
        alert(res.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!confirm("Are you sure you want to remove this asset?")) return;
    setUpdatingId(assetId);
    try {
      const res = await deleteRoomAsset(assetId);
      if (res.success) {
        setAssets(prev => prev.filter(a => a.id !== assetId));
      } else {
        alert(res.error || "Failed to delete asset.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Find active room number
  const activeRoom = rooms.find(r => r.id === selectedRoomId);

  return (
    <div className={styles.container}>
      
      {/* Rooms Sidebar list */}
      <div className={styles.roomsSidebar}>
        <h3>Rooms List</h3>
        {rooms.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No rooms created yet.</p>
        ) : (
          <div className={styles.roomsList}>
            {rooms.map(room => {
              const roomAssets = getRoomAssets(room.id);
              const brokenCount = roomAssets.filter(a => a.status === 'Broken' || a.status === 'Needs Repair').length;
              const isSelected = selectedRoomId === room.id;

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`${styles.roomBtn} ${isSelected ? styles.roomBtnSelected : styles.roomBtnUnselected}`}
                >
                  <span style={{ fontWeight: 600 }}>Room {room.room_number}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', opacity: isSelected ? 0.9 : 0.7 }}>
                      {roomAssets.length} items
                    </span>
                    {brokenCount > 0 && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }} title={`${brokenCount} issue(s)`}></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Assets Audit section */}
      <div className={styles.mainColumn}>
        
        {!selectedRoomId ? (
          <div className="dashboard-card glass" style={{ background: 'var(--card-bg)', padding: '4rem 2rem', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FAIcon icon="box" style={{ fontSize: '48px', margin: '0 auto 1.5rem', opacity: 0.5, display: 'block' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--primary)', marginBottom: '0.5rem' }}>Select a Room to Audit Assets</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Choose a room from the left sidebar to audit its geysers, ACs, tables, and geyser logs.</p>
          </div>
        ) : (
          <>
            {/* Active Audit Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                Inventory for Room {activeRoom?.room_number}
              </h2>
            </div>

            {/* Room Assets list */}
            <div className="dashboard-card glass" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              {getRoomAssets(selectedRoomId).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', margin: 0, fontSize: '0.9rem' }}>
                  No assets assigned to Room {activeRoom?.room_number} yet. Add one below!
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th style={{ padding: '0.5rem 1rem', color: 'var(--primary)', fontWeight: 650 }}>Asset Name</th>
                        <th style={{ padding: '0.5rem 1rem', color: 'var(--primary)', fontWeight: 650 }}>Serial Number</th>
                        <th style={{ padding: '0.5rem 1rem', color: 'var(--primary)', fontWeight: 650 }}>Audit Status</th>
                        <th style={{ padding: '0.5rem 1rem', color: 'var(--primary)', fontWeight: 650, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRoomAssets(selectedRoomId).map(asset => {
                        let statusColor = "var(--success)";
                        if (asset.status === 'Needs Repair') statusColor = "var(--warning)";
                        if (asset.status === 'Broken') statusColor = "var(--danger)";

                        return (
                          <tr key={asset.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '1rem', fontWeight: 600 }}>{asset.name}</td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{asset.serial_number || "N/A"}</td>
                            <td style={{ padding: '1rem' }}>
                              <select
                                disabled={updatingId === asset.id}
                                value={asset.status}
                                onChange={(e) => handleStatusChange(asset.id, e.target.value)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  background: 'var(--card-bg)',
                                  border: `1px solid ${statusColor}`,
                                  color: statusColor,
                                  fontWeight: 600,
                                  outline: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="Working" style={{ color: 'var(--success)' }}>Working</option>
                                <option value="Needs Repair" style={{ color: 'var(--warning)' }}>Needs Repair</option>
                                <option value="Broken" style={{ color: 'var(--danger)' }}>Broken</option>
                              </select>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <button
                                disabled={updatingId === asset.id}
                                onClick={() => handleDeleteAsset(asset.id)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px' }}
                                title="Remove Item"
                              >
                                <FAIcon icon="trash-can" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Add Asset Form */}
            <div className="dashboard-card glass" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 650, margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FAIcon icon="plus" style={{ color: 'var(--primary)' }} /> Add New Asset to Room {activeRoom?.room_number}
              </h3>
              <form onSubmit={handleAddAsset} className={styles.formGrid}>
                <div className={styles.formField}>
                  <label>Asset Category</label>
                  <select
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                  >
                    <option value="AC 1.5 Ton">AC 1.5 Ton</option>
                    <option value="Geyser 15L">Geyser 15L</option>
                    <option value="Ceiling Fan">Ceiling Fan</option>
                    <option value="Study Desk & Chair">Study Desk & Chair</option>
                    <option value="Single Wooden Bed">Single Wooden Bed</option>
                    <option value="Steel Wardrobe">Steel Wardrobe</option>
                    <option value="Other">Other (Specify Name)</option>
                  </select>
                </div>

                {newAssetName === "Other" && (
                  <div className={styles.formField}>
                    <label>Specify Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Microwave"
                      value={customAssetName}
                      onChange={(e) => setCustomAssetName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className={styles.formField}>
                  <label>Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-98213A"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                  />
                </div>

                <div className={styles.formField}>
                  <label>Initial Status</label>
                  <select
                    value={assetStatus}
                    onChange={(e) => setAssetStatus(e.target.value)}
                  >
                    <option value="Working">Working</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Broken">Broken</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={adding}
                  className={styles.submitBtn}
                >
                  <FAIcon icon="plus" /> {adding ? "Adding..." : "Add"}
                </button>
              </form>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
