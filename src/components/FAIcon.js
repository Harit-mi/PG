"use client";

export default function FAIcon({ icon, className = "", style = {} }) {
  if (!icon) return null;
  const isFullClass = icon.startsWith("fa-");
  const iconClass = isFullClass ? icon : `fa-solid fa-${icon}`;
  
  return (
    <i 
      className={`${iconClass} ${className}`} 
      style={style} 
      aria-hidden="true" 
    />
  );
}
