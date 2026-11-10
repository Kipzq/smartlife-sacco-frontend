const RAW_BASE = import.meta.env.VITE_OTP_API_URL ?? '';
const BASE = RAW_BASE.replace(/\/+$/, '');

const url = (path) => `${BASE}${path.startsWith('/') ? path : `/${path}`}`;

async function post(path, body, action) {
  const response = await fetch(url(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `OTP ${action} failed: ${response.status}`);
  }

  return data;
}

export function sendOtp(phone) {
  return post('/api/otp/send', { phone }, 'send');
}

export function verifyOtp(phone, code) {
  return post('/api/otp/verify', { phone, code }, 'verification');
}
