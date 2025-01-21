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

      <section className="features">
        <div className="feature">
          <h2>Draw</h2>
          <p>Create artwork with our powerful canvas tools</p>
        </div>
        <div className="feature">
          <h2>Save</h2>
          <p>Store your creations in your personal gallery</p>
        </div>
        <div className="feature">
          <h2>Share</h2>
          <p>Share your artwork with the community</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 