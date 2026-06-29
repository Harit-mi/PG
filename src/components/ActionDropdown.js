"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import styles from "./ActionDropdown.module.css";

export default function ActionDropdown({ actions }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button 
        className={styles.triggerBtn} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Actions"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className={`${styles.dropdown} glass`}>
          {actions.map((action, index) => (
            <button
              key={index}
              className={`${styles.actionItem} ${action.danger ? styles.danger : ''}`}
              onClick={() => {
                setIsOpen(false);
                if (action.onClick) action.onClick();
              }}
            >
              {action.icon && <span className={styles.icon}>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
