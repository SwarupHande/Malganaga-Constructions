import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { logActivity } from '../utils/activity';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Admin = an admins/{uid} doc exists (created by hand in the Firebase Console).
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      setIsAdmin(false);
      if (u) {
        getDoc(doc(db, 'admins', u.uid))
          .then((snap) => setIsAdmin(snap.exists()))
          .catch(() => setIsAdmin(false));
      }
    });
  }, []);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    logActivity(cred.user, 'LOGIN', 'Signed in');
    return cred;
  };
  const logout = async () => {
    // Write the log first: after sign-out the user is no longer allowed to write.
    await logActivity(auth.currentUser, 'LOGOUT', 'Signed out');
    return signOut(auth);
  };
  // Firebase emails a link to its own reset page; works even with public sign-up disabled.
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
