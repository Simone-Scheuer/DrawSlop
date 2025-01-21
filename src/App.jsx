import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CanvasPage from './pages/CanvasPage';
import GalleryPage from './pages/GalleryPage';
import MyGalleryPage from './pages/MyGalleryPage';
import { AuthProvider } from './contexts/AuthContext';
import './styles/global.css';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/my-gallery" element={<MyGalleryPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 