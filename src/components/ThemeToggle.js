"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height: "35px", marginTop: "1rem" }} />;
  }

  return (
    <button 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{
        background: "rgba(128,128,128,0.1)", color: "var(--foreground)", border: "1px solid rgba(128,128,128,0.2)",
        padding: "8px 12px", borderRadius: "10px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 600,
        marginTop: "1rem", width: "100%", justifyContent: "center",
        transition: "all 0.2s ease"
      }}
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
