import express from 'express';
import cors from 'cors';
import { randomInt } from 'node:crypto';

const app = express();
app.use(cors());
app.use(express.json());

const otps = new Map();

const isValidPhone = (phone) => typeof phone === 'string' && /^\+[1-9]\d{7,14}$/.test(phone);

function generateCode(key, recipient) {
  const code = randomInt(100000, 1000000).toString();
  otps.set(key, { code, expiresAt: Date.now() + 120000 });
  console.log(`\n📱 [MOCK SMS] Code for ${recipient} is: ${code}\n`);
}

function verifyCode(key, code, res) {
  const otp = otps.get(key);

  if (!otp) return res.status(400).json({ error: 'Code not found. Please generate a code first.' });
  if (Date.now() >= otp.expiresAt) {
    otps.delete(key);
    return res.status(400).json({ error: 'Code expired!' });
  }
  if (otp.code !== code) return res.status(400).json({ error: 'Invalid code!' });

  otps.delete(key);
  return res.json({ verified: true, message: 'Code verified successfully!' });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running perfectly!' });
});

app.post('/api/otp/generate', (req, res) => {
  const { userId } = req.body || {};
  if (typeof userId !== 'string' || !userId.trim()) {
    return res.status(400).json({ error: 'A valid userId is required.' });
  }

  generateCode(`user:${userId}`, userId);
  res.json({ sent: true, message: 'Code generated and sent!' });
});

app.post('/api/otp/send', (req, res) => {
  const { phone } = req.body || {};
  if (!isValidPhone(phone)) {
    return res.status(400).json({ error: 'Enter a valid phone number in international format, for example +254700000000.' });
  }

  generateCode(`phone:${phone}`, phone);
  res.json({ sent: true, message: 'Code generated and sent!' });
});

app.post('/api/otp/verify', (req, res) => {
  const { phone, userId, code } = req.body || {};
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'A valid 6-digit code is required.' });
  }

  if (phone !== undefined) {
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'A valid phone number in international format is required.' });
    }
    return verifyCode(`phone:${phone}`, code, res);
  }

  if (typeof userId !== 'string' || !userId.trim()) {
    return res.status(400).json({ error: 'A valid phone or userId is required.' });
  }
  return verifyCode(`user:${userId}`, code, res);
});

app.listen(4000, () => console.log('🚀 Backend running on http://localhost:4000'));