"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";
import styles from "./ActionDropdown.module.css";

export default function ActionDropdown({ actions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on scroll to prevent detached positioning
  useEffect(() => {
    function handleScroll() {
      setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen]);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.right - 180, // aligned to the right edge of trigger, width is 180px
      });
    }
    setIsOpen(!isOpen);
  };

  const dropdownMenuContent = isOpen && (
    <div 
      className={styles.portalDropdown} 
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: "180px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {actions.map((action, index) => (
        <button
          key={index}
          className={`${styles.actionItem} ${action.danger ? styles.danger : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
            if (action.onClick) action.onClick();
          }}
        >
          {action.icon && <span className={styles.icon}>{action.icon}</span>}
          {action.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <button 
        ref={triggerRef}
        className={styles.triggerBtn} 
        onClick={toggleDropdown}
        aria-label="Actions"
      >
        <MoreVertical size={18} />
      </button>

      {mounted && createPortal(dropdownMenuContent, document.body)}
    </div>
  );
}
