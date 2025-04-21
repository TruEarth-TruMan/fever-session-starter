
import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  data: number[];
  width?: number | string;
  height?: number;
  color?: string;
}

const WaveformVisualizer = ({ 
  data, 
  width = 200, 
  height = 60,
  color = '#22c55e'
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

    ctx.moveTo(x, height / 2);

    data.forEach((point) => {
      const y = (point * height) / 2 + height / 2;
      ctx.lineTo(x, y);
      x += sliceWidth;
    });

    ctx.lineTo(canvasWidth, height / 2);
    ctx.stroke();

  }, [data, width, height, color]);

  return (
    <canvas
      ref={canvasRef}
      width={typeof width === 'number' ? width : "100%"}
      height={height}
      className="rounded-sm"
      style={{ width: typeof width === 'string' ? width : undefined }}
    />
  );
};

export default WaveformVisualizer;
