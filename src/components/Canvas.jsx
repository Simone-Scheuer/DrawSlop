import React, { useRef, useEffect, useState } from 'react';
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

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    contextRef.current = context;
    updateBrushSettings();
  }, []);

  const updateBrushSettings = () => {
    const context = contextRef.current;
    context.lineWidth = brushSize;
    context.strokeStyle = brushColor;
    context.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
  };

  useEffect(() => {
    updateBrushSettings();
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

  const startDrawing = ({ nativeEvent }) => {
    const { x, y } = getCoordinates(nativeEvent);
    
    if (isDropperActive) {
      const color = getPixelColor(x, y);
      setBrushColor(color);
      setIsDropperActive(false);
      return;
    }

    const context = contextRef.current;
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing || isDropperActive) return;
    const { x, y } = getCoordinates(nativeEvent);
    const context = contextRef.current;
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const context = contextRef.current;
    context.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (isDropperActive) {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = 'default';
    }
  }, [isDropperActive]);

  return (
    <div className="canvas-wrapper">
      <canvas
        className="canvas"
        ref={canvasRef}
        width={window.innerWidth * 0.8}
        height={window.innerHeight * 0.8}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div className="toolbar">
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          disabled={isErasing}
        />
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
        />
        <button
          onClick={() => {
            setIsDropperActive(!isDropperActive);
            setIsErasing(false);
          }}
          className={isDropperActive ? 'active' : ''}
          disabled={isErasing}
        >
          {isDropperActive ? 'Cancel Dropper' : 'Color Dropper'}
        </button>
        <button
          onClick={() => {
            setIsErasing(!isErasing);
            setIsDropperActive(false);
          }}
          className={isErasing ? 'active' : ''}
        >
          {isErasing ? 'Draw' : 'Erase'}
        </button>
        <button onClick={clearCanvas}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default Canvas;
