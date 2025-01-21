import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LoginButton.css';

const LoginButton = () => {
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="auth-container">
      {user ? (
        <div className="user-info">
          <span className="user-name">{user.email}</span>
          <button onClick={signOut} className="sign-out-btn">Sign Out</button>
        </div>
      ) : (
        <button onClick={signInWithGoogle} className="sign-in-btn">
          Sign in with Google
        </button>
      )}
    </div>
  );
};

export default LoginButton; 