"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LaunchVideo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence Timeline
    const sequence = [
      { step: 1, delay: 500 },     // Chaos text
      { step: 2, delay: 3500 },    // Meet PGPlus
      { step: 3, delay: 6000 },    // 3D Screenshot Drop
      { step: 4, delay: 8000 },    // Flatten & Zoom into Table
      { step: 5, delay: 10500 },   // Pan & Feature Card 1
      { step: 6, delay: 13500 },   // Outro Text
      { step: 7, delay: 18000 },   // Reset
    ];

    let timeouts = [];
    sequence.forEach((s) => {
      const t = setTimeout(() => setStep(s.step), s.delay);
      timeouts.push(t);
    });

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [step === 7]); // Loop

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      color: '#fff',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"General Sans", "Space Grotesk", sans-serif',
      perspective: '1400px'
    }}>

      {/* Subtle Minimalist Grid Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
        opacity: step >= 3 ? 0.4 : 0,
        transition: 'opacity 2s ease'
      }} />

      <AnimatePresence mode="wait">
        
        {/* Scene 1: Chaos */}
        {step === 1 && (
          <motion.div
            key="chaos"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ fontSize: '4vw', fontWeight: 600, textAlign: 'center', letterSpacing: '-0.02em', color: '#a1a1aa', position: 'absolute' }}
          >
            Managing a PG used to be <span style={{ color: '#ef4444', fontStyle: 'italic' }}>chaos.</span>
          </motion.div>
        )}

        {/* Scene 2: Meet PGPlus */}
        {step === 2 && (
          <motion.div
            key="meet"
            initial={{ opacity: 0, y: 30, filter: 'blur(15px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -30, filter: 'blur(15px)' }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ fontSize: '6vw', fontWeight: 700, textAlign: 'center', letterSpacing: '-0.03em', position: 'absolute' }}
          >
            Meet <span style={{ color: '#ffffff', textShadow: '0 0 30px rgba(255, 255, 255, 0.4)' }}>PGPlus</span>
          </motion.div>
        )}

        {/* Scene 3 & 4: Live Screenshot 3D Drop & Zoom */}
        {(step >= 3 && step <= 5) && (
          <motion.div
            key="screenshot"
            initial={{ opacity: 0, rotateX: 45, rotateZ: -10, rotateY: -15, scale: 0.6, y: 150 }}
            animate={
              step === 3 
                ? { opacity: 1, rotateX: 30, rotateZ: -5, rotateY: -10, scale: 0.8, y: 20 } 
                : step === 4
                ? { opacity: 1, rotateX: 0, rotateZ: 0, rotateY: 0, scale: 1.1, y: 0 } // Flatten and zoom slightly
                : { opacity: 0.6, rotateX: 0, rotateZ: 0, rotateY: 0, scale: 1.4, y: -100, x: -200, filter: 'blur(4px)' } // Extreme pan & blur
            }
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            transition={{ type: "spring", stiffness: 40, damping: 14, mass: 1 }}
            style={{
              position: 'absolute',
              width: '85vw',
              maxWidth: '1200px',
              aspectRatio: '16/10',
              borderRadius: '12px',
              border: '1px solid #3f3f46',
              boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.1)',
              overflow: 'hidden',
              backgroundImage: 'url(/live-ss.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'top left'
            }}
          />
        )}

        {/* Scene 5: Feature Overlay (Syncs with Pan) */}
        {step === 5 && (
          <motion.div
            key="feature"
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            style={{ 
              position: 'absolute', 
              right: '15vw', 
              top: '40vh',
              background: 'rgba(18, 18, 18, 0.7)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '2rem 2.5rem',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)',
              display: 'flex', flexDirection: 'column', gap: '0.5rem'
            }}
          >
            <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Minimalist Control.
            </div>
            <div style={{ color: '#a1a1aa', fontSize: '1.1rem', fontWeight: 500 }}>
              Manage tenants, dues, and complaints<br/>with zero friction.
            </div>
          </motion.div>
        )}

        {/* Scene 6: Outro */}
        {step === 6 && (
          <motion.div
            key="outro"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', position: 'absolute' }}
          >
            <div style={{ 
              width: '64px', height: '64px', 
              background: '#ffffff', 
              borderRadius: '16px', 
              boxShadow: '0 0 60px rgba(255, 255, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#000', fontSize: '2rem', fontWeight: 900
            }}>
              S
            </div>
            <div style={{ fontSize: '4.5rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#ffffff' }}>
              PGPlus
            </div>
            <div style={{ fontSize: '1.2rem', color: '#a1a1aa', fontWeight: 500, letterSpacing: '-0.01em' }}>
              The Minimalist OS for PGs.
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
