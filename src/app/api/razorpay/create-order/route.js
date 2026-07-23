import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/utils/rateLimiter';

export async function POST(req) {
  // Enforce rate limiting: max 10 order creation requests per minute per IP
  const rateLimit = checkRateLimit(req, 10, 60000);
  if (!rateLimit.success) return rateLimit.response;

  try {
    const { amount } = await req.json();

    // Initialize Razorpay with placeholder keys if env vars are missing
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
    });

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order. Check your API keys." },
      { status: 500 }
    );
  }
}
