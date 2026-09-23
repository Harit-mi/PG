import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { purchaseOutletSlots, getAuthenticatedUser } from '@/app/actions';
import { checkRateLimit } from '@/utils/rateLimiter';

export async function POST(req) {
  // Enforce rate limiting: max 10 verification requests per minute per IP
  const rateLimit = checkRateLimit(req, 10, 60000);
  if (!rateLimit.success) return rateLimit.response;

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const orgId = user.user_metadata?.organization_id;
    if (!orgId) {
      return NextResponse.json({ error: "No organization linked to account." }, { status: 400 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planName,
      quantity,
      propertyNamesList
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required transaction verification parameters." }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is not configured.");
      return NextResponse.json({ error: "Payment gateway configuration error." }, { status: 500 });
    }

    // Strict HMAC SHA256 signature verification using constant-time comparison
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    const digestBuf = Buffer.from(digest, 'utf8');
    const sigBuf = Buffer.from(razorpay_signature, 'utf8');

    if (digestBuf.length !== sigBuf.length || !crypto.timingSafeEqual(digestBuf, sigBuf)) {
      return NextResponse.json({ error: "Transaction signature verification failed." }, { status: 400 });
    }

    // Call secure server action to execute database mutations for authenticated user's organization
    const dbResult = await purchaseOutletSlots(
      planName || 'Pro', 
      Math.min(Math.max(parseInt(quantity, 10) || 1, 1), 50), 
      Array.isArray(propertyNamesList) ? propertyNamesList : [], 
      orgId
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
