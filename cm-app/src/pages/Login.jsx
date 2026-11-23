import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ERRORS = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/missing-email': 'Please enter your email address.',
  'auth/too-many-requests': 'Too many attempts. Please try again in a few minutes.',
  'auth/network-request-failed': 'No internet connection.',
};

// Same message whether or not the email has an account, so the form can't be used
// to find out which emails are registered.
const RESET_SENT =
  'If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder.';

export default function Login() {
  const { login, resetPassword } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError('');
    setMessage('');
    setPassword('');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(ERRORS[err.code] || 'Login failed. Please try again.');
      setBusy(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setMessage(RESET_SENT);
    } catch (err) {
      if (err.code === 'auth/user-not-found') setMessage(RESET_SENT);
      else setError(ERRORS[err.code] || 'Could not send the reset email. Please try again.');
    }
    setBusy(false);
  }

  const isReset = mode === 'reset';

  return (
    <div className="login">
      <form className="login__card form" onSubmit={isReset ? handleReset : handleLogin}>
        <div className="login__brand">
          <img className="login__logo" src="/logo-full.png" alt="Malganga Constructions" />
          <p className="muted">{isReset ? 'Reset your password' : 'Sign in to continue'}</p>
        </div>

        {error && <div className="form__error">{error}</div>}
        {message && <div className="form__success" role="status">{message}</div>}

        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>

        {!isReset && (
          <label className="field">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>
        )}

        <button className="btn btn--primary" type="submit" disabled={busy}>
          {isReset ? (busy ? 'Sending…' : 'Send reset link') : busy ? 'Signing in…' : 'Sign in'}
        </button>

        <button type="button" className="link login__switch" onClick={() => switchMode(isReset ? 'login' : 'reset')}>
          {isReset ? '← Back to sign in' : 'Forgot password?'}
        </button>
      </form>
    </div>
  );
}
