# OTP phone verification service

This service sends one-time phone verification codes using Africa's Talking. A verified phone number is **not** proof of SACCO membership and does not create a member account, login session, or access to member data.

## Local development

1. Copy the repository-root `.env.example` to `.env` and set `REDIS_URL` if using Redis. The existing Compose file provides a local Redis service.
2. Install workspace dependencies with `npm install` from the repository root.
3. From this directory, start the service with `node --env-file=../../.env src/server.js` (Node.js 20.6 or newer).
4. Start the Vite app; its `/api` requests are proxied to `http://localhost:4000`.

With `OTP_MOCK_MODE=true`, the service prints only the mock code to its local terminal and does not contact the SMS provider. Use test numbers only in mock mode.

## Production deployment

The root Vercel project serves the static web app and exposes this service through a Vercel Function at `/api/*`. Deploy from the repository root using the existing root `vercel.json`; do not set the Vercel Root Directory to `apps/web`. Configure a persistent Redis service and the following production environment variables in Vercel:

- `NODE_ENV=production`
- `PORT` as required by the host
- `REDIS_URL` for the production Redis instance
- `OTP_SECRET_KEY` as a randomly generated secret with at least 32 bytes
- `SMS_ENABLED=true`
- `OTP_MOCK_MODE=false` (or unset)
- `AFRICASTALKING_USERNAME` and `AFRICASTALKING_API_KEY`
- `WEB_ORIGINS` as a comma-separated list of exact production frontend origins (for example, your `*.vercel.app` production domain and custom domain)
- `TRUST_PROXY_HOPS=1` so the rate limiter can use Vercel's forwarded client IP

Leave `VITE_OTP_API_URL` empty: the frontend calls `/api/*` on the same Vercel origin. Set all provider credentials, Redis URL, and the OTP secret in Vercel's server-side environment configuration, never in `VITE_*` variables or source control. Redeploy after setting environment variables. Once deployed, `https://<your-domain>/api/health` should return `{"status":"ok"}`. Africa's Talking may charge for delivered SMS. Do not treat a successful SMS verification as member authentication.
