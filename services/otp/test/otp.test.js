import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createApp, validateProductionConfig } from '../src/server.js';
import { MemoryOtpStore } from '../src/otpStore.js';
import { createAfricaTalkingSmsProvider } from '../src/smsProvider.js';

const TEST_SECRET = 'test-secret-with-at-least-thirty-two-bytes';

function createTestApp({ deliverOtp = async () => {}, mockMode = false, environment = 'test' } = {}) {
  const store = new MemoryOtpStore();
  const app = createApp({
    store,
    deliverOtp,
    otpSecret: TEST_SECRET,
    mockMode,
    environment,
  });
  return { app, store };
}

async function requestCode(app, phone = '+254700000000') {
  return request(app).post('/api/otp/send').send({ phone });
}

function sentCode(message) {
  const match = message.match(/code is (\d{6})/);
  assert.ok(match, 'SMS message should include a six-digit code');
  return match[1];
}

describe('OTP API', () => {
  it('rejects invalid international phone numbers without sending SMS', async () => {
    let deliveryCount = 0;
    const { app } = createTestApp({ deliverOtp: async () => { deliveryCount += 1; } });

    const response = await request(app).post('/api/otp/send').send({ phone: '0700000000' });

    assert.equal(response.status, 400);
    assert.equal(deliveryCount, 0);
  });

  it('sends an OTP, verifies phone possession once, and creates no member account', async () => {
    let sms;
    const { app } = createTestApp({
      deliverOtp: async (phone, message) => { sms = { phone, message }; },
    });

    const sent = await requestCode(app);
    const code = sentCode(sms.message);
    assert.equal(sent.status, 200);
    assert.equal(sent.body.sent, true);
    assert.equal(sent.body.demo, false);
    assert.equal(sms.phone, '+254700000000');
    assert.equal(JSON.stringify(sent.body).includes(code), false);

    const verified = await request(app)
      .post('/api/otp/verify')
      .send({ phone: sms.phone, code });
    assert.equal(verified.status, 200);
    assert.equal(verified.body.verified, true);
    assert.equal(verified.body.memberAccount, false);

    const replay = await request(app)
      .post('/api/otp/verify')
      .send({ phone: sms.phone, code });
    assert.equal(replay.status, 400);
  });

  it('locks the code after five incorrect verification attempts', async () => {
    let smsMessage;
    const { app } = createTestApp({
      deliverOtp: async (_phone, message) => { smsMessage = message; },
    });

    await requestCode(app);
    const code = sentCode(smsMessage);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await request(app)
        .post('/api/otp/verify')
        .send({ phone: '+254700000000', code: '000000' });
      assert.equal(response.status, 400);
      assert.match(response.body.error, /invalid or expired/);
    }

    const fifthAttempt = await request(app)
      .post('/api/otp/verify')
      .send({ phone: '+254700000000', code: '000000' });
    assert.match(fifthAttempt.body.error, /Too many incorrect codes/);

    const correctAfterLock = await request(app)
      .post('/api/otp/verify')
      .send({ phone: '+254700000000', code });
    assert.equal(correctAfterLock.status, 400);
  });

  it('accepts the correct code on the fifth and final attempt', async () => {
    let smsMessage;
    const { app } = createTestApp({
      deliverOtp: async (_phone, message) => { smsMessage = message; },
    });

    await requestCode(app);
    const code = sentCode(smsMessage);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await request(app)
        .post('/api/otp/verify')
        .send({ phone: '+254700000000', code: '000000' });
    }

    const finalAttempt = await request(app)
      .post('/api/otp/verify')
      .send({ phone: '+254700000000', code });
    assert.equal(finalAttempt.status, 200);
    assert.equal(finalAttempt.body.verified, true);
  });

  it('applies a per-phone resend cooldown', async () => {
    let deliveryCount = 0;
    const { app } = createTestApp({
      deliverOtp: async () => { deliveryCount += 1; },
    });

    assert.equal((await requestCode(app)).status, 200);
    const second = await requestCode(app);
    assert.equal(second.status, 429);
    assert.equal(deliveryCount, 1);
  });

  it('removes the pending code and cooldown when SMS delivery fails', async () => {
    let deliveries = 0;
    const { app } = createTestApp({
      deliverOtp: async () => {
        deliveries += 1;
        if (deliveries === 1) throw new Error('delivery unavailable');
      },
    });
    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      assert.equal((await requestCode(app)).status, 503);
      assert.equal((await requestCode(app)).status, 200);
    } finally {
      console.error = originalConsoleError;
    }
    assert.equal(deliveries, 2);
  });

  it('disables mock verification in production', async () => {
    const { app } = createTestApp({ mockMode: true, environment: 'production' });

    const sent = await requestCode(app);
    const verified = await request(app)
      .post('/api/otp/verify')
      .send({ phone: '+254700000000', code: '123456' });
    assert.equal(sent.status, 503);
    assert.equal(verified.status, 503);
  });

  it('requires Redis, a strong secret, SMS credentials, and an allowed origin in production', () => {
    assert.throws(() => validateProductionConfig({}), /REDIS_URL/);
    assert.doesNotThrow(() => validateProductionConfig({
      REDIS_URL: 'rediss://redis.example',
      OTP_SECRET_KEY: 'a-production-secret-with-at-least-32-bytes',
      SMS_ENABLED: 'true',
      AFRICASTALKING_USERNAME: 'production-user',
      AFRICASTALKING_API_KEY: 'secret',
      WEB_ORIGINS: 'https://smartlife.example',
    }));
  });
});

describe('Africa’s Talking provider', () => {
  it('sends the API key and SMS form data and accepts a queued message', async () => {
    let captured;
    const provider = createAfricaTalkingSmsProvider({
      SMS_ENABLED: 'true',
      AFRICASTALKING_USERNAME: 'sandbox-user',
      AFRICASTALKING_API_KEY: 'secret-api-key',
      AFRICASTALKING_SENDER_ID: 'Smartlife',
    }, async (url, options) => {
      captured = { url, options };
      return {
        ok: true,
        json: async () => ({
          SMSMessageData: {
            Recipients: [{ statusCode: 102 }],
          },
        }),
      };
    });

    await provider('+254700000000', 'Your code is 123456.');

    assert.equal(captured.url, 'https://api.africastalking.com/version1/messaging');
    assert.equal(captured.options.headers.apiKey, 'secret-api-key');
    assert.equal(captured.options.body.get('username'), 'sandbox-user');
    assert.equal(captured.options.body.get('to'), '+254700000000');
    assert.equal(captured.options.body.get('from'), 'Smartlife');
  });

  it('rejects unaccepted provider responses', async () => {
    const provider = createAfricaTalkingSmsProvider({
      SMS_ENABLED: 'true',
      AFRICASTALKING_USERNAME: 'sandbox-user',
      AFRICASTALKING_API_KEY: 'secret-api-key',
    }, async () => ({
      ok: true,
      json: async () => ({ SMSMessageData: { Recipients: [{ statusCode: 403 }] } }),
    }));

    await assert.rejects(provider('+254700000000', 'code'), /did not accept/);
  });
});
