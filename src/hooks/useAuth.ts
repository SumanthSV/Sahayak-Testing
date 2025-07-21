import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Enable offline persistence for authenticated users
      if (user) {
        // Store user session for offline access
        localStorage.setItem('sahayak_user_session', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          lastLogin: new Date().toISOString()
        }));
      } else {
        // Clear session on logout
        localStorage.removeItem('sahayak_user_session');
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};