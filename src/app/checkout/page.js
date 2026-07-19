"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import FAIcon from "@/components/FAIcon";
import styles from "../page.module.css";

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
      const cleanPrice = Number(price.replace(/[^0-9]/g, ""));
      const planName = plan === "Professional" ? "Pro" : plan;
      const isProd = process.env.NODE_ENV === 'production';

      if (isProd) {
        // Create Order on Backend
        const res = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: cleanPrice })
        });
        const order = await res.json();

        if (order.error) {
          alert(order.error);
          setLoading(false);
          return;
        }

        // Initialize Razorpay UI
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: order.amount,
          currency: order.currency,
          name: "PG Owner SaaS",
          description: `${plan} Subscription`,
          order_id: order.id,
          handler: async function (response) {
            // Verify on Backend (Database mutation is executed server-side upon signature validation)
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planName,
                quantity: 1
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccess(true);
              setTimeout(() => {
                router.push("/dashboard");
              }, 1500);
            } else {
              alert("Payment Verification Failed.");
            }
          },
          prefill: {
            name: "Owner Name",
            email: "owner@example.com",
            contact: "9999999999"
          },
          theme: {
            color: "#1E4877"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Staging/Dev fallback: securely execute database mutation via the verify API
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: "pay_mock_" + Date.now(),
            razorpay_order_id: "order_mock_" + Date.now(),
            razorpay_signature: "mock_signature",
            planName,
            quantity: 1
          })
        });
        const verifyData = await verifyRes.json();
        
        if (verifyData.success) {
          setSuccess(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          alert("Staging payment verification request failed.");
        }
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
            <FAIcon icon="circle-check" style={{ fontSize: '48px' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Payment Successful!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pricingContainer} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
      {/* Load Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div style={{ display: 'flex', gap: '2rem', maxWidth: '900px', width: '100%', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        {/* Order Summary */}
        <div style={{ flex: '1 1 290px', width: '100%' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-anton), sans-serif', letterSpacing: '0.05em' }}>Complete Purchase</h1>
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1.125rem' }}>PG App - {plan} Plan</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Billed monthly</p>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="ledger-mono">{price}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span>Subtotal</span>
              <span className="ledger-mono">{price}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <span>GST (18%)</span>
              <span>Included</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <span>Total due today</span>
              <span style={{ color: 'var(--primary)' }} className="ledger-mono">{price}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="glass" style={{ flex: '1 1 290px', width: '100%', padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <FAIcon icon="lock" style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secure Checkout</span>
          </div>

          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Card Information</label>
              <div style={{ position: 'relative' }}>
                <FAIcon icon="credit-card" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  required
                  placeholder="4242 4242 4242 4242" 
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '8px 8px 0 0', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderBottom: 'none', color: 'var(--foreground)', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex' }}>
                <input 
                  type="text" 
                  required
                  placeholder="MM / YY" 
                  style={{ width: '50%', padding: '0.875rem 1rem', borderRadius: '0 0 0 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRight: 'none', color: 'var(--foreground)', outline: 'none' }}
                />
                <input 
                  type="text" 
                  required
                  placeholder="CVC" 
                  style={{ width: '50%', padding: '0.875rem 1rem', borderRadius: '0 0 8px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Name on card</label>
              <input 
                type="text" 
                required
                placeholder="John Doe" 
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--foreground)', outline: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={styles.planButton} 
              style={{ background: 'var(--primary)', border: 'none', color: '#FFFFFF', marginTop: '0.5rem', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', width: '100%', borderRadius: '8px', cursor: 'pointer' }}
            >
              {loading ? <FAIcon icon="spinner fa-spin" /> : `Pay ${price}`}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
