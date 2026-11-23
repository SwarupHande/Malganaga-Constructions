import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase';

// Our own themed page for the link in Firebase's password reset email.
// Firebase Console → Authentication → Templates → "Customize action URL" points here: <site>/auth/action
const ERRORS = {
  'auth/expired-action-code': 'This reset link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This reset link is invalid or has already been used. Please request a new one.',
  'auth/user-disabled': 'This account has been disabled. Contact the admin.',
  'auth/user-not-found': 'This account no longer exists. Contact the admin.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/network-request-failed': 'No internet connection.',
};
const errorText = (err) => ERRORS[err.code] || 'Something went wrong. Please request a new reset link.';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get('mode');
  const code = params.get('oobCode');

  const [status, setStatus] = useState('checking'); // checking | ready | done | invalid
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Check the link is still valid before showing the form.
  useEffect(() => {
    if (mode !== 'resetPassword' || !code) {
      setError('This link is not a valid password reset link.');
      setStatus('invalid');
      return undefined;
    }
    let cancelled = false;
    verifyPasswordResetCode(auth, code)
      .then((addr) => {
        if (cancelled) return;
        setEmail(addr);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(errorText(err));
        setStatus('invalid');
      });
    return () => {
      cancelled = true;
    };
  }, [mode, code]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      await confirmPasswordReset(auth, code, password);
      setStatus('done');
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  const goToSignIn = () => navigate('/', { replace: true });

  return (
    <div className="login">
      <form className="login__card form" onSubmit={handleSubmit}>
        <div className="login__brand">
          <img className="login__logo" src="/logo-full.png" alt="Malganga Constructions" />
          <p className="muted">Reset your password</p>
        </div>

        {status === 'checking' && <p className="muted">Checking your reset link…</p>}

        {error && <div className="form__error" role="alert">{error}</div>}

        {status === 'ready' && (
          <>
            <p className="muted">
              Choose a new password for <strong>{email}</strong>
            </p>
            <label className="field">
              New password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={6} required autoFocus />
            </label>
            <label className="field">
              Confirm new password
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" minLength={6} required />
            </label>
            <button className="btn btn--primary" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save new password'}
            </button>
          </>
        )}

        {status === 'done' && (
          <>
            <div className="form__success" role="status">Your password has been changed. You can now sign in with your new password.</div>
            <button className="btn btn--primary" type="button" onClick={goToSignIn}>Go to sign in</button>
          </>
        )}

        {status === 'invalid' && (
          <button className="btn btn--primary" type="button" onClick={goToSignIn}>Back to sign in</button>
        )}
      </form>
    </div>
  );
}
