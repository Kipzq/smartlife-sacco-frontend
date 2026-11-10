import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { sendOtp, verifyOtp } from './lib/otpClient';
import saccoLogo from './sacco-logo.png';

const EMPTY_DIGITS = Array(6).fill('');
const RESEND_DELAY = 30;

export default function App() {
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
      setStatus({ message: 'Code sent. For this demo, check the backend terminal for the mock SMS code.', type: 'success' });
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

  const verifyOtp = async (event) => {
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
      const data = await verifyOtp(phone.trim(), code);
      setStep('success');
      setStatus({ message: data.message || 'Your code was verified successfully.', type: 'success' });
    } catch (error) {
      setStatus({
        message: 'We couldn’t confirm your application. Your details are still here; please try again, or call us on +254 700 123 456.',
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
        <div className="eyebrow">SECURE SIGN IN</div>
        <h1 id="page-title">
          {step === 'success' ? 'You’re all set' : step === 'input' ? 'Check your phone' : 'Welcome back'}
        </h1>
        <p className="subtitle">
          {step === 'success'
            ? 'Your identity has been verified successfully.'
            : step === 'input'
              ? 'Enter the 6-digit verification code to continue.'
              : 'Verify your identity to continue to your learning space.'}
        </p>

        {step === 'start' && (
          <form className="form-content" onSubmit={requestCode}>
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
          <form className="form-content" onSubmit={verifyOtp}>
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
            <button className="primary-button" onClick={startOver}>Back to sign in</button>
          </div>
        )}

        {status.message && (
          <p className={`status-message ${status.type}`} role={status.type === 'error' ? 'alert' : 'status'} aria-live="polite">
            {status.message}
          </p>
        )}

        <footer className="card-footer">
          <span className="lock-icon" aria-hidden="true">◇</span>
          Your verification is protected and secure
        </footer>
      </section>
      <p className="page-note">SMARTLIFE SACCO <span>•</span> LEARN WITH CONFIDENCE</p>
    </main>
  );
}
