import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit } from '@/utils/rateLimiter';

export async function POST(req) {
  // Enforce rate limiting: max 10 PhonePe payment requests per minute per IP
  const rateLimit = checkRateLimit(req, 10, 60000);
  if (!rateLimit.success) return rateLimit.response;

  try {
    const { amount, mobileNumber } = await req.json();

    const merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    const saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    const env = process.env.PHONEPE_ENV || 'UAT';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const transactionId = `TXN_${Date.now()}`;

    // PhonePe Payload Structure
    const payload = {
      merchantId: merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: `MUID_${Date.now()}`,
      amount: amount * 100, // Amount in paise
      redirectUrl: `${appUrl}/api/phonepe/status/${transactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${appUrl}/api/phonepe/callback`, // Server-to-server webhook
      mobileNumber: mobileNumber || "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    // 1. Base64 Encode Payload
    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString('base64');

    // 2. Generate X-VERIFY Checksum
    const stringToHash = base64Payload + "/pg/v1/pay" + saltKey;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256}###${saltIndex}`;

    // 3. Select API Endpoint
    const apiUrl = env === 'PROD' 
      ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

    // 4. Send Request to PhonePe
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-VERIFY-INDEX': saltIndex
      },
      body: JSON.stringify({ request: base64Payload })
    });

    const data = await response.json();

    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json({ 
        url: data.data.instrumentResponse.redirectInfo.url,
        transactionId 
      });
    }

    return NextResponse.json({ 
      error: data.message || "Failed to initiate PhonePe transaction." 
    }, { status: 400 });

  } catch (error) {
    console.error("PhonePe Initiate Error:", error);
    return NextResponse.json({ error: "Failed to initiate PhonePe payment." }, { status: 500 });
  }
}
