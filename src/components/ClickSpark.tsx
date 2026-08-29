import { useRef, useEffect, useCallback } from 'react';
import type { ReactNode, MouseEvent } from 'react';

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
  children: ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

export default function ClickSpark({
  sparkColor = '#ffffff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1,
  children,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const animFrameRef = useRef<number>(0);
  const animateRef = useRef<() => void>(() => {});

  const ease = useCallback(
    (t: number) => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-out':
          return t * (2 - t);
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t;
      }
    },
    [easing]
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    const activeSparks: Spark[] = [];

    for (const spark of sparksRef.current) {
      const elapsed = now - spark.startTime;
      if (elapsed >= duration) continue;

      const progress = ease(elapsed / duration);
      const x =
        spark.x + Math.cos(spark.angle) * sparkRadius * progress * extraScale;
      const y =
        spark.y + Math.sin(spark.angle) * sparkRadius * progress * extraScale;
      const size = sparkSize * (1 - progress);
      const alpha = 1 - progress;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(spark.angle);

      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 4, 0);
      ctx.lineTo(0, size / 2);
      ctx.lineTo(-size / 4, 0);
      ctx.closePath();
      ctx.fillStyle = sparkColor;
      ctx.fill();
      ctx.restore();

      activeSparks.push(spark);
    }

    sparksRef.current = activeSparks;

    if (activeSparks.length > 0) {
      animFrameRef.current = requestAnimationFrame(() => {
        animateRef.current();
      });
    }
  }, [duration, ease, extraScale, sparkColor, sparkRadius, sparkSize]);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = Date.now();

      const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
      }));

      sparksRef.current.push(...newSparks);

      if (animFrameRef.current === 0 || sparksRef.current.length === sparkCount) {
        animFrameRef.current = requestAnimationFrame(() => {
          animateRef.current();
        });
      }
    },
    [sparkCount]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }} onClick={handleClick}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
      {children}
    </div>
  );
}
