"use client";

import { useState } from "react";
import { CreditCard, Smartphone, X } from "lucide-react";
import styles from "./Modal.module.css";
import Script from "next/script";

export default function CheckoutButton({ planName, price, buttonClass }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);

  // 1. Razorpay Integration
  const handleRazorpay = async () => {
    setLoading(true);
    try {
      // Create Order on Backend
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price })
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
        description: `${planName} Subscription`,
        order_id: order.id,
        handler: async function (response) {
          // Verify on Backend
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert(`Payment Successful! Welcome to ${planName}.`);
            setIsOpen(false);
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
          color: "#4f46e5"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();
    } catch (error) {
      alert("Error initiating Razorpay checkout.");
    } finally {
      setLoading(false);
    }
  };

  // 2. PhonePe Integration
  const handlePhonePe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/phonepe/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price, mobileNumber: "9999999999" })
      });
      const data = await res.json();

      if (data.redirectUrl) {
        // Redirect browser to PhonePe Pay Page
        window.location.href = data.redirectUrl;
      } else {
        alert("Error initiating PhonePe: " + data.error);
        setLoading(false);
      }
    } catch (error) {
      alert("Network error initiating PhonePe.");
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (selectedGateway === "razorpay") {
      handleRazorpay();
    } else if (selectedGateway === "phonepe") {
      handlePhonePe();
    }
  };

  return (
    <>
      {/* Load Razorpay Script globally when component mounts */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <button onClick={() => setIsOpen(true)} className={buttonClass}>
        Upgrade to {planName}
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} glass`} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h2>Checkout ({planName})</h2>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '1rem 0' }}>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '500' }}>
                Total Amount: ₹{price}
              </p>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                Select Payment Gateway
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {/* Razorpay Option */}
                <div 
                  onClick={() => setSelectedGateway("razorpay")}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                    border: `2px solid ${selectedGateway === 'razorpay' ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: selectedGateway === 'razorpay' ? 'rgba(79, 70, 229, 0.05)' : 'transparent'
                  }}
                >
                  <CreditCard size={24} color={selectedGateway === 'razorpay' ? 'var(--primary)' : 'var(--text-muted)'} />
                  <div>
                    <h4 style={{ margin: 0, fontWeight: '600' }}>Razorpay</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cards, UPI, NetBanking</span>
                  </div>
                </div>

                {/* PhonePe Option */}
                <div 
                  onClick={() => setSelectedGateway("phonepe")}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                    border: `2px solid ${selectedGateway === 'phonepe' ? 'var(--success)' : 'var(--border)'}`,
                    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: selectedGateway === 'phonepe' ? 'rgba(34, 197, 94, 0.05)' : 'transparent'
                  }}
                >
                  <Smartphone size={24} color={selectedGateway === 'phonepe' ? 'var(--success)' : 'var(--text-muted)'} />
                  <div>
                    <h4 style={{ margin: 0, fontWeight: '600' }}>PhonePe PG</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UPI Intent & Wallets</span>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button 
                  onClick={handleProceed} 
                  disabled={loading || !selectedGateway} 
                  className={styles.submitBtn}
                >
                  {loading ? "Processing..." : `Pay ₹${price}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
