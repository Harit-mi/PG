"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, IndianRupee, Home, AlertCircle, CheckCircle2, TrendingUp, Wallet } from "lucide-react";

export default function LaunchVideo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = [
      { step: 1, delay: 500 }, 
      { step: 2, delay: 3500 }, 
      { step: 3, delay: 6000 }, 
      { step: 4, delay: 7500 }, 
      { step: 5, delay: 9500 }, 
      { step: 6, delay: 12500 }, 
      { step: 7, delay: 16500 }, 
      { step: 8, delay: 21500 }, 
    ];

    let timeouts = [];
    sequence.forEach((s) => {
      const t = setTimeout(() => setStep(s.step), s.delay);
      timeouts.push(t);
    });

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [step === 8]); 

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#050505',
      color: '#fff',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Space Grotesk", sans-serif',
      perspective: '1200px'
    }}>

      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
        opacity: step >= 3 ? 1 : 0,
        transition: 'opacity 2s ease'
      }} />

      <AnimatePresence mode="wait">
        
        {step === 1 && (
          <motion.div
            key="chaos"
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ fontSize: '4vw', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.03em', color: '#a1a1aa', position: 'absolute' }}
          >
            Managing a PG used to be <span style={{ color: '#ef4444' }}>chaos.</span>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="meet"
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 1 }}
            style={{ fontSize: '6vw', fontWeight: 900, textAlign: 'center', letterSpacing: '-0.04em', position: 'absolute' }}
          >
            Meet <span style={{ 
              background: 'linear-gradient(135deg, #3b82f6, #10b981)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(59, 130, 246, 0.4)'
            }}>StayOS</span>
          </motion.div>
        )}

        {(step >= 3 && step <= 5) && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, rotateX: 60, rotateZ: -20, scale: 0.5, y: 200 }}
            animate={
              step === 3 
                ? { opacity: 1, rotateX: 50, rotateZ: -15, scale: 0.7, y: 50 } 
                : { opacity: 1, rotateX: 0, rotateZ: 0, scale: 1, y: 0 }
            }
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(20px)', y: -100 }}
            transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1 }}
            style={{
              position: 'absolute',
              width: '80vw',
              maxWidth: '1200px',
              height: '70vh',
              background: '#09090b',
              borderRadius: '24px',
              border: '1px solid #27272a',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
              display: 'flex',
              overflow: 'hidden'
            }}
          >
            <div style={{ width: '240px', borderRight: '1px solid #27272a', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', borderRadius: '8px' }} />
                <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>StayOS</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ width: '100%', height: '24px', background: i===1 ? '#27272a' : 'transparent', borderRadius: '6px', display: 'flex', alignItems: 'center', padding: '0 10px', opacity: 0.5 }}>
                    <div style={{ width: '14px', height: '14px', background: '#52525b', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>Overview</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 20 }} transition={{ delay: 0.2 }}
                  style={{ background: '#121212', border: '1px solid #27272a', padding: '1.5rem', borderRadius: '16px' }}
                >
                  <div style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '8px' }}>Total Occupancy</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399' }}>98%</div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 20 }} transition={{ delay: 0.4 }}
                  style={{ background: '#121212', border: '1px solid #27272a', padding: '1.5rem', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '8px' }}>Rent Collected</div>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={step >= 4 ? { y: 0, opacity: 1 } : {}} 
                    transition={{ delay: 0.5 }}
                    style={{ fontSize: '2.5rem', fontWeight: 800, color: '#60a5fa' }}
                  >
                    ₹4,50,000
                  </motion.div>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scaleX: 0.9 }} animate={{ opacity: step >= 4 ? 1 : 0, scaleX: step >= 4 ? 1 : 0.9 }} transition={{ delay: 0.6 }}
                style={{ flex: 1, background: '#121212', border: '1px solid #27272a', borderRadius: '16px', display: 'flex', alignItems: 'flex-end', padding: '2rem', gap: '1rem' }}
              >
                {[40, 70, 45, 90, 60, 100, 85].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }} 
                    animate={{ height: step >= 4 ? `${h}%` : 0 }} 
                    transition={{ delay: 0.8 + (i * 0.1), type: 'spring' }}
                    style={{ flex: 1, background: 'linear-gradient(to top, #3b82f6, #10b981)', borderRadius: '6px 6px 0 0' }} 
                  />
                ))}
              </motion.div>
            </div>

            <AnimatePresence>
              {step === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 100, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, y: 50, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 20 }}
                  style={{
                    position: 'absolute', right: '-40px', bottom: '150px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    display: 'flex', gap: '1rem', alignItems: 'center',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 40px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IndianRupee size={20} color="#000" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>Rent Received</div>
                    <div style={{ color: '#34d399', fontSize: '0.9rem' }}>Harit paid ₹5,000 for Room 101</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            key="roomboard"
            initial={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ width: '60vw', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'absolute' }}
          >
            <div style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center' }}>Real-time Room Board</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              {Array.from({length: 15}).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, rotateX: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring' }}
                  style={{
                    background: i % 4 === 0 ? '#18181b' : 'rgba(16, 185, 129, 0.1)',
                    border: `1px solid ${i % 4 === 0 ? '#27272a' : 'rgba(16, 185, 129, 0.3)'}`,
                    aspectRatio: '1',
                    borderRadius: '16px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: i % 4 === 0 ? '#a1a1aa' : '#34d399',
                    boxShadow: i % 4 !== 0 ? '0 0 20px rgba(16, 185, 129, 0.1)' : 'none'
                  }}
                >
                  <Home size={28} style={{ marginBottom: '8px', opacity: 0.8 }} />
                  <div style={{ fontWeight: 700 }}>10{i+1}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div
            key="outro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', position: 'absolute' }}
          >
            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', borderRadius: '24px', boxShadow: '0 0 60px rgba(59, 130, 246, 0.5)' }} />
            <div style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
              StayOS <span style={{ color: '#10b981' }}>Pro</span>
            </div>
            <div style={{ fontSize: '1.5rem', color: '#a1a1aa', fontWeight: 500, letterSpacing: '-0.02em' }}>
              The Operating System for Modern PGs.
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
