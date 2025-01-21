import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log('Starting Google sign-in process...');
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in successful:', result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      if (error.code === 'auth/popup-blocked') {
        alert('Please allow popups for this website to sign in with Google');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in popup was closed by the user');
      } else {
        alert('Failed to sign in with Google. Please try again.');
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 