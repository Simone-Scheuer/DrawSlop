import React from 'react';
import { Link } from 'react-router-dom';
import Canvas from '../components/Canvas';
import '../styles/CanvasPage.css';

const CanvasPage = () => {
  return (
    <div className="canvas-page">
      <nav className="main-nav">
        <Link to="/" className="nav-logo">Sketch</Link>
        <div className="nav-links">
          <Link to="/canvas">Canvas</Link>
          <Link to="/gallery">Gallery</Link>
        </div>
      </nav>
      
      <Canvas />
    </div>
  );
};

export default CanvasPage; 