"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: "56px", height: "30px", borderRadius: "30px", background: "rgba(128,128,128,0.1)" }} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button 
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      style={{
        position: "relative",
        width: "56px",
        height: "30px",
        borderRadius: "30px",
        background: isDark ? "#1E293B" : "#DBEAFE",
        border: isDark ? "1px solid #334155" : "1px solid #BFDBFE",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        transition: "background 0.4s ease, border 0.4s ease",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
        overflow: "hidden",
        flexShrink: 0
      }}
      aria-label="Toggle Dark Mode"
    >
      {/* Background Icons */}
      <div style={{
        position: "absolute",
        left: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: isDark ? 0 : 1,
        transition: "opacity 0.4s ease",
        color: "#F59E0B"
      }}>
        <Sun size={14} fill="currentColor" />
      </div>
      <div style={{
        position: "absolute",
        right: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: isDark ? 1 : 0,
        transition: "opacity 0.4s ease",
        color: "#E2E8F0"
      }}>
        <Moon size={14} fill="currentColor" />
      </div>

      {/* Sliding Thumb */}
      <div style={{
        position: "absolute",
        top: "2px",
        left: "2px",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        background: "#FFFFFF",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        transform: isDark ? "translateX(28px)" : "translateX(0)",
        transition: "transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {isDark ? (
          <Moon size={12} color="#0F172A" fill="currentColor" />
        ) : (
          <Sun size={12} color="#F59E0B" fill="currentColor" />
        )}
      </div>
    </button>
  );
}
