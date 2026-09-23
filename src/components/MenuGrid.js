"use client";

import { useState } from "react";
import { Copy, Save } from "lucide-react";
import { saveMenu, copyPreviousWeekMenu } from "@/app/actions";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MenuGrid({ initialMenus, weekStartDate }) {
  const [menus, setMenus] = useState(() => {
    // Initialize with data or empty strings
    const grid = {};
    DAYS.forEach(day => {
      const existing = initialMenus.find(m => m.day_of_week === day);
      grid[day] = existing || { day_of_week: day, breakfast: "", lunch: "", evening_snack: "", dinner: "" };
    });
    return grid;
  });

  const [loading, setLoading] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);

  const handleInputChange = (day, meal, value) => {
    setMenus(prev => ({
      ...prev,
      [day]: { ...prev[day], [meal]: value }
    }));
  };

  const handleSave = async () => {
    const menusArray = Object.values(menus).map(m => ({
      ...m,
      week_start_date: weekStartDate
    }));

    // Check if at least one meal is entered
    const isEmpty = menusArray.every(m => 
      !m.breakfast?.trim() && !m.lunch?.trim() && !m.evening_snack?.trim() && !m.dinner?.trim()
    );

    if (isEmpty) {
      alert("Cannot save an entirely empty menu. Please add at least one meal.");
      return;
    }

    setLoading(true);
    const res = await saveMenu(menusArray);
    setLoading(false);
    if (!res.success) {
      alert("Error saving menu: " + res.error);
    } else {
      alert("Menu saved successfully!");
    }
  };

  const handleCopy = async () => {
    setCopyLoading(true);
    const res = await copyPreviousWeekMenu(weekStartDate);
    setCopyLoading(false);
    if (!res.success) {
      alert("Error copying menu: " + res.error);
    } else {
      alert("Copied successfully!");
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button 
          onClick={handleCopy} 
          disabled={copyLoading}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem', 
            background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', 
            padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
            fontSize: '0.83rem', boxShadow: '0 1px 2px rgba(15,23,42,0.04)'
          }}
        >
          <Copy size={15} /> {copyLoading ? "Copying..." : "Copy Previous Week"}
        </button>
        <button 
          onClick={handleSave} 
          disabled={loading}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem', 
            background: '#2563EB', color: '#FFFFFF', border: '1px solid transparent', 
            padding: '0.55rem 1.15rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
            fontSize: '0.83rem', boxShadow: '0 1px 3px rgba(37,99,235,0.25)'
          }}
        >
          <Save size={15} /> {loading ? "Saving..." : "Save Menu"}
        </button>
      </div>

      <div style={{ overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', boxShadow: 'var(--cst-shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 650, fontSize: '0.72rem', textTransform: 'uppercase' }}>Day</th>
              <th style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 650, fontSize: '0.72rem', textTransform: 'uppercase' }}>Breakfast</th>
              <th style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 650, fontSize: '0.72rem', textTransform: 'uppercase' }}>Lunch</th>
              <th style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 650, fontSize: '0.72rem', textTransform: 'uppercase' }}>Evening Snack</th>
              <th style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 650, fontSize: '0.72rem', textTransform: 'uppercase' }}>Dinner</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 700, color: '#0F172A' }}>{day}</td>
                {["breakfast", "lunch", "evening_snack", "dinner"].map(meal => (
                  <td key={meal} style={{ padding: '0.5rem 0.75rem' }}>
                    <input 
                      type="text" 
                      value={menus[day][meal] || ""}
                      onChange={(e) => handleInputChange(day, meal, e.target.value)}
                      placeholder={`Enter ${meal.replace('_', ' ')}`}
                      style={{ 
                        width: '100%', padding: '0.5rem 0.65rem', background: '#FFFFFF', 
                        border: '1px solid #E2E8F0', borderRadius: '6px', color: '#0F172A',
                        fontSize: '0.85rem'
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
