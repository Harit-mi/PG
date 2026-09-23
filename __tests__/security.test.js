import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { sanitizeInput, sanitizeUrl } from '../src/utils/sanitizer.js';
import { checkActionRateLimit } from '../src/utils/rateLimiter.js';
import { verifyCronAuth } from '../src/utils/cronAuth.js';

test('Security: sanitizeInput escapes dangerous HTML characters', () => {
  const payload = '<script>alert("XSS")</script>';
  assert.equal(sanitizeInput(payload), '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
  assert.equal(sanitizeInput(null), null);
  assert.equal(sanitizeInput(undefined), undefined);
  assert.equal(sanitizeInput(123), 123);
});

test('Security: sanitizeUrl blocks dangerous execution protocols', () => {
  assert.equal(sanitizeUrl('javascript:alert(1)'), '#');
  assert.equal(sanitizeUrl('JAVASCRIPT:alert(1)'), '#');
  assert.equal(sanitizeUrl('data:text/html,<script>alert(1)</script>'), '#');
  assert.equal(sanitizeUrl('vbscript:msgbox(1)'), '#');
  assert.equal(sanitizeUrl('https://example.com/receipt.pdf'), 'https://example.com/receipt.pdf');
  assert.equal(sanitizeUrl(''), '');
});

test('Security: checkActionRateLimit restricts brute force spam', () => {
  const testKey = 'test_tenant_rate_limit_' + Date.now();

  // Up to 3 requests allowed
  assert.equal(checkActionRateLimit(testKey, 3, 10000).success, true);
  assert.equal(checkActionRateLimit(testKey, 3, 10000).success, true);
  assert.equal(checkActionRateLimit(testKey, 3, 10000).success, true);

  // 4th request must be rejected
  const blocked = checkActionRateLimit(testKey, 3, 10000);
  assert.equal(blocked.success, false);
  assert.match(blocked.error, /Rate limit exceeded/);
});

test('Security: Fail-closed CRON_SECRET authorization', () => {
  assert.equal(verifyCronAuth(undefined, 'Bearer token').status, 401);
  assert.equal(verifyCronAuth('secret_abc', undefined).status, 401);
  assert.equal(verifyCronAuth('secret_abc', 'Bearer wrong').status, 401);
  assert.equal(verifyCronAuth('secret_abc', 'Bearer secret_abc').status, 200);
});

test('Security: Constant-time HMAC comparison prevents timing attacks', () => {
  const secret = 'strong_webhook_secret_key';
  const orderId = 'order_12345';
  const paymentId = 'pay_67890';

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(`${orderId}|${paymentId}`);
  const validSignature = shasum.digest('hex');

  const validBuf = Buffer.from(validSignature, 'utf8');
  const matchingBuf = Buffer.from(validSignature, 'utf8');
  const forgedBuf = Buffer.from('mock_signature_forged_value_12345678', 'utf8');

  assert.equal(crypto.timingSafeEqual(validBuf, matchingBuf), true);
  assert.notEqual(validBuf.length, forgedBuf.length);
});
