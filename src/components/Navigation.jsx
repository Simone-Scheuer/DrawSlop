import React from 'react';
import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navigation.css';

const Navigation = () => {
  const { user } = useAuth();

  return (
    <nav className="main-nav">
      <Link to="/" className="nav-logo">DrawSlop</Link>
      <div className="nav-content">
        <div className="nav-links">
          <Link to="/canvas">Canvas</Link>
          <Link to="/gallery">Global Gallery</Link>
          {user && <Link to="/my-gallery">My Drawings</Link>}
        </div>
        <LoginButton />
      </div>
    </nav>
  );
};

export default Navigation; 