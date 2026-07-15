"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, Loader2, CheckCircle2 } from "lucide-react";
import styles from "../page.module.css";

import { purchaseOutletSlots } from "@/app/actions";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [plan, setPlan] = useState("Professional");
  const [price, setPrice] = useState("₹4,999");

  useEffect(() => {
    const savedPlan = localStorage.getItem("pg_selected_plan");
    if (savedPlan) {
      setPlan(savedPlan);
      if (savedPlan === "Starter") setPrice("₹1,999");
      if (savedPlan === "Enterprise") setPrice("₹14,999");
    }
  }, []);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const planName = plan === "Professional" ? "Pro" : plan;
      const res = await purchaseOutletSlots(planName, 1);
      
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        alert("Payment gateway failed to record transaction.");
      }
    } catch (err) {
      console.error(err);
      alert("Checkout error.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Payment Successful!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ display: 'flex', gap: '2rem', maxWidth: '900px', width: '100%', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Order Summary */}
        <div style={{ flex: '1 1 400px' }}>
          <h1 className={styles.title} style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Complete Purchase</h1>
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1.125rem' }}>PG App - {plan} Plan</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Billed monthly</p>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{price}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Subtotal</span>
              <span>{price}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              <span>GST (18%)</span>
              <span>Included</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <span>Total due today</span>
              <span className="text-primary">{price}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="glass" style={{ flex: '1 1 400px', padding: '2rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <Lock size={16} color="var(--success)" />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secure Checkout</span>
          </div>

          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Card Information</label>
              <div style={{ position: 'relative' }}>
                <CreditCard size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  required
                  placeholder="4242 4242 4242 4242" 
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '8px 8px 0 0', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderBottom: 'none', color: 'var(--text)', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex' }}>
                <input 
                  type="text" 
                  required
                  placeholder="MM / YY" 
                  style={{ width: '50%', padding: '0.875rem 1rem', borderRadius: '0 0 0 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRight: 'none', color: 'var(--text)', outline: 'none' }}
                />
                <input 
                  type="text" 
                  required
                  placeholder="CVC" 
                  style={{ width: '50%', padding: '0.875rem 1rem', borderRadius: '0 0 8px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Name on card</label>
              <input 
                type="text" 
                required
                placeholder="John Doe" 
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles.primaryButton} 
              style={{ marginTop: '0.5rem', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', width: '100%' }}
            >
              {loading ? <Loader2 className="spin" size={20} /> : `Pay ${price}`}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
