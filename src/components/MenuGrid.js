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
    setLoading(true);
    const menusArray = Object.values(menus).map(m => ({
      ...m,
      week_start_date: weekStartDate
    }));
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
      alert(res.error);
    } else {
      // Reload page to fetch new data
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button 
          onClick={handleCopy} 
          disabled={copyLoading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--border)', 
            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
          }}
        >
          <Copy size={16} /> {copyLoading ? "Copying..." : "Copy Previous Week"}
        </button>
        <button 
          onClick={handleSave} 
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: 'var(--accent)', color: 'white', border: 'none', 
            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
          }}
        >
          <Save size={16} /> {loading ? "Saving..." : "Save Menu"}
        </button>
      </div>

      <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 500 }}>Day</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 500 }}>Breakfast</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 500 }}>Lunch</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 500 }}>Evening Snack</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 500 }}>Dinner</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{day}</td>
                {["breakfast", "lunch", "evening_snack", "dinner"].map(meal => (
                  <td key={meal} style={{ padding: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={menus[day][meal] || ""}
                      onChange={(e) => handleInputChange(day, meal, e.target.value)}
                      placeholder={`Enter ${meal.replace('_', ' ')}`}
                      style={{ 
                        width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)'
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
