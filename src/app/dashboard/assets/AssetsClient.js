"use client";

import { useState } from "react";
import { Package, Plus, Trash2, CheckCircle, AlertTriangle, XCircle, Wrench, X } from "lucide-react";
import { addRoomAsset, updateRoomAssetStatus, deleteRoomAsset } from "@/app/actions";

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
        // Reload all assets to get the new list with generated UUIDs
        // Or simply refetch, but since we revalidated path, a reload or simple local push is fine
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
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
      
      {/* Rooms Sidebar list */}
      <div className="dashboard-card glass" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>Rooms list</h3>
        {rooms.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No rooms created yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {rooms.map(room => {
              const roomAssets = getRoomAssets(room.id);
              const brokenCount = roomAssets.filter(a => a.status === 'Broken' || a.status === 'Needs Repair').length;
              const isSelected = selectedRoomId === room.id;

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    color: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Room {room.room_number}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{roomAssets.length} items</span>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {!selectedRoomId ? (
          <div className="dashboard-card glass" style={{ background: 'rgba(255,255,255,0.02)', padding: '4rem 2rem', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>Select a Room to Audit Assets</h3>
            <p style={{ margin: 0 }}>Choose a room from the left sidebar to audit its geysers, ACs, tables, and geyser logs.</p>
          </div>
        ) : (
          <>
            {/* Active Audit Title & Add Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                Inventory for Room {activeRoom?.room_number}
              </h2>
            </div>

            {/* Room Assets list */}
            <div className="dashboard-card glass" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              {getRoomAssets(selectedRoomId).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', margin: 0, fontSize: '0.9rem' }}>
                  No assets assigned to Room {activeRoom?.room_number} yet. Add one below!
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Asset Name</th>
                        <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Serial Number</th>
                        <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Audit Status</th>
                        <th style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
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
                                  background: 'rgba(0,0,0,0.2)',
                                  border: `1px solid ${statusColor}`,
                                  color: statusColor,
                                  fontWeight: 600,
                                  outline: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="Working" style={{ background: '#1e293b', color: 'var(--success)' }}>Working</option>
                                <option value="Needs Repair" style={{ background: '#1e293b', color: 'var(--warning)' }}>Needs Repair</option>
                                <option value="Broken" style={{ background: '#1e293b', color: 'var(--danger)' }}>Broken</option>
                              </select>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <button
                                disabled={updatingId === asset.id}
                                onClick={() => handleDeleteAsset(asset.id)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                title="Remove Item"
                              >
                                <Trash2 size={16} />
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
            <div className="dashboard-card glass" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={18} /> Add New Asset to Room {activeRoom?.room_number}
              </h3>
              <form onSubmit={handleAddAsset} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Asset Category</label>
                  <select
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                  >
                    <option value="AC 1.5 Ton" style={{ background: '#1e293b' }}>AC 1.5 Ton</option>
                    <option value="Geyser 15L" style={{ background: '#1e293b' }}>Geyser 15L</option>
                    <option value="Ceiling Fan" style={{ background: '#1e293b' }}>Ceiling Fan</option>
                    <option value="Study Desk & Chair" style={{ background: '#1e293b' }}>Study Desk & Chair</option>
                    <option value="Single Wooden Bed" style={{ background: '#1e293b' }}>Single Wooden Bed</option>
                    <option value="Steel Wardrobe" style={{ background: '#1e293b' }}>Steel Wardrobe</option>
                    <option value="Other" style={{ background: '#1e293b' }}>Other (Specify Name)</option>
                  </select>
                </div>

                {newAssetName === "Other" && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Specify Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Microwave"
                      value={customAssetName}
                      onChange={(e) => setCustomAssetName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-98213A"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Initial Status</label>
                  <select
                    value={assetStatus}
                    onChange={(e) => setAssetStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                  >
                    <option value="Working" style={{ background: '#1e293b' }}>Working</option>
                    <option value="Needs Repair" style={{ background: '#1e293b' }}>Needs Repair</option>
                    <option value="Broken" style={{ background: '#1e293b' }}>Broken</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={adding}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: adding ? 0.7 : 1,
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={16} /> {adding ? "Adding..." : "Add"}
                </button>
              </form>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
