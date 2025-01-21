import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadDrawing } from '../services/drawingService';
import '../styles/Canvas.css';
import '../styles/Toolbar.css';

const Canvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [isErasing, setIsErasing] = useState(false);
  const [isDropperActive, setIsDropperActive] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [drawingName, setDrawingName] = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const canvas = canvasRef.current;
    
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;
      
      // Fill with white background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, rect.width, rect.height);
      
      updateBrushSettings();
    };

    // Initial setup
    updateCanvasSize();
    saveCanvasState();

    // Update size on window resize
    const handleResize = () => {
      updateCanvasSize();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('mousemove', handleWindowMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', stopDrawing);
      window.removeEventListener('mousemove', handleWindowMouseMove);
    };
  }, []);

  const updateBrushSettings = () => {
    const context = contextRef.current;
    if (!context) return; // Guard against null context
    
    context.lineWidth = brushSize;
    context.strokeStyle = brushColor;
    context.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
  };

  useEffect(() => {
    if (contextRef.current) { // Only update if context exists
      updateBrushSettings();
    }
  }, [brushColor, brushSize, isErasing]);

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const getPixelColor = (x, y) => {
    const context = contextRef.current;
    const pixelData = context.getImageData(x, y, 1, 1).data;
    return `#${[...pixelData].slice(0, 3).map(x => x.toString(16).padStart(2, '0')).join('')}`;
  };

  const startDrawing = (event) => {
    const coords = getCoordinates(event);
    
    if (isDropperActive) {
      const color = getPixelColor(coords.x, coords.y);
      setBrushColor(color);
      setIsDropperActive(false);
      return;
    }

    const context = contextRef.current;
    context.beginPath();
    context.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing || isDropperActive) return;

    const coords = getCoordinates(event);
    const context = contextRef.current;
    context.lineTo(coords.x, coords.y);
    context.stroke();
  };

  const handleWindowMouseMove = (event) => {
    if (!isDrawing) return;

    const coords = getCoordinates(event);
    const context = contextRef.current;
    context.lineTo(coords.x, coords.y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const context = contextRef.current;
    context.closePath();
    setIsDrawing(false);
    saveCanvasState();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'drawslop-artwork.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePublishClick = () => {
    if (!user) {
      alert('Please sign in to publish your artwork');
      return;
    }
    setShowNameInput(true);
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!drawingName.trim()) {
      alert('Please enter a name for your artwork');
      return;
    }

    try {
      setIsPublishing(true);
      console.log('Starting publish process...');
      
      const canvas = canvasRef.current;
      console.log('Converting canvas to data URL...');
      const dataUrl = canvas.toDataURL('image/png');
      
      console.log('Uploading drawing...');
      const drawingId = await uploadDrawing(dataUrl, user.uid, drawingName.trim());
      console.log('Drawing uploaded successfully with ID:', drawingId);
      
      alert('Your artwork has been published to the gallery! You can view it in the Gallery page.');
      setShowNameInput(false);
      setDrawingName('');
    } catch (error) {
      console.error('Error publishing artwork:', error);
      let errorMessage = 'Failed to publish artwork. ';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'You do not have permission to upload. Please sign in again.';
      } else if (error.code === 'storage/canceled') {
        errorMessage += 'Upload was cancelled.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage += 'Storage quota exceeded.';
      } else {
        errorMessage += 'Please try again. If the problem persists, check your internet connection.';
      }
      
      alert(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (isDropperActive) {
      canvas.style.cursor = 'crosshair';
    } else if (isErasing) {
      canvas.style.cursor = 'cell';
    } else {
      canvas.style.cursor = 'crosshair';
    }
  }, [isDropperActive, isErasing]);

  // Save canvas state after each stroke
  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    const newState = canvas.toDataURL();
    setUndoStack(prevStack => [...prevStack, newState]);
  };

  // Undo last action
  const handleUndo = () => {
    if (undoStack.length <= 1) return; // Keep at least the initial state
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const previousState = undoStack[undoStack.length - 2]; // Get the previous state
    
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    
    setUndoStack(prevStack => prevStack.slice(0, -1));
  };

  // Add keyboard shortcut for undo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack]);

  return (
    <div className="canvas-page">
      <div className="canvas-wrapper">
        <canvas
          className="canvas"
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      <div className="toolbar">
        <div className="tool-group">
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            title="Undo (Ctrl/Cmd + Z)"
          >
            ↩️ Undo
          </button>
        </div>

        <div className="tool-group">
          <div className="color-tools">
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              disabled={isErasing}
              title="Color Picker"
            />
            <button
              onClick={() => {
                setIsDropperActive(!isDropperActive);
                setIsErasing(false);
              }}
              className={isDropperActive ? 'active' : ''}
              disabled={isErasing}
              title="Color Dropper"
            >
              {isDropperActive ? 'Cancel Dropper' : '🔍'}
            </button>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            title="Brush Size"
          />
        </div>

        <div className="tool-group">
          <button
            onClick={() => {
              setIsErasing(!isErasing);
              setIsDropperActive(false);
            }}
            className={isErasing ? 'active' : ''}
            title="Eraser Tool"
          >
            {isErasing ? 'Draw' : '🧹 Erase'}
          </button>
          <button onClick={clearCanvas} title="Clear Canvas">
            🗑️ Clear
          </button>
        </div>

        <div className="tool-group">
          <button onClick={downloadCanvas} className="download-btn" title="Save to Computer">
            💾 Save
          </button>
          <button 
            onClick={handlePublishClick} 
            className="publish-btn"
            disabled={isPublishing || !user}
            title={user ? 'Publish to Gallery' : 'Sign in to Publish'}
          >
            {isPublishing ? 'Publishing...' : '🌐 Publish'}
          </button>
        </div>
      </div>

      {showNameInput && (
        <div className="name-input-overlay">
          <div className="name-input-modal">
            <h3>Name Your Artwork</h3>
            <form onSubmit={handlePublishSubmit}>
              <input
                type="text"
                value={drawingName}
                onChange={(e) => setDrawingName(e.target.value)}
                placeholder="Enter a name for your artwork"
                maxLength={50}
                required
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowNameInput(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={isPublishing}>
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
