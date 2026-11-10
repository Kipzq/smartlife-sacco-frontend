const fs = require('fs');
const path = require('path');

const files = {
  // ---------- Root ----------
  'package.json': JSON.stringify({
    name: "smart-life",
    private: true,
    workspaces: ["services/otp", "apps/web"],
    scripts: {
      "start:backend": "npm start --workspace=services/otp",
      "start:web": "npm run dev --workspace=apps/web",
      "test:otp": "npm test --workspace=services/otp"
    }
  }, null, 2),
  
  '.env.example': `OTP_SECRET_KEY=change-me-32-byte-random-string\nADMIN_API_TOKEN=admin123\nREDIS_URL=redis://localhost:6379\nNODE_ENV=development\n`,

  'docker-compose.yml': `version: "3.9"\nservices:\n  redis:\n    image: redis:7-alpine\n    ports: ["6379:6379"]\n`,

  // ---------- Backend ----------
  'services/otp/package.json': JSON.stringify({
    name: "otp-service",
    version: "1.0.0",
    type: "module",
    scripts: { start: "node src/server.js", test: "jest" },
    dependencies: { express: "^4.21.0", redis: "^4.7.0", cors: "^2.8.5" },
    devDependencies: { jest: "^29.7.0", "supertest": "^6.3.4" }
  }, null, 2),

  'services/otp/src/server.js': `
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createClient } from 'redis';

const app = express();
app.use(cors());
app.use(express.json());

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.on('error', err => console.log('Redis Client Error', err));
await redis.connect().catch(console.error);

// Mock TOTP for testing
function generateSecret() { return crypto.randomBytes(20).toString('hex'); }

app.get('/health', async (req, res) => {
  const ping = await redis.ping().catch(() => 'fail');
  res.json({ status: 'ok', redis: ping });
});

app.post('/api/otp/enroll', async (req, res) => {
  const { userId } = req.body;
  const secret = generateSecret();
  await redis.set('otp:' + userId, secret);
  res.json({ userId, secret, message: 'Enrolled successfully' });
});

app.listen(4000, () => console.log('Backend running on http://localhost:4000'));
  `,

  // ---------- Frontend ----------
  'apps/web/package.json': JSON.stringify({
    name: "web",
    version: "1.0.0",
    scripts: { dev: "vite" },
    dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
    devDependencies: { "@vitejs/plugin-react": "^4.3.0", vite: "^5.4.0" }
  }, null, 2),

  'apps/web/index.html': `<!DOCTYPE html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`,
  
  'apps/web/vite.config.js': `import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react'; export default defineConfig({ plugins: [react()] });`,

  'apps/web/src/main.jsx': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  `,

  'apps/web/src/App.jsx': `
import React, { useState } from 'react';

export default function App() {
  const [status, setStatus] = useState('');

  const testApi = async () => {
    try {
      const res = await fetch('http://localhost:4000/health');
      const data = await res.json();
      setStatus(JSON.stringify(data));
    } catch (e) {
      setStatus('Error: Backend not running or Redis offline');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Smart Life OTP</h1>
      <button onClick={testApi}>Test Backend Connection</button>
      <p>Status: {status}</p>
    </div>
  );
}
  `
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (dir !== '.') fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, content.trim());
}
console.log('✅ Project generated successfully!');