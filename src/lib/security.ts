const LOCKOUT_KEY = 'mn_auth_lockout';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export function getPasswordChecks(password: string) {
  return [
    { label: '12+ characters', passed: password.length >= 12 },
    { label: 'Uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', passed: /[a-z]/.test(password) },
    { label: 'Number', passed: /\d/.test(password) },
    { label: 'Symbol', passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function validateStrongPassword(password: string) {
  const checks = getPasswordChecks(password);
  return {
    checks,
    isStrong: checks.every((check) => check.passed),
  };
}

function readLockout() {
  try {
    return JSON.parse(localStorage.getItem(LOCKOUT_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLockout(data: any) {
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify(data));
}

export function getLoginLockout() {
  const data = readLockout();
  const lockedUntil = Number(data.lockedUntil || 0);
  const now = Date.now();

  if (lockedUntil > now) {
    return {
      locked: true,
      remainingSeconds: Math.ceil((lockedUntil - now) / 1000),
    };
  }

  if (lockedUntil && lockedUntil <= now) {
    localStorage.removeItem(LOCKOUT_KEY);
  }

  return { locked: false, remainingSeconds: 0 };
}

export function recordFailedLogin() {
  const data = readLockout();
  const attempts = Number(data.attempts || 0) + 1;
  const nextData = {
    attempts,
    lockedUntil: attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0,
  };

  writeLockout(nextData);
  return {
    attempts,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempts),
    locked: attempts >= MAX_ATTEMPTS,
  };
}

export function clearLoginLockout() {
  localStorage.removeItem(LOCKOUT_KEY);
}
