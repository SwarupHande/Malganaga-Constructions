import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ERRORS = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please try again in a few minutes.',
  'auth/network-request-failed': 'No internet connection.',
};

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
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

  return (
    <div className="login">
      <form className="login__card form" onSubmit={handleSubmit}>
        <div className="login__brand">
          <img className="login__logo" src="/logo-full.png" alt="Malganga Constructions" />
          <p className="muted">Sign in to continue</p>
        </div>

        {error && <div className="form__error">{error}</div>}

        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label className="field">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>

        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
