import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeInput } from '../src/utils/sanitizer.js';
import { normalizeRoomNumber, getFloorName } from '../src/utils/roomUtils.js';
import { verifyCronAuth } from '../src/utils/cronAuth.js';

// Test 1: Real Production Input Sanitizer Test
test('Sanitize input prevents XSS injection strings', () => {
  const maliciousInput = '<script>alert("xss")</script>';
  const sanitized = sanitizeInput(maliciousInput);
  assert.equal(sanitized, '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
});

// Test 2: Real Production Room Number Normalizer Test
test('Room number normalization formats spaces and case', () => {
  assert.equal(normalizeRoomNumber('  room  101a '), 'ROOM 101A');
  assert.equal(normalizeRoomNumber('g-01'), 'G-01');
});

// Test 3: Real Production Fail-Closed CRON_SECRET Guard Test
test('Fail-Closed CRON_SECRET rejects missing or invalid authorization header', () => {
  // Scenario A: Missing CRON_SECRET env var -> Reject (401)
  assert.equal(verifyCronAuth(undefined, 'Bearer secret123').status, 401);

  // Scenario B: Missing auth header -> Reject (401)
  assert.equal(verifyCronAuth('secret123', null).status, 401);

  // Scenario C: Mismatched auth header -> Reject (401)
  assert.equal(verifyCronAuth('secret123', 'Bearer wrong').status, 401);

  // Scenario D: Valid secret and header -> Pass (200)
  assert.equal(verifyCronAuth('secret123', 'Bearer secret123').status, 200);
});

// Test 4: Real Production Warden Key Desk Floor Name Inference Test
test('Warden key desk floor name inference', () => {
  assert.equal(getFloorName('G01'), 'Ground Floor');
  assert.equal(getFloorName('102'), '1st Floor');
  assert.equal(getFloorName('205'), '2nd Floor');
  assert.equal(getFloorName('310'), '3rd Floor');
});
