import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { getRecentDrawings } from '../services/drawingService';
import '../styles/GalleryPage.css';

const GalleryPage = () => {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add a timeout to fail gracefully if it takes too long
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 10000)
        );
        
        const fetchPromise = getRecentDrawings();
        const fetchedDrawings = await Promise.race([fetchPromise, timeoutPromise]);
        
        setDrawings(fetchedDrawings);
      } catch (err) {
        console.error('Error fetching drawings:', err);
        setError(err.message === 'Request timed out' 
          ? 'Loading is taking longer than expected. Please try again.' 
          : 'Failed to load drawings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDrawings();
  }, []);

  return (
    <div className="gallery-container">
      <Navigation />
      <div className="gallery-content">
        <h1>Global Gallery</h1>
        
        {loading && (
          <div className="loading-message">
            <p>Loading drawings...</p>
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              Retry
            </button>
          </div>
        )}
        
        {!loading && !error && drawings.length === 0 && (
          <p className="no-drawings">No drawings yet. Be the first to share your artwork!</p>
        )}
        
        {!loading && !error && drawings.length > 0 && (
          <div className="drawings-grid">
            {drawings.map((drawing) => (
              <div key={drawing.id} className="drawing-item">
                <img 
                  src={drawing.imageUrl} 
                  alt="User Artwork" 
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBmYWlsZWQgdG8gbG9hZDwvdGV4dD48L3N2Zz4=';
                  }}
                />
                <div className="drawing-info">
                <p className="drawing-title">{drawing.title || 'Untitled'}</p> {/* Add title rendering here */}
                  <p className="drawing-date">
                    {new Date(drawing.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage; 