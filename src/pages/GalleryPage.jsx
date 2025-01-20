import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/GalleryPage.css';

const GalleryPage = () => {
  return (
    <div className="gallery-container">
      <nav className="main-nav">
        <Link to="/" className="nav-logo">Sketch</Link>
        <div className="nav-links">
          <Link to="/canvas">Canvas</Link>
          <Link to="/gallery">Gallery</Link>
        </div>
      </nav>

      <div className="gallery-content">
        <h1>Your Gallery</h1>
        <p className="coming-soon">Gallery feature coming soon!</p>
        <div className="placeholder-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="placeholder-item">
              <div className="placeholder-image"></div>
              <p>Artwork {index + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryPage; 