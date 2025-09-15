import test from 'node:test';
import assert from 'node:assert/strict';
import { toKobo } from './paystack.js';

test('toKobo converts non-integer totals to integer kobo', () => {
  assert.strictEqual(toKobo(99.99), 9999);
  assert.strictEqual(toKobo(100.75), 10075);
});
