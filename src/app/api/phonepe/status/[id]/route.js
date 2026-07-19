import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { purchaseOutletSlots } from '@/app/actions';

export async function POST(req, { params }) {
  try {
    const transactionId = params.id;
    const merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    const saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    const env = process.env.PHONEPE_ENV || 'UAT';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 1. Calculate Checksum for Status API (SHA256("/pg/v1/status/{merchantId}/{transactionId}" + saltKey) + "###" + saltIndex)
    const stringToHash = `/pg/v1/status/${merchantId}/${transactionId}${saltKey}`;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256}###${saltIndex}`;

    // 2. Select API Endpoint
    const apiUrl = env === 'PROD' 
      ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${transactionId}`
      : `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${transactionId}`;

    // 3. Send Status Verification Request
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': merchantId
      }
    });

    const data = await response.json();

    if (data.success && data.code === 'PAYMENT_SUCCESS') {
      // Payment Verified! Execute secure database mutations for subscription purchase
      const dbResult = await purchaseOutletSlots('Pro', 1, [], 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0');
      
      if (!dbResult.success) {
        console.error("Database update failed after PhonePe verification:", dbResult.error);
        return NextResponse.redirect(`${appUrl}/dashboard/settings?payment=db_error`);
      }
      
      // Redirect user to success dashboard
      return NextResponse.redirect(`${appUrl}/dashboard/settings?payment=success`);
    } else {
      // Payment Failed or Pending
      return NextResponse.redirect(`${appUrl}/dashboard/settings?payment=failed`);
    }

  } catch (error) {
    console.error("PhonePe Status Verification Error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?payment=error`);
  }
}
