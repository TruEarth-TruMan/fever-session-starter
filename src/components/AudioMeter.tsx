
import { useEffect, useRef } from 'react';

interface AudioMeterProps {
  level: number;
  width?: number;
  height?: number;
}

const AudioMeter = ({ level, width = 20, height = 100 }: AudioMeterProps) => {
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

    // Calculate meter height based on input level
    const meterHeight = Math.max(2, height * level);
    const y = height - meterHeight;

    // Draw meter gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#22c55e');  // Green for low levels
    gradient.addColorStop(0.7, '#eab308'); // Yellow for mid levels
    gradient.addColorStop(1, '#ef4444');   // Red for high levels
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, width, meterHeight);

    // Draw peak line
    if (level > 0.8) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, y, width, 2);
    }

  }, [level, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-sm"
    />
  );
};

export default AudioMeter;
