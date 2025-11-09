import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  isActive: boolean;
}

const colors = ['#0ea5e9', '#f59e0b', '#10b981', '#fcd34d', '#0369a1'];
const numConfettis = 200;
const duration = 4000; // 4 seconds

interface ConfettiParticle {
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  angle: number;
  angleSpeed: number;
  opacity: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const particles = useRef<ConfettiParticle[]>([]);
  const animationStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Create particles for a burst effect
      particles.current = [];
      for (let i = 0; i < numConfettis; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 6 + 2; // initial speed
        particles.current.push({
          color: colors[Math.floor(Math.random() * colors.length)],
          x: centerX,
          y: centerY,
          w: Math.random() * 8 + 5,
          h: Math.random() * 6 + 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          angle: Math.random() * 360,
          angleSpeed: Math.random() * 10 - 5,
          opacity: 1,
        });
      }

      animationStartTime.current = Date.now();

      const animate = () => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - (animationStartTime.current || currentTime);

        if (!canvasRef.current || elapsedTime > duration) {
            if (canvasRef.current) {
                const currentCtx = canvasRef.current.getContext('2d');
                if (currentCtx) {
                    currentCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
            }
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            return;
        }

        ctx.clearRect(0, 0, rect.width, rect.height);

        particles.current.forEach((p) => {
          // Update physics
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12; // gravity
          p.vx *= 0.99; // friction
          p.angle += p.angleSpeed;
          
          // Fade out towards the end
          if (elapsedTime > duration - 1000) {
              p.opacity = Math.max(0, 1 - (elapsedTime - (duration - 1000)) / 1000);
          }

          // Draw particle
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle * Math.PI / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });

        animationFrameId.current = requestAnimationFrame(animate);
      };

      animate();
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};