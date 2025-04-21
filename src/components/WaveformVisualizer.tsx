
import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const WaveformVisualizer = ({ 
  data, 
  width = 200, 
  height = 40,
  color = '#22c55e'
}: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const sliceWidth = width / data.length;
    let x = 0;

    ctx.moveTo(x, height / 2);

    data.forEach((point) => {
      const y = (point * height) / 2 + height / 2;
      ctx.lineTo(x, y);
      x += sliceWidth;
    });

    ctx.lineTo(width, height / 2);
    ctx.stroke();

  }, [data, width, height, color]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-sm max-h-10"
    />
  );
};

export default WaveformVisualizer;
