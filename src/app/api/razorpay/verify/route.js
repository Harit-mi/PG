import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { purchaseOutletSlots } from '@/app/actions';

export async function POST(req) {
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
        return NextResponse.json({ error: "Transaction is not legit!" }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      message: "Payment verified and slots successfully assigned.",
      paymentId: razorpay_payment_id
    }, { status: 200 });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
