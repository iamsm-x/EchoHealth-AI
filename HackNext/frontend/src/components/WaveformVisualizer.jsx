import { useEffect, useRef } from 'react';

export default function WaveformVisualizer({ isRecording }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let bars = [];
    const barCount = 40;

    for (let i = 0; i < barCount; i++) {
      bars.push({
        x: i * (canvas.width / barCount),
        h: 2,
        targetH: 2
      });
    }

    const animate = () => {
      // Resolve colors from CSS variables
      const style = getComputedStyle(document.body);
      const color1 = style.getPropertyValue('--primary').trim() || '#4f46e5';
      const color2 = style.getPropertyValue('--secondary').trim() || '#06b6d4';

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      bars.forEach((bar, i) => {
        if (isRecording) {
          if (Math.random() > 0.8) {
            bar.targetH = Math.random() * canvas.height * 0.8;
          }
        } else {
          bar.targetH = 2;
        }

        bar.h += (bar.targetH - bar.h) * 0.15;

        try {
          // Draw bar
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, color1);
          gradient.addColorStop(1, color2);
          
          ctx.fillStyle = gradient;
          const w = (canvas.width / barCount) * 0.6;
          const x = i * (canvas.width / barCount);
          const y = (canvas.height - bar.h) / 2;
          
          roundRect(ctx, x, y, w, bar.h, 4);
        } catch (e) {
          // Fallback to solid color if gradient fails
          ctx.fillStyle = '#4f46e5';
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    function roundRect(ctx, x, y, width, height, radius) {
      if (width < 2 * radius) radius = width / 2;
      if (height < 2 * radius) radius = height / 2;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
      ctx.fill();
    }

    animate();
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRecording]);

  return (
    <div className="w-full h-24 flex items-center justify-center overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={80} 
        className="w-full max-w-md opacity-80"
      />
    </div>
  );
}
