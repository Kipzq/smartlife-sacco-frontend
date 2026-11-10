import { createConfiguredApp } from '../services/otp/src/server.js';

let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = createConfiguredApp()
      .then(({ app }) => app)
      .catch((error) => {
        appPromise = undefined;
        throw error;
      });
  }
  return appPromise;
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('OTP function initialization failed:', error.message);
    return res.status(503).json({
      error: 'Phone verification is temporarily unavailable. Please try again later.',
    });
  }
}
