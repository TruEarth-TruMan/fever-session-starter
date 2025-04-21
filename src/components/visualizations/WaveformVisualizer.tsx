
import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  data: number[];
  width?: number | string;
  height?: number;
  color?: string;
  isExpanded?: boolean;
}

const WaveformVisualizer = ({ 
  data, 
  width = 200, 
  height = 40,
  color = '#22c55e',
  isExpanded = false
}: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get actual width value for calculations
    const canvasWidth = typeof width === 'number' ? width : canvas.clientWidth;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, height);

    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasWidth, height);

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const sliceWidth = canvasWidth / data.length;
    let x = 0;

    // Apply smoothing for better visualization
    const smoothingFactor = Math.min(5, Math.floor(data.length / 20));
    const smoothedData = smoothData(data, smoothingFactor);

    ctx.moveTo(x, height / 2);

    smoothedData.forEach((point) => {
      const y = (point * height) / 2 + height / 2;
      ctx.lineTo(x, y);
      x += sliceWidth;
    });

    ctx.lineTo(canvasWidth, height / 2);
    ctx.stroke();

    // If expanded, add more detailed visualization
    if (isExpanded && data.length > 20) {
      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Horizontal center line
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(canvasWidth, height / 2);
      ctx.stroke();

      // Draw peak outline
      ctx.beginPath();
      ctx.strokeStyle = `${color}88`; // Semi-transparent color
      ctx.lineWidth = 1;

      x = 0;
      ctx.moveTo(x, height / 2);
      smoothedData.forEach((point) => {
        const y = (point * height * 0.8) / 2 + height / 2;
        ctx.lineTo(x, y);
        x += sliceWidth;
      });
      ctx.lineTo(canvasWidth, height / 2);
      ctx.stroke();
    }

  }, [data, width, height, color, isExpanded]);

  // Helper function to smooth waveform data
  const smoothData = (data: number[], factor: number): number[] => {
    if (factor <= 1) return data;
    
    const result = [];
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = Math.max(0, i - factor); j <= Math.min(data.length - 1, i + factor); j++) {
        sum += data[j];
        count++;
      }
      
      result.push(sum / count);
    }
    
    return result;
  };

  const finalHeight = isExpanded ? height * 2 : height;

  return (
    <canvas
      ref={canvasRef}
      width={typeof width === 'number' ? width : "100%"}
      height={finalHeight}
      className={`rounded-sm ${isExpanded ? 'max-h-20' : 'max-h-10'}`}
      style={{ width: typeof width === 'string' ? width : undefined }}
    />
  );
};

export default WaveformVisualizer;
