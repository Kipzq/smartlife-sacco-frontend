import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { sendOtp, verifyOtp } from './lib/otpClient';
import MembershipPage from './MembershipPage';
import MemberPortal from './MemberPortal';
import PublicSite from './PublicSite';
import saccoLogo from './sacco-logo.png';

const EMPTY_DIGITS = Array(6).fill('');
const RESEND_DELAY = 30;

function AuthPage() {
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState(EMPTY_DIGITS);
  const [status, setStatus] = useState({ message: '', type: 'info' });
  const [step, setStep] = useState('start');
  const [loading, setLoading] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = window.setTimeout(() => setResendIn((time) => time - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const requestCode = async (event) => {
    event?.preventDefault();
    const normalizedPhone = phone.trim();
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setStatus({ message: 'Enter your phone number in international format, for example +254700000000.', type: 'error' });
      return;
    }

    setLoading('send');
    setStatus({ message: 'Sending your verification code…', type: 'info' });

    try {
      await sendOtp(normalizedPhone);
      setStep('input');
      setDigits([...EMPTY_DIGITS]);
      setResendIn(RESEND_DELAY);
      setStatus({ message: 'Demo code generated. It is printed in the backend terminal; this does not sign you in to a member account.', type: 'success' });
      window.setTimeout(() => refs.current[0]?.focus(), 0);
    } catch (error) {
      setStatus({ message: error.message || 'Could not connect to the backend.', type: 'error' });
    } finally {
      setLoading('');
    }
  };

  const fillDigits = (startIndex, value) => {
    const numbers = value.replace(/\D/g, '').slice(0, 6 - startIndex);
    if (!numbers) return;
    const nextDigits = [...digits];
    [...numbers].forEach((number, offset) => {
      nextDigits[startIndex + offset] = number;
    });
    setDigits(nextDigits);
    const nextIndex = startIndex + numbers.length;
    refs.current[Math.min(nextIndex, 5)]?.focus();
    setStatus({ message: '', type: 'info' });
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text');
    const numbers = pasted.replace(/\D/g, '').slice(0, 6);
    if (numbers) fillDigits(0, numbers);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setStatus({ message: 'Enter all 6 digits to continue.', type: 'error' });
      refs.current[digits.findIndex((digit) => !digit)]?.focus();
      return;
    }

    setLoading('verify');
    setStatus({ message: 'Verifying your code…', type: 'info' });

    try {
      await verifyOtp(phone.trim(), code);
      setStep('success');
      setStatus({
        message: 'Demo phone check complete. No member account or secure session has been created.',
        type: 'success',
      });
    } catch (error) {
      setStatus({
        message: 'We couldn’t verify the demo code. Your phone number is still here; please try again, or call us on +254 700 123 456.',
        type: 'error',
      });
      setDigits([...EMPTY_DIGITS]);
      refs.current[0]?.focus();
    } finally {
      setLoading('');
    }
  };

  const startOver = () => {
    setStep('start');
    setDigits([...EMPTY_DIGITS]);
    setStatus({ message: '', type: 'info' });
  };

  return (
    <main className="page-shell">
      <header className="brand">
        <img className="brand-logo" src={saccoLogo} alt="Smartlife Sacco Logo" />
        <span>Smartlife Sacco</span>
      </header>

      <section className="auth-card" aria-labelledby="page-title">
        <div className="eyebrow">DEMO PHONE CHECK</div>
        <h1 id="page-title">
          {step === 'success' ? 'Demo check complete' : step === 'input' ? 'Check your phone' : 'Verify your phone'}
        </h1>
        <p className="subtitle">
          {step === 'success'
            ? 'The demo code was accepted. This does not sign you in to a member account.'
            : step === 'input'
              ? 'Enter the 6-digit verification code to continue.'
              : 'Try the phone verification demo. It does not confirm membership or provide access to an account.'}
        </p>

        {step === 'start' && (
          <form className="form-content" onSubmit={requestCode}>
            <p className="demo-warning" role="note">
              Demo only: the backend logs the entered phone number and mock code. Use a test number only; never enter a real member number or sensitive information.
            </p>
            <label className="phone-label" htmlFor="phone">Phone number</label>
            <input
              id="phone"
              className="phone-input"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+254700000000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={Boolean(loading)}
              required
            />
            <p className="phone-help">Use international format, including the + and country code.</p>
            <button className="primary-button" type="submit" disabled={Boolean(loading)}>
              {loading === 'send' ? 'Sending code…' : 'Send verification code'}
              {loading !== 'send' && <span aria-hidden="true">→</span>}
            </button>
          </form>
        )}

        {step === 'input' && (
          <form className="form-content" onSubmit={handleVerifyOtp}>
            <div className="code-inputs" onPaste={handlePaste} aria-label="Verification code">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { refs.current[index] = element; }}
                  className="code-digit"
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  pattern="[0-9]*"
                  maxLength={6}
                  value={digit}
                  onChange={(event) => fillDigits(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  aria-label={`Digit ${index + 1}`}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <button className="primary-button" type="submit" disabled={Boolean(loading)}>
              {loading === 'verify' ? 'Verifying…' : 'Verify and continue'}
              {loading !== 'verify' && <span aria-hidden="true">→</span>}
            </button>
            <div className="resend-row">
              <span>Didn’t receive a code?</span>
              {resendIn > 0 ? (
                <span className="resend-timer">Resend in {resendIn}s</span>
              ) : (
                <button className="text-button" type="button" onClick={requestCode} disabled={Boolean(loading)}>
                  Resend code
                </button>
              )}
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="form-content">
            <div className="success-icon" aria-hidden="true">✓</div>
            <a className="primary-button" href="/member">View member portal preview <span aria-hidden="true">→</span></a>
            <button className="text-button" type="button" onClick={startOver}>Try the demo again</button>
          </div>
        )}

        {status.message && (
          <p className={`status-message ${status.type}`} role={status.type === 'error' ? 'alert' : 'status'} aria-live="polite">
            {status.message}
          </p>
        )}

        <footer className="card-footer">
          <span className="lock-icon" aria-hidden="true">◇</span>
          No member account or secure session is created
        </footer>
      </section>
      <p className="page-note">SMARTLIFE SACCO <span>•</span> LEARN WITH CONFIDENCE</p>
    </main>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  useEffect(() => {
    const pageDetails = {
      '/': {
        title: 'Smartlife SACCO | Save Today. Grow Tomorrow.',
        description: 'Explore Smartlife SACCO membership, savings, member services and responsible credit options.',
      },
      '/login': {
        title: 'Demo phone check | Smartlife SACCO',
        description: 'Try the Smartlife SACCO demo phone verification. This does not create a member session.',
      },
      '/membership': {
        title: 'Membership | Smartlife SACCO',
        description: 'Learn about the Smartlife SACCO membership application process and what to prepare.',
      },
      '/member': {
        title: 'Member portal preview | Smartlife SACCO',
        description: 'Preview the Smartlife SACCO member portal. Member accounts and financial data are not connected.',
      },
    };
    const details = pageDetails[path] || pageDetails['/'];
    document.title = details.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', details.description);
  }, [path]);

  if (path === '/login') return <AuthPage />;
  if (path === '/membership') return <MembershipPage />;
  if (path === '/member') return <MemberPortal />;
  return <PublicSite />;
}
