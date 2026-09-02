import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Input Sanitization Helper Test
test('Sanitize input prevents XSS injection strings', () => {
  const sanitize = (text) => {
    if (typeof text !== "string") return text;
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  };

  const maliciousInput = '<script>alert("xss")</script>';
  const sanitized = sanitize(maliciousInput);
  assert.equal(sanitized, '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
});

// Test 2: Room Number Normalization Test
test('Room number normalization formats spaces and case', () => {
  const normalizeRoomNumber = (raw) => {
    return raw.trim().replace(/\s+/g, " ").toUpperCase();
  };

  assert.equal(normalizeRoomNumber('  room  101a '), 'ROOM 101A');
  assert.equal(normalizeRoomNumber('g-01'), 'G-01');
});

// Test 3: Fail-Closed CRON_SECRET Guard Test
test('Fail-Closed CRON_SECRET rejects missing or invalid authorization header', () => {
  const verifyCronAuth = (cronSecretEnv, authHeader) => {
    if (!cronSecretEnv || authHeader !== `Bearer ${cronSecretEnv}`) {
      return { status: 401, error: 'Unauthorized: Missing or invalid CRON_SECRET authorization header.' };
    }
    return { status: 200, success: true };
  };

  // Scenario A: Missing CRON_SECRET env var -> Reject
  assert.equal(verifyCronAuth(undefined, 'Bearer secret123').status, 401);

  // Scenario B: Missing auth header -> Reject
  assert.equal(verifyCronAuth('secret123', null).status, 401);

  // Scenario C: Mismatched auth header -> Reject
  assert.equal(verifyCronAuth('secret123', 'Bearer wrong').status, 401);

  // Scenario D: Valid secret and header -> Pass
  assert.equal(verifyCronAuth('secret123', 'Bearer secret123').status, 200);
});

// Test 4: Floor Inference Math Test
test('Warden key desk floor name inference', () => {
  const getFloorName = (roomNumStr) => {
    const cleanNum = String(roomNumStr).trim().toUpperCase();
    if (cleanNum.startsWith('G') || cleanNum.length <= 2) return "Ground Floor";
    const firstDigit = cleanNum[0];
    if (firstDigit === '1') return "1st Floor";
    if (firstDigit === '2') return "2nd Floor";
    if (firstDigit === '3') return "3rd Floor";
    if (firstDigit === '4') return "4th Floor";
    return `${firstDigit}th Floor`;
  };

  assert.equal(getFloorName('G01'), 'Ground Floor');
  assert.equal(getFloorName('102'), '1st Floor');
  assert.equal(getFloorName('205'), '2nd Floor');
  assert.equal(getFloorName('310'), '3rd Floor');
});
