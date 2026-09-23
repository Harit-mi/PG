import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/utils/rateLimiter';
import { getAuthenticatedUser } from '@/app/actions';

export async function POST(req) {
  // Enforce rate limiting: max 10 order creation requests per minute per IP
  const rateLimit = checkRateLimit(req, 10, 60000);
  if (!rateLimit.success) return rateLimit.response;

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { amount } = await req.json();
    const numAmount = Number(amount);

    if (!numAmount || isNaN(numAmount) || numAmount <= 0 || numAmount > 1000000) {
      return NextResponse.json({ error: "Invalid payment amount. Amount must be a positive value up to ₹10,00,000." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment gateway credentials are not configured on server." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(numAmount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order." },
      { status: 500 }
    );
  }
}
