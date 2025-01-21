import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { getUserDrawings, deleteDrawing } from '../services/drawingService';
import '../styles/GalleryPage.css';

const MyGalleryPage = () => {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDrawings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 10000)
        );
        
        const fetchPromise = getUserDrawings(user.uid);
        const fetchedDrawings = await Promise.race([fetchPromise, timeoutPromise]);
        
        console.log('Fetched drawings:', fetchedDrawings);
        // Log each drawing's data
        fetchedDrawings.forEach(drawing => {
          console.log('Drawing:', {
            id: drawing.id,
            title: drawing.title,
            createdAt: drawing.createdAt,
            imageUrl: drawing.imageUrl
          });
        });
        
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
  }, [user]);

  const handleDelete = async (drawingId, isAutoDelete = false) => {
    // Only show confirmation for manual deletes
    if (!isAutoDelete) {
      const confirmed = window.confirm('Are you sure you want to delete this drawing? This cannot be undone.');
      if (!confirmed) {
        return;
      }
    }

    try {
      console.log('Starting deletion of drawing:', drawingId);
      await deleteDrawing(drawingId);
      console.log('Successfully deleted drawing:', drawingId);
      // Update the local state to remove the deleted drawing
      setDrawings(prevDrawings => prevDrawings.filter(drawing => drawing.id !== drawingId));
    } catch (error) {
      console.error('Full error in handleDelete:', error);
      if (!isAutoDelete) {
        alert(`Failed to delete drawing: ${error.message}`);
      }
    }
  };

  if (!user) {
    return <Navigate to="/gallery" replace />;
  }

  return (
    <div className="gallery-container">
      <Navigation />
      <div className="gallery-content">
        <h1>My Drawings</h1>
        
        {loading && (
          <div className="loading-message">
            <p>Loading your drawings...</p>
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
          <p className="no-drawings">You haven't published any drawings yet. Head to the Canvas to create some art!</p>
        )}
        
        {!loading && !error && drawings.length > 0 && (
          <div className="drawings-grid">
            {drawings.map((drawing) => {
              console.log('Rendering drawing:', drawing); // Debug drawing data
              return (
                <div key={drawing.id} className="drawing-item">
                  {drawing.imageUrl ? (
                    <img 
                      src={drawing.imageUrl} 
                      alt={drawing.title || 'Untitled'} 
                      loading="lazy"
                      onError={(e) => {
                        console.error('Image failed to load:', drawing.imageUrl);
                        e.target.onerror = null;
                        handleDelete(drawing.id, true); // Pass true for auto-delete
                      }}
                    />
                  ) : (
                    <div className="missing-image">Image not found</div>
                  )}
                  <div className="drawing-info">
                    <p className="drawing-title">{drawing.title || 'Untitled'}</p>
                    <p className="drawing-date">
                      {new Date(drawing.createdAt).toLocaleString()}
                    </p>
                    <button 
                      onClick={() => handleDelete(drawing.id, false)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGalleryPage; 