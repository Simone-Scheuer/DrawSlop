import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <nav className="main-nav">
        <Link to="/" className="nav-logo">Sketch</Link>
        <div className="nav-links">
          <Link to="/canvas">Canvas</Link>
          <Link to="/gallery">Gallery</Link>
        </div>
      </nav>
      
      <main className="hero-section">
        <h1>Create Beautiful Sketches</h1>
        <p>Express your creativity with our intuitive drawing tools</p>
        <Link to="/canvas" className="cta-button">Start Drawing</Link>
      </main>

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