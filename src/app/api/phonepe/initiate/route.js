import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
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

    // 2. Generate X-VERIFY Checksum (SHA256(base64Payload + "/pg/v1/pay" + saltKey) + ### + saltIndex)
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
        'X-MERCHANT-ID': merchantId
      },
      body: JSON.stringify({ request: base64Payload })
    });

    const data = await response.json();

    if (data.success) {
      // Return the redirect URL to the frontend so it can forward the user to the payment page
      return NextResponse.json({ redirectUrl: data.data.instrumentResponse.redirectInfo.url }, { status: 200 });
    } else {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

  } catch (error) {
    console.error("PhonePe Initiate Error:", error);
    return NextResponse.json({ error: "Failed to initiate PhonePe transaction." }, { status: 500 });
  }
}
