import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { purchaseOutletSlots } from '@/app/actions';
import { checkRateLimit } from '@/utils/rateLimiter';

export async function POST(req) {
  // Enforce rate limiting: max 10 verification requests per minute per IP
  const rateLimit = checkRateLimit(req, 10, 60000);
  if (!rateLimit.success) return rateLimit.response;

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planName,
      quantity,
      propertyNamesList,
      orgId
    } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
    const isProd = process.env.NODE_ENV === 'production';

    // Signature verification logic
    if (isProd || (razorpay_signature && razorpay_signature !== 'mock_signature')) {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');

      if (digest !== razorpay_signature) {
        return NextResponse.json({ error: "Transaction signature verification failed." }, { status: 400 });
      }
    }

    // Call secure server action to execute database mutations
    const dbResult = await purchaseOutletSlots(
      planName || 'Pro', 
      quantity || 1, 
      propertyNamesList || [], 
      orgId || 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0'
    );

    if (!dbResult.success) {
      return NextResponse.json({ error: dbResult.error || "Failed to update subscription slots in database." }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok', success: true });

  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    return NextResponse.json({ error: "Verification failed due to internal error." }, { status: 500 });
  }
}
