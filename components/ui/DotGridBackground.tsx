'use client';
import { useEffect, useRef } from 'react';

type Dot = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
};

export default function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match parent container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initDots();
    };

    // Initialize dots
    const initDots = () => {
      const spacing = 40;
      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);
      
      dotsRef.current = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing + spacing / 2;
          const y = j * spacing + spacing / 2;
          dotsRef.current.push({
            x,
            y,
            baseX: x,
            baseY: y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
          });
        }
      }
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
    };

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const mouse = mouseRef.current;
      
      // ⚙️ TWEAK THESE VALUES:
      const attractionRadius = 120;        // How far the mouse affects dots (in pixels)
      const attractionStrength = 0.015;    // How strong the attraction is (lower = gentler)
      const returnStrength = 0.05;         // How fast dots return to original position
      const damping = 0.95;                // Velocity damping (higher = slower stop)
      
      dotsRef.current.forEach((dot) => {
        // Calculate distance to mouse
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse attraction
        if (distance < attractionRadius) {
          const force = (1 - distance / attractionRadius) * attractionStrength;
          dot.vx += dx * force;
          dot.vy += dy * force;
        }
        
        // Return to base position
        const baseX = dot.baseX - dot.x;
        const baseY = dot.baseY - dot.y;
        dot.vx += baseX * returnStrength;
        dot.vy += baseY * returnStrength;
        
        // Apply velocity with damping
        dot.vx *= damping;
        dot.vy *= damping;
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        // Subtle idle animation
        const time = Date.now() * 0.001;
        const idleX = Math.sin(time + dot.baseX * 0.01) * 0.5;
        const idleY = Math.cos(time + dot.baseY * 0.01) * 0.5;
        
        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x + idleX, dot.y + idleY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // ⚙️ Brightness: 0.0 to 1.0
        ctx.fill();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
