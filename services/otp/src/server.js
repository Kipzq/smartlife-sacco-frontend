import express from 'express';
import cors from 'cors';
import { createHmac, randomInt } from 'node:crypto';
import { createClient } from 'redis';
import { pathToFileURL } from 'node:url';
import { createAfricaTalkingSmsProvider } from './smsProvider.js';
import { MemoryOtpStore, createRedisOtpStore } from './otpStore.js';

const OTP_TTL_SECONDS = 300;
const OTP_COOLDOWN_SECONDS = 30;
const RATE_WINDOW_SECONDS = 3600;
const MAX_SENDS_PER_PHONE = 3;
const MAX_SENDS_PER_IP = 10;
const MAX_VERIFY_ATTEMPTS = 5;
const LOCAL_OTP_SECRET = 'local-development-only-secret-not-for-production';

const isValidPhone = (phone) => typeof phone === 'string' && /^\+[1-9]\d{7,14}$/.test(phone);

function digest(value, secret) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

function hashOtp(phone, code, secret) {
  return createHmac('sha256', secret).update(`${phone}:${code}`).digest('hex');
}

function createApp({
  store = new MemoryOtpStore(),
  deliverOtp = createAfricaTalkingSmsProvider(process.env),
  otpSecret = process.env.OTP_SECRET_KEY || LOCAL_OTP_SECRET,
  mockMode = process.env.OTP_MOCK_MODE === 'true',
  environment = process.env.NODE_ENV || 'development',
  allowedOrigins = (process.env.WEB_ORIGINS || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean),
} = {}) {
  const app = express();
  const trustedProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (Number.isInteger(trustedProxyHops) && trustedProxyHops > 0) {
    app.set('trust proxy', trustedProxyHops);
  }
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: '2kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/otp/send', async (req, res) => {
    const { phone } = req.body || {};
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Enter a valid phone number in international format, for example +254700000000.' });
    }

    if (mockMode && environment === 'production') {
      return res.status(503).json({ error: 'Demo phone verification is disabled in production.' });
    }

    const phoneKey = digest(phone, otpSecret);
    const ipKey = digest(req.ip || 'unknown', otpSecret);

    try {
      const [phoneSendCount, ipSendCount] = await Promise.all([
        store.incrementWithinWindow(`otp:send:phone:${phoneKey}`, RATE_WINDOW_SECONDS),
        store.incrementWithinWindow(`otp:send:ip:${ipKey}`, RATE_WINDOW_SECONDS),
      ]);

      if (phoneSendCount > MAX_SENDS_PER_PHONE || ipSendCount > MAX_SENDS_PER_IP) {
        return res.status(429).json({ error: 'Too many verification requests. Please try again later.' });
      }

      const cooldownAcquired = await store.acquireCooldown(phoneKey, OTP_COOLDOWN_SECONDS);
      if (!cooldownAcquired) {
        return res.status(429).json({ error: 'Please wait before requesting another verification code.' });
      }

      const code = randomInt(100000, 1000000).toString();
      await store.setOtp(phoneKey, hashOtp(phone, code, otpSecret), OTP_TTL_SECONDS);

      const message = `Your Smartlife SACCO phone verification code is ${code}. It expires in 5 minutes. Do not share this code.`;

      try {
        await deliverOtp(phone, message, code);
      } catch (error) {
        await Promise.all([
          store.deleteOtp(phoneKey),
          store.releaseCooldown(phoneKey),
        ]);
        console.error('OTP delivery failed:', error.message);
        return res.status(503).json({ error: 'We could not send a verification code. Please try again later.' });
      }

      return res.json({
        sent: true,
        demo: mockMode,
        message: mockMode
          ? 'Demo code generated. Check the local backend terminal; this does not sign you in.'
          : 'Verification code sent. Enter the code to verify your phone number.',
      });
    } catch (error) {
      console.error('OTP request failed:', error.message);
      return res.status(503).json({ error: 'Phone verification is temporarily unavailable. Please try again later.' });
    }
  });

  app.post('/api/otp/verify', async (req, res) => {
    const { phone, code } = req.body || {};
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'A valid phone number in international format is required.' });
    }
    if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Enter the 6-digit verification code.' });
    }
    if (mockMode && environment === 'production') {
      return res.status(503).json({ error: 'Demo phone verification is disabled in production.' });
    }

    const phoneKey = digest(phone, otpSecret);
    try {
      const result = await store.consumeOtp(
        phoneKey,
        hashOtp(phone, code, otpSecret),
        MAX_VERIFY_ATTEMPTS,
        OTP_TTL_SECONDS,
      );

      if (result !== 'verified') {
        const message = result === 'locked'
          ? 'Too many incorrect codes. Request a new code and try again.'
          : 'The code is invalid or expired. Request a new code and try again.';
        return res.status(400).json({ error: message });
      }

      return res.json({
        verified: true,
        memberAccount: false,
        message: 'Phone number verified. No member account or secure session has been created.',
      });
    } catch (error) {
      console.error('OTP verification failed:', error.message);
      return res.status(503).json({ error: 'Phone verification is temporarily unavailable. Please try again later.' });
    }
  });

  return app;
}

function validateProductionConfig(env) {
  const missing = [];
  if (!env.REDIS_URL) missing.push('REDIS_URL');
  if (!env.OTP_SECRET_KEY || Buffer.byteLength(env.OTP_SECRET_KEY) < 32) missing.push('OTP_SECRET_KEY (at least 32 bytes)');
  if (env.SMS_ENABLED !== 'true') missing.push('SMS_ENABLED=true');
  if (!env.AFRICASTALKING_USERNAME) missing.push('AFRICASTALKING_USERNAME');
  if (!env.AFRICASTALKING_API_KEY) missing.push('AFRICASTALKING_API_KEY');
  if (!env.WEB_ORIGINS) missing.push('WEB_ORIGINS');
  if (env.OTP_MOCK_MODE === 'true') missing.push('OTP_MOCK_MODE must not be true');
  if (missing.length) {
    throw new Error(`Production phone verification is not configured: ${missing.join(', ')}`);
  }
}

async function createConfiguredApp(env = process.env) {
  const isProduction = env.NODE_ENV === 'production';

  if (isProduction) validateProductionConfig(env);

  const redisUrl = env.REDIS_URL;
  let redisClient;
  let store = new MemoryOtpStore();

  if (redisUrl) {
    redisClient = createClient({ url: redisUrl });
    redisClient.on('error', () => console.error('Redis connection error.'));
    await redisClient.connect();
    store = createRedisOtpStore(redisClient);
  } else if (isProduction) {
    throw new Error('REDIS_URL is required in production.');
  }

  const mockMode = env.OTP_MOCK_MODE === 'true' && !isProduction;
  const deliverOtp = mockMode
    ? async (_phone, _message, code) => console.info(`[MOCK SMS] Verification code: ${code}`)
    : createAfricaTalkingSmsProvider(env);
  const app = createApp({
    store,
    deliverOtp,
    otpSecret: env.OTP_SECRET_KEY || LOCAL_OTP_SECRET,
    mockMode,
    environment: env.NODE_ENV || 'development',
  });
  return { app, redisClient };
}

async function startServer() {
  const { app, redisClient } = await createConfiguredApp();
  const port = Number(process.env.PORT || 4000);
  const server = app.listen(port, () => console.log(`OTP service listening on port ${port}.`));

  const shutdown = async () => {
    server.close();
    if (redisClient?.isOpen) await redisClient.quit();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((error) => {
    console.error('OTP service failed to start:', error.message);
    process.exitCode = 1;
  });
}

export { createApp, createConfiguredApp, validateProductionConfig };
