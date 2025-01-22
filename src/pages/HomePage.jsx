import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <Navigation />
      <div className="hero-section">
        <h1>Create <del>Beautiful</del> Art</h1>
        <p className="subtitle">Welcome to the internet's graffiti wall</p>
        <Link to="/canvas" className="cta-button">Start Drawing Slop</Link>
      </div>
    </div>
  );
};

export default HomePage; 