"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  MessageSquareText, 
  Loader2, 
  Bot, 
  BedDouble,
  ChevronDown,
  SendHorizontal,
  Star,
  X,
  ShieldCheck,
  CheckCircle2,
  Sun,
  Moon,
  Activity,
  Terminal,
  Cpu,
  Radio
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { registerOwnerAccount } from "@/app/actions";
import styles from "./page.module.css";

const supabase = createClient();

export default function LandingPage() {
  const router = useRouter();

  // Dark / Light Theme State (Default Dark for Cyber-Architectural aesthetic)
  const [theme, setTheme] = useState("dark");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ourpg_theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }

    // Live Bangalore IST Clock
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      setCurrentTime(timeStr);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("ourpg_theme", nextTheme);
  };

  // Modal Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Login Form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register Form
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPgName, setRegPgName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Interactive Product Showcase State
  const [activeShowcaseTab, setActiveShowcaseTab] = useState("radar"); // 'radar' | 'whatsapp' | 'copilot'
  const [activeFloor, setActiveFloor] = useState(1);
  const [inspectedBed, setInspectedBed] = useState(null);

  // WhatsApp Phone Simulator State
  const [whatsappPaid, setWhatsappPaid] = useState(false);

  // Gemini 3.5 Copilot State inside showcase
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [copilotResponse, setCopilotResponse] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Simplified ROI Calculator State
  const [calcBeds, setCalcBeds] = useState(80);
  const [calcRent, setCalcRent] = useState(8500);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Open Auth Modal
  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthError("");
    setAuthSuccess("");
    setIsAuthOpen(true);
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setAuthError("Email verification pending. Please verify your email or contact support.");
        } else {
          setAuthError(error.message || "Invalid credentials.");
        }
        setAuthLoading(false);
        return;
      }

      const user = data.user;
      const orgId = user?.user_metadata?.organization_id;

      if (orgId) {
        const { data: org, error: orgErr } = await supabase
          .from("organizations")
          .select("status")
          .eq("id", orgId)
          .single();

        if (!orgErr && org && org.status !== "Active") {
          await supabase.auth.signOut();
          setAuthError(`Your account status is currently "${org.status}".`);
          setAuthLoading(false);
          return;
        }
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setAuthError("An unexpected error occurred during login.");
      setAuthLoading(false);
    }
  };

  // Handle Register (New Owner Credential Creation)
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    if (regPassword !== regConfirmPassword) {
      setAuthError("Passwords do not match.");
      setAuthLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      setAuthLoading(false);
      return;
    }

    try {
      const res = await registerOwnerAccount({
        name: regName,
        phone: regPhone,
        pgName: regPgName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword
      });

      if (!res.success) {
        setAuthError(res.error || "Failed to create account. Please verify details.");
        setAuthLoading(false);
        return;
      }

      setAuthSuccess("Workspace provisioned! Initializing command deck...");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: regEmail.trim(),
        password: regPassword
      });

      if (signInError) {
        setAuthSuccess("Workspace created! Please enter credentials to sign in.");
        setAuthMode("login");
        setLoginEmail(regEmail);
        setAuthLoading(false);
        return;
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);

    } catch (err) {
      console.error("Registration error:", err);
      setAuthError("Could not complete registration. Please try again.");
      setAuthLoading(false);
    }
  };

  // Run Gemini Copilot in showcase demo
  const handleRunCopilot = async (overridePrompt) => {
    const query = overridePrompt || copilotPrompt;
    if (!query.trim()) return;

    setCopilotLoading(true);
    setCopilotResponse("");

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query, type: "whatsapp_reminder" })
      });

      const data = await res.json();
      if (data.success && data.text) {
        setCopilotResponse(data.text);
      } else {
        setCopilotResponse(data.error || "Could not generate response.");
      }
    } catch (err) {
      setCopilotResponse("Network error communicating with Gemini 3.5.");
    } finally {
      setCopilotLoading(false);
    }
  };

  // Calculate ROI
  const monthlyGross = calcBeds * calcRent;
  const vacancyLoss = Math.round(monthlyGross * 0.12);
  const lateRentLeak = Math.round(monthlyGross * 0.035);
  const totalMonthlyLoss = vacancyLoss + lateRentLeak;
  const recoveredMonthly = Math.round(totalMonthlyLoss * 0.76);
  const recoveredAnnual = recoveredMonthly * 12;

  // Floor room layout data
  const floorRooms = {
    1: [
      { number: "Room 101", type: "Triple Sharing AC", beds: [{ id: "101-A", label: "Bed A", occupant: "Rahul S.", status: "occupied", rent: 8500 }, { id: "101-B", label: "Bed B", occupant: "Sneha R.", status: "occupied", rent: 8500 }, { id: "101-C", label: "Bed C", occupant: null, status: "vacant", rent: 8500 }] },
      { number: "Room 102", type: "Double Sharing AC", beds: [{ id: "102-A", label: "Bed A", occupant: "Aditya V.", status: "occupied", rent: 9500 }, { id: "102-B", label: "Bed B", occupant: "Karan M.", status: "occupied", rent: 9500 }] },
      { number: "Room 103", type: "Single Deluxe AC", beds: [{ id: "103-A", label: "Bed A", occupant: null, status: "vacant", rent: 14000 }] },
      { number: "Room 104", type: "Double Sharing Non-AC", beds: [{ id: "104-A", label: "Bed A", occupant: "Pooja D.", status: "occupied", rent: 7500 }, { id: "104-B", label: "Bed B", occupant: null, status: "vacant", rent: 7500 }] }
    ],
    2: [
      { number: "Room 201", type: "Double Sharing Executive", beds: [{ id: "201-A", label: "Bed A", occupant: "Rohan J.", status: "occupied", rent: 10500 }, { id: "201-B", label: "Bed B", occupant: "Ankit P.", status: "occupied", rent: 10500 }] },
      { number: "Room 202", type: "Triple Sharing AC", beds: [{ id: "202-A", label: "Bed A", occupant: "Varun K.", status: "occupied", rent: 8500 }, { id: "202-B", label: "Bed B", occupant: null, status: "vacant", rent: 8500 }, { id: "202-C", label: "Bed C", occupant: "Mohit S.", status: "occupied", rent: 8500 }] },
      { number: "Room 203", type: "Single Deluxe Balcony", beds: [{ id: "203-A", label: "Bed A", occupant: "Dr. Arvind", status: "occupied", rent: 15500 }] }
    ],
    3: [
      { number: "Room 301", type: "Terrace Suite Double", beds: [{ id: "301-A", label: "Bed A", occupant: "Nikhil T.", status: "occupied", rent: 12000 }, { id: "301-B", label: "Bed B", occupant: "Gaurav R.", status: "occupied", rent: 12000 }] },
      { number: "Room 302", type: "Single Studio with Kitchenette", beds: [{ id: "302-A", label: "Bed A", occupant: null, status: "vacant", rent: 18000 }] }
    ]
  };

  const faqData = [
    {
      q: "Do I need special hardware or biometric devices to run OUR-PG?",
      a: "Zero hardware required. OUR-PG operates entirely on web protocols from any smartphone, tablet, or PC with instant real-time synchronization."
    },
    {
      q: "How does 1-Click WhatsApp rent collection work in practice?",
      a: "OUR-PG auto-generates branded WhatsApp payment invoices with individual tenant due breakdowns and embedded UPI payment links. Tenants click, pay with PhonePe/GPay, and their digital receipt is logged instantly."
    },
    {
      q: "Can you help me import data from my existing paper register or Excel?",
      a: "Yes. Simply snap photos of your physical register or send your Excel sheet to our WhatsApp concierge. Our team configures your entire workspace within 24 hours — completely free."
    },
    {
      q: "What is included in the 30-Day Free Pilot?",
      a: "You get full, unrestricted access to the Bed Sonar Radar, WhatsApp Collections, Digital Aadhaar KYC, Mess Food Headcount Tracker, and the Gemini 3.5 AI Copilot. No credit card required."
    }
  ];

  const scrollToShowcase = (tab) => {
    setActiveShowcaseTab(tab);
    const el = document.getElementById("showcase");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.landingWrapper} data-theme={theme}>
      {/* Background Cyber-Architectural Grid & Light Flares */}
      <div className={styles.gridPattern} />
      <div className={styles.flareEmerald} />
      <div className={styles.flareAmber} />

      {/* ====================================================================
          1. FLOATING HUD GLASS NAVBAR
          ==================================================================== */}
      <div className={styles.navbarContainer}>
        <header className={styles.navPill}>
          <Link href="/" className={styles.brandLogo}>
            <div className={styles.logoIconBadge}>
              <Cpu size={16} />
            </div>
            <span className={styles.brandName}>OUR-PG</span>
            <span className={styles.versionTag}>v3.5</span>
          </Link>

          <nav className={styles.navLinks}>
            <a href="#showcase" className={styles.navLink}>COMMAND DECK</a>
            <a href="#superpowers" className={styles.navLink}>CAPABILITIES</a>
            <a href="#concierge" className={styles.navLink}>WHITE-GLOVE SETUP</a>
            <a href="#calculator" className={styles.navLink}>MARGIN CALCULATOR</a>
            <a href="#faq" className={styles.navLink}>FAQ</a>
          </nav>

          <div className={styles.navActions}>
            {currentTime && (
              <div className={styles.liveClockPill}>
                <span className={styles.clockDot} />
                <span>BLR {currentTime}</span>
              </div>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className={styles.themeToggleBtn}
              aria-label="Toggle theme"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            <button 
              type="button" 
              onClick={() => openAuth("login")} 
              className={styles.btnGhost}
            >
              Sign In
            </button>
            <button 
              type="button" 
              onClick={() => openAuth("register")} 
              className={styles.btnPillPrimary}
            >
              <span>LAUNCH OS</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </header>
      </div>

      {/* ====================================================================
          2. THE HERO: KINETIC ARCHITECTURAL COMMAND
          ==================================================================== */}
      <section className={styles.heroSection}>
        <div className={styles.heroProtocolBadge}>
          <span className={styles.tickerPulse} />
          <span className={styles.protocolText}>SPATIAL OPERATING SYSTEM // 250+ HOSTEL NETWORKS ONLINE</span>
        </div>

        <h1 className={styles.heroTitle}>
          NO EMPTY BEDS.<br />
          <span className={styles.heroAccent}>TOTAL AUTOPILOT.</span>
        </h1>

        <p className={styles.heroSubtitle}>
          India&apos;s first cyber-physical hostel OS. Real-time empty bed sonar, zero-friction WhatsApp UPI collections, and Gemini 3.5 AI reasoning. Replace clumsy paper registers in 24 hours.
        </p>

        <div className={styles.heroCtaRow}>
          <button 
            type="button" 
            onClick={() => openAuth("register")} 
            className={styles.heroPrimaryBtn}
          >
            <span>ACTIVATE 30-DAY PILOT</span>
            <ArrowRight size={15} />
          </button>
          <button 
            type="button" 
            onClick={() => scrollToShowcase("radar")} 
            className={styles.btnGhostHero}
          >
            <span>EXPLORE SIMULATION ↓</span>
          </button>
        </div>

        {/* Live Telemetry Ticker Strip */}
        <div className={styles.telemetryBar}>
          <div className={styles.telemetryItem}>
            <span className={styles.telemetryDotEmerald} />
            <span className={styles.telemetryLabel}>BED OCCUPANCY:</span>
            <span className={styles.telemetryVal}>94.2%</span>
          </div>
          <span className={styles.telemetryDivider}>|</span>
          <div className={styles.telemetryItem}>
            <span className={styles.telemetryDotAmber} />
            <span className={styles.telemetryLabel}>UPI COLLECTED TODAY:</span>
            <span className={styles.telemetryVal}>₹4,85,200</span>
          </div>
          <span className={styles.telemetryDivider}>|</span>
          <div className={styles.telemetryItem}>
            <Activity size={13} color="#10B981" />
            <span className={styles.telemetryLabel}>REVENUE LEAKS:</span>
            <span className={styles.telemetryVal}>0 DETECTED</span>
          </div>
          <span className={styles.telemetryDivider}>|</span>
          <div className={styles.telemetryItem}>
            <Radio size={13} color="#F59E0B" />
            <span className={styles.telemetryLabel}>GEMINI 3.5 AI:</span>
            <span className={styles.telemetryVal}>ONLINE</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. THE CENTERPIECE: SPATIAL COMMAND CENTER
          ==================================================================== */}
      <div className={styles.showcaseSection} id="showcase">
        <div className={styles.chassisGlow} />
        <div className={styles.productShowcase}>
          {/* Hardware Window Bar */}
          <div className={styles.windowBar}>
            <div className={styles.windowDots}>
              <span className={`${styles.dot} ${styles.dotRed}`} />
              <span className={`${styles.dot} ${styles.dotYellow}`} />
              <span className={`${styles.dot} ${styles.dotGreen}`} />
            </div>
            <div className={styles.windowTitle}>
              <Lock size={11} />
              <span>app.ourpg.com/command-center/koramangala-hub</span>
            </div>
            <div className={styles.windowStatus}>
              <span className={styles.livePulse} />
              <span>SONAR ACTIVE // 14ms LATENCY</span>
            </div>
          </div>

          {/* Top Chassis Telemetry Bar */}
          <div className={styles.dashboardTopBar}>
            <div className={styles.outletSelector}>
              <div className={styles.outletIcon}>
                <Building2 size={20} />
              </div>
              <div>
                <h4 className={styles.outletName}>Royal Living Luxury Hub</h4>
                <p className={styles.outletLocation}>12.9352° N, 77.6245° E • Koramangala 4th Block, BLR</p>
              </div>
            </div>

            <div className={styles.kpiSummaryRow}>
              <div className={styles.kpiItem}>
                <span className={styles.kpiLabel}>TOTAL INVENTORY</span>
                <span className={`${styles.kpiValue} ${styles.kpiSuccess}`}>94% (47/50 BEDS)</span>
              </div>
              <div className={styles.kpiItem}>
                <span className={styles.kpiLabel}>MONTH COLLECTIONS</span>
                <span className={styles.kpiValue}>₹4,85,000</span>
              </div>
              <div className={styles.kpiItem}>
                <span className={styles.kpiLabel}>VACANT READY</span>
                <span className={styles.kpiValue} style={{ color: "#10B981" }}>3 SLOTS OPEN</span>
              </div>
            </div>
          </div>

          {/* Interactive Mode Selectors */}
          <div className={styles.showcaseTabs}>
            <button
              type="button"
              onClick={() => setActiveShowcaseTab("radar")}
              className={`${styles.showcaseTab} ${activeShowcaseTab === "radar" ? styles.tabActive : ""}`}
            >
              <BedDouble size={15} />
              <span>BED SONAR RADAR</span>
              <span className={styles.tabBadge}>ARCHITECTURAL</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveShowcaseTab("whatsapp")}
              className={`${styles.showcaseTab} ${activeShowcaseTab === "whatsapp" ? styles.tabActive : ""}`}
            >
              <MessageSquareText size={15} />
              <span>WHATSAPP AUTOPILOT</span>
              <span className={styles.tabBadge}>UPI RAILS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveShowcaseTab("copilot")}
              className={`${styles.showcaseTab} ${activeShowcaseTab === "copilot" ? styles.tabActive : ""}`}
            >
              <Bot size={15} />
              <span>GEMINI 3.5 COPILOT</span>
              <span className={styles.tabBadge}>AI ENGINE</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className={styles.showcaseBody}>
            {/* View 1: Bed Sonar Radar */}
            {activeShowcaseTab === "radar" && (
              <div>
                <div className={styles.floorNavRow}>
                  <div className={styles.floorTabs}>
                    <button 
                      className={`${styles.floorTabBtn} ${activeFloor === 1 ? styles.floorTabBtnActive : ""}`}
                      onClick={() => { setActiveFloor(1); setInspectedBed(null); }}
                    >
                      LEVEL 01 // GROUND
                    </button>
                    <button 
                      className={`${styles.floorTabBtn} ${activeFloor === 2 ? styles.floorTabBtnActive : ""}`}
                      onClick={() => { setActiveFloor(2); setInspectedBed(null); }}
                    >
                      LEVEL 02 // EXECUTIVE
                    </button>
                    <button 
                      className={`${styles.floorTabBtn} ${activeFloor === 3 ? styles.floorTabBtnActive : ""}`}
                      onClick={() => { setActiveFloor(3); setInspectedBed(null); }}
                    >
                      LEVEL 03 // TERRACE SUITE
                    </button>
                  </div>
                  <span className={styles.hudHelper}>
                    [ INTERACTION ]: Click any bed node to inspect occupant telemetry or check in.
                  </span>
                </div>

                <div className={styles.roomMatrixGrid}>
                  {floorRooms[activeFloor]?.map((room) => (
                    <div key={room.number} className={styles.roomCard}>
                      <div className={styles.cornerMarkerTL} />
                      <div className={styles.cornerMarkerTR} />
                      <div className={styles.roomHeader}>
                        <span className={styles.roomNumber}>{room.number}</span>
                        <span className={styles.roomType}>{room.type}</span>
                      </div>
                      <div className={styles.bedSlots}>
                        {room.beds.map((b) => (
                          <div
                            key={b.id}
                            className={`${styles.bedPill} ${b.status === "occupied" ? styles.bedOccupied : styles.bedVacant}`}
                            onClick={() => setInspectedBed({ ...b, room: room.number, roomType: room.type })}
                          >
                            <span>{b.label}</span>
                            <span style={{ fontSize: "0.62rem", opacity: 0.85 }}>
                              {b.status === "occupied" ? b.occupant : "VACANT"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {inspectedBed && (
                  <div className={styles.inspectedDrawer}>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)" }}>
                        {inspectedBed.room} • {inspectedBed.label} // {inspectedBed.roomType}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "3px" }}>
                        STATUS: <strong style={{ color: inspectedBed.status === "vacant" ? "#10B981" : "var(--accent)" }}>{inspectedBed.status.toUpperCase()}</strong> • RENT: ₹{inspectedBed.rent.toLocaleString("en-IN")}/mo
                        {inspectedBed.occupant && ` • RESIDENT: ${inspectedBed.occupant}`}
                      </div>
                    </div>
                    <button 
                      onClick={() => openAuth("register")} 
                      className={styles.btnPillPrimary}
                      style={{ padding: "0.5rem 1.25rem", fontSize: "0.82rem" }}
                    >
                      {inspectedBed.status === "vacant" ? "CHECK IN RESIDENT →" : "MANAGE LEASE →"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* View 2: WhatsApp Telemetry Smartphone Simulator */}
            {activeShowcaseTab === "whatsapp" && (
              <div className={styles.whatsappShowcaseWrap}>
                <div className={styles.phoneFrame}>
                  <div className={styles.phoneHeader}>
                    <div className={styles.phoneAvatar}>RS</div>
                    <div>
                      <h5 className={styles.phoneName}>Rahul Sharma (Rm 101)</h5>
                      <p className={styles.phoneSub}>OUR-PG AUTOMATION BOT // ENCRYPTED</p>
                    </div>
                  </div>

                  <div className={styles.phoneBody}>
                    <div className={styles.chatBubbleReceived}>
                      👋 Hi Rahul, your monthly dues for <strong>Room 101 (Bed A)</strong> at Royal Living Hub are ready.<br /><br />
                      💵 <strong>Total Outstanding: ₹8,500</strong><br />
                      📅 Due Date: 5th of this month<br /><br />
                      Tap below to pay via UPI (PhonePe / GPay / Paytm / BHIM).
                      <button
                        type="button"
                        onClick={() => setWhatsappPaid(true)}
                        className={styles.upiPayBtn}
                      >
                        {whatsappPaid ? "✓ ₹8,500 CONFIRMED VIA PHONEPE" : "⚡ PAY ₹8,500 VIA 1-CLICK UPI"}
                      </button>
                    </div>

                    {whatsappPaid && (
                      <div className={styles.chatBubbleSent}>
                        ✅ UPI Transaction Verified (Ref: #TXN-984210). Thank you Rahul! Digital GST Tax Receipt <strong>#REC-8492</strong> logged into your tenant portal.
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.waExplanation}>
                  <div className={styles.hudSubBadge}>// ZERO FRICTION PAYMENT RAILS</div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.55rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.75rem", letterSpacing: "-0.03em" }}>
                    Automate 98% of rent collections directly on WhatsApp.
                  </h3>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "1.5rem" }}>
                    Tenants refuse to install third-party tenant apps. By routing invoices directly to WhatsApp with pre-filled UPI intent QR links, 85% of dues are cleared within 24 hours.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.86rem", color: "var(--text-primary)" }}>
                      <CheckCircle2 size={16} color="#10B981" />
                      <span>Direct bank settlements via PhonePe &amp; Razorpay</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.86rem", color: "var(--text-primary)" }}>
                      <CheckCircle2 size={16} color="#10B981" />
                      <span>Automated GST invoice generated with police registry audit</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View 3: Gemini 3.5 AI Copilot Terminal */}
            {activeShowcaseTab === "copilot" && (
              <div className={styles.copilotContainer}>
                <div className={styles.copilotHeader}>
                  <div>
                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: "700", margin: 0, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                      Gemini 3.5 Flash Lite Terminal
                    </h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "3px 0 0" }}>
                      Instant natural language generation, notices, dispute draft, and financial reasoning.
                    </p>
                  </div>
                  <span className={styles.copilotModelBadge}>
                    <Sparkles size={13} />
                    <span>GEMINI 3.5 FLASH LITE</span>
                  </span>
                </div>

                <div className={styles.copilotChips}>
                  <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "var(--font-mono-stack)" }}>[ QUICK PROMPTS ]:</span>
                  {[
                    "Draft 3-day polite rent reminder for Rahul",
                    "Calculate grocery budget per bed for 60 tenants",
                    "Draft notice: Strict 10 PM visitor entry rules"
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setCopilotPrompt(p); handleRunCopilot(p); }}
                      className={styles.chipBtn}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className={styles.copilotInputRow}>
                  <Terminal size={16} color="var(--accent)" style={{ marginLeft: "0.25rem" }} />
                  <input
                    type="text"
                    value={copilotPrompt}
                    onChange={(e) => setCopilotPrompt(e.target.value)}
                    placeholder="Type a command or ask Gemini AI (e.g. Draft strict notice for late dues in Hindi/English)..."
                    className={styles.copilotInput}
                    onKeyDown={(e) => e.key === "Enter" && handleRunCopilot()}
                  />
                  <button
                    type="button"
                    onClick={() => handleRunCopilot()}
                    disabled={copilotLoading}
                    className={styles.copilotSendBtn}
                  >
                    {copilotLoading ? <Loader2 size={15} className="spin" /> : <SendHorizontal size={15} />}
                  </button>
                </div>

                {copilotResponse && (
                  <div className={styles.copilotResult}>
                    {copilotResponse}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          FEATURE MARQUEE RIBBON
          ==================================================================== */}
      <div className={styles.marqueeStrip}>
        <div className={styles.marqueeTrack}>
          {[
            "BED SONAR RADAR",
            "1-CLICK WHATSAPP DUES",
            "UIDAI AADHAAR TELEMETRY",
            "MULTI-BRANCH COMMAND",
            "GEMINI 3.5 AI COPILOT",
            "PHONEPE AUTO-SETTLEMENT",
            "MESS HEADCOUNT PROTOCOL",
            "24-HOUR WHITE-GLOVE DEPLOY"
          ].concat([
            "BED SONAR RADAR",
            "1-CLICK WHATSAPP DUES",
            "UIDAI AADHAAR TELEMETRY",
            "MULTI-BRANCH COMMAND",
            "GEMINI 3.5 AI COPILOT",
            "PHONEPE AUTO-SETTLEMENT",
            "MESS HEADCOUNT PROTOCOL",
            "24-HOUR WHITE-GLOVE DEPLOY"
          ]).map((item, i) => (
            <span key={i} className={styles.marqueeItem}>
              <span className={styles.marqueeDot} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ====================================================================
          4. TACTICAL CAPABILITIES (CYBER-ARCHITECTURAL BENTO)
          ==================================================================== */}
      <section id="superpowers" className={styles.superpowersSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>// SYSTEM MODULES</span>
          <h2 className={styles.sectionTitle}>
            Engineered for real Indian PG operations.
          </h2>
          <p className={styles.sectionSubtitle}>
            Three cyber-physical pillars that eliminate revenue leakages and run multi-property hostels with zero administrative chaos.
          </p>
        </div>

        <div className={styles.pillarsGrid}>
          {/* Card 1 */}
          <div className={styles.pillarCard}>
            <div className={styles.cornerMarkerTL} />
            <div className={styles.cornerMarkerBR} />
            <div className={styles.pillarHeader}>
              <span className={styles.pillarNumber}>01</span>
              <span className={styles.pillarBadge}>RADAR</span>
            </div>
            <h3 className={styles.pillarTitle}>Bed Sonar Radar</h3>
            <p className={styles.pillarDesc}>
              Stop losing money to ghost vacancies. An architectural multi-floor blueprint identifies vacant beds, pending leases, and ready-to-book slots in real-time.
            </p>
            <div className={styles.pillarFooter}>
              <span>LATENCY: &lt;50ms</span>
              <span>100% INVENTORY SYNC</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className={styles.pillarCard}>
            <div className={styles.cornerMarkerTL} />
            <div className={styles.cornerMarkerBR} />
            <div className={styles.pillarHeader}>
              <span className={styles.pillarNumber}>02</span>
              <span className={styles.pillarBadge}>PAYMENTS</span>
            </div>
            <h3 className={styles.pillarTitle}>1-Click WhatsApp Dues</h3>
            <p className={styles.pillarDesc}>
              Zero tenant app resistance. Automated WhatsApp payment links with embedded UPI QR codes collect 85% of monthly rent within the first 24 hours.
            </p>
            <div className={styles.pillarFooter}>
              <span>PHONEPE // RAZORPAY</span>
              <span>AUTO-RECEIPTS</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className={styles.pillarCard}>
            <div className={styles.cornerMarkerTL} />
            <div className={styles.cornerMarkerBR} />
            <div className={styles.pillarHeader}>
              <span className={styles.pillarNumber}>03</span>
              <span className={styles.pillarBadge}>COMPLIANCE</span>
            </div>
            <h3 className={styles.pillarTitle}>Multi-Branch &amp; Police KYC</h3>
            <p className={styles.pillarDesc}>
              Switch across 1 to 20 PG branches in 1 millisecond. Digital reception QR onboarding with automated Aadhaar verification and local police registry compliance.
            </p>
            <div className={styles.pillarFooter}>
              <span>UIDAI VERIFIED</span>
              <span>MULTI-TENANT HUB</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. THE CONCIERGE PROTOCOL
          ==================================================================== */}
      <section id="concierge" className={styles.conciergeSection}>
        <div className={styles.conciergeCard}>
          <div className={styles.conciergeBadge}>// WHITE-GLOVE CONCIERGE PROTOCOL</div>
          <h2 className={styles.conciergeTitle}>
            STILL WRITING IN A NOTEBOOK? STOP.
          </h2>
          <p className={styles.conciergeDesc}>
            Send a photo of your paper register or existing Excel sheet to our WhatsApp deployment team. We map all rooms, beds, and current tenants into your command deck in under 24 hours — 100% Free.
          </p>
          <button 
            type="button" 
            onClick={() => openAuth("register")} 
            className={styles.heroPrimaryBtn}
          >
            <span>CLAIM FREE CONCIERGE SETUP →</span>
          </button>
        </div>
      </section>

      {/* ====================================================================
          6. FINANCIAL LEAKAGE SIMULATOR
          ==================================================================== */}
      <section id="calculator" className={styles.calcSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>// REVENUE TELEMETRY</span>
          <h2 className={styles.sectionTitle}>
            Quantify your ghost vacancy leak.
          </h2>
        </div>

        <div className={styles.calculatorCard}>
          <div className={styles.sliderWrap}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>TOTAL BEDS ACROSS YOUR PROPERTIES</span>
              <span className={styles.sliderValue}>{calcBeds} BEDS</span>
            </div>
            <input
              type="range"
              min="20"
              max="400"
              step="10"
              value={calcBeds}
              onChange={(e) => setCalcBeds(Number(e.target.value))}
              className={styles.rangeSlider}
            />
          </div>

          <div className={styles.calcResultStrip}>
            <div className={styles.calcResultCol}>
              <span className={styles.calcResultLabel}>ANNUAL RECOVERABLE NET MARGIN</span>
              <span className={styles.calcResultValue} suppressHydrationWarning>+₹{recoveredAnnual.toLocaleString("en-IN")}</span>
            </div>
            <div className={styles.calcResultCol}>
              <span className={styles.calcResultLabel}>MONTHLY LEAK PREVENTED</span>
              <span className={styles.calcResultValueMuted} suppressHydrationWarning>₹{vacancyLoss.toLocaleString("en-IN")} / mo</span>
            </div>
            <button 
              type="button" 
              onClick={() => openAuth("register")} 
              className={styles.btnPillPrimary}
              style={{ padding: "0.85rem 1.75rem" }}
            >
              <span>RECOVER THIS MARGIN →</span>
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. FAQ ACCORDION
          ==================================================================== */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>// SYSTEM FAQ</span>
          <h2 className={styles.sectionTitle}>Operational Protocols</h2>
        </div>

        <div className={styles.faqList}>
          {faqData.map((item, idx) => (
            <div key={idx} className={styles.faqItem}>
              <button
                type="button"
                className={styles.faqQuestion}
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openFaq === idx ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease"
                  }}
                />
              </button>
              {openFaq === idx && (
                <div className={styles.faqAnswer}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          8. CLOSING GATEWAY CTA
          ==================================================================== */}
      <section className={styles.closingCtaSection}>
        <div className={styles.closingCtaCard}>
          <div className={styles.closingTag}>// ZERO-RISK DEPLOYMENT</div>
          <h2 className={styles.closingCtaTitle}>
            INITIALIZE COMMAND DECK IN 60 SECONDS.
          </h2>
          <p className={styles.closingCtaDesc}>
            Includes 30-day complimentary full-access license. No credit card required.
          </p>
          <button 
            type="button" 
            onClick={() => openAuth("register")} 
            className={styles.heroPrimaryBtn}
          >
            <span>LAUNCH YOUR WORKSPACE →</span>
          </button>
        </div>
      </section>

      {/* ====================================================================
          9. FOOTER
          ==================================================================== */}
      <footer className={styles.footerSection}>
        <div className={styles.footerContent}>
          <div className={styles.footerCopy}>
            © {new Date().getFullYear()} OUR-PG PROTOCOL. Built for Indian Hostel Operators.
          </div>
          <div className={styles.footerLinks}>
            <Link href="/privacy" className={styles.footerLink}>PRIVACY</Link>
            <Link href="/terms" className={styles.footerLink}>TERMS</Link>
            <span style={{ fontSize: "0.78rem", color: "#10B981", display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono-stack)" }}>
              <span className={styles.livePulse} /> ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          10. AUTH MODAL (LOGIN & REGISTER)
          ==================================================================== */}
      {isAuthOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAuthOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => setIsAuthOpen(false)} 
              className={styles.modalCloseBtn}
            >
              <X size={18} />
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalTabToggle}>
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setAuthError(""); setAuthSuccess(""); }}
                  className={`${styles.modalTabBtn} ${authMode === "login" ? styles.modalTabActive : ""}`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("register"); setAuthError(""); setAuthSuccess(""); }}
                  className={`${styles.modalTabBtn} ${authMode === "register" ? styles.modalTabActive : ""}`}
                >
                  INITIALIZE WORKSPACE
                </button>
              </div>

              <h3 className={styles.modalTitle}>
                {authMode === "login" ? "Welcome back" : "Start your 30-day free trial"}
              </h3>
              <p className={styles.modalDesc}>
                {authMode === "login" 
                  ? "Enter your credentials to access your command deck." 
                  : "Setup takes 60 seconds. Zero payment details required."}
              </p>
            </div>

            {authError && (
              <div className={styles.errorBanner} style={{ marginBottom: "1rem" }}>
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className={styles.successBanner} style={{ marginBottom: "1rem" }}>
                {authSuccess}
              </div>
            )}

            {authMode === "login" ? (
              <form onSubmit={handleLogin} className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>OPERATOR EMAIL</label>
                  <div className={styles.inputWrap}>
                    <Mail size={16} className={styles.fieldIcon} />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="owner@yourhostel.com"
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>PASSWORD</label>
                  <div className={styles.inputWrap}>
                    <Lock size={16} className={styles.fieldIcon} />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <button type="submit" disabled={authLoading} className={styles.submitBtn}>
                  {authLoading ? <Loader2 size={16} className="spin" /> : <span>ENTER DASHBOARD →</span>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className={styles.formGrid}>
                <div className={styles.twoColRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>FULL NAME</label>
                    <div className={styles.inputWrap}>
                      <User size={16} className={styles.fieldIcon} />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Rajesh Kumar"
                        className={styles.inputField}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>WHATSAPP NUMBER</label>
                    <div className={styles.inputWrap}>
                      <Phone size={16} className={styles.fieldIcon} />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="9876543210"
                        className={styles.inputField}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>PG / HOSTEL BRAND NAME</label>
                  <div className={styles.inputWrap}>
                    <Building2 size={16} className={styles.fieldIcon} />
                    <input
                      type="text"
                      required
                      value={regPgName}
                      onChange={(e) => setRegPgName(e.target.value)}
                      placeholder="Royal Living PG"
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>OPERATOR WORK EMAIL</label>
                  <div className={styles.inputWrap}>
                    <Mail size={16} className={styles.fieldIcon} />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="owner@yourhostel.com"
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.twoColRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>PASSWORD</label>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.fieldIcon} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className={styles.inputField}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>CONFIRM</label>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.fieldIcon} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter"
                        className={styles.inputField}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={authLoading} className={styles.submitBtn}>
                  {authLoading ? <Loader2 size={16} className="spin" /> : <span>ACTIVATE WORKSPACE →</span>}
                </button>

                <p className={styles.modalNotice}>
                  Includes 30-day complimentary full-access license. No credit card required.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
