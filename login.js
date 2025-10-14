const USERS = new Map([
  ['demo@example.com', 'me'],
  ['sam@example.com', '1234']
]);

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 3 * 60 * 1000; // 3 minutes

const attemptState = new Map();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function isLocked(email) {
  const entry = attemptState.get(email);
  if (!entry || !entry.lockedUntil) {
    return false;
  }

  if (entry.lockedUntil > Date.now()) {
    return true;
  }

  attemptState.delete(email);
  return false;
}

function recordFailure(email) {
  const entry = attemptState.get(email) || { count: 0, lockedUntil: null };
  entry.count += 1;

  if (entry.count > MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCK_DURATION_MS;
  }

  attemptState.set(email, entry);
  return entry.lockedUntil ? entry.lockedUntil > Date.now() : false;
}

function resetFailures(email) {
  attemptState.delete(email);
}

function verifyCredentials(email, password) {
  const expectedPassword = USERS.get(email);
  return expectedPassword === password;
}

module.exports = {
  MAX_ATTEMPTS,
  LOCK_DURATION_MS,
  normalizeEmail,
  isValidEmail,
  isLocked,
  recordFailure,
  resetFailures,
  verifyCredentials
};
