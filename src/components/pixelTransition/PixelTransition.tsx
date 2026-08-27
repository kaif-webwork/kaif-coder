import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import './PixelTransition.css';

export interface PixelTransitionProps {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  gridSize?: number;
  pixelColor?: string;
  animationStepDuration?: number;
  once?: boolean;
  aspectRatio?: string;
  className?: string;
  style?: React.CSSProperties;
  isActive?: boolean;
  onToggle?: (active: boolean) => void;
  trigger?: 'hover' | 'click' | 'none' | 'auto';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = '#ffffff',
  animationStepDuration = 0.3,
  once = false,
  aspectRatio = '100%',
  className = '',
  style = {},
  isActive: controlledIsActive,
  onToggle,
  trigger = 'auto',
  onClick,
}: PixelTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelGridRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const delayedCallRef = useRef<gsap.core.Tween | null>(null);

  const [internalActive, setInternalActive] = useState<boolean>(false);
  const activeState = controlledIsActive !== undefined ? controlledIsActive : internalActive;

  const isMountedRef = useRef<boolean>(false);
  const isAnimatingRef = useRef<boolean>(false);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches);

  // Build grid pixels
  useEffect(() => {
    const pixelGridEl = pixelGridRef.current;
    if (!pixelGridEl) return;

    pixelGridEl.innerHTML = '';

    const size = 100 / gridSize;
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixelated-image-card__pixel');
        pixel.style.backgroundColor = pixelColor;
        pixel.style.width = `${size}%`;
        pixel.style.height = `${size}%`;
        pixel.style.left = `${col * size}%`;
        pixel.style.top = `${row * size}%`;
        pixelGridEl.appendChild(pixel);
      }
    }
  }, [gridSize, pixelColor]);

  // Pixel Animation
  const animatePixels = useCallback(
    (activate: boolean) => {
      const pixelGridEl = pixelGridRef.current;
      const activeEl = activeRef.current;
      if (!pixelGridEl || !activeEl) return;

      const pixels = pixelGridEl.querySelectorAll('.pixelated-image-card__pixel');
      if (!pixels.length) return;

      gsap.killTweensOf(pixels);
      if (delayedCallRef.current) {
        delayedCallRef.current.kill();
      }

      gsap.set(pixels, { display: 'none' });

      const totalPixels = pixels.length;
      const staggerDuration = animationStepDuration / totalPixels;

      isAnimatingRef.current = true;

      // Stage 1: Pixels randomly appear (cover)
      gsap.to(pixels, {
        display: 'block',
        duration: 0,
        stagger: {
          each: staggerDuration,
          from: 'random',
        },
      });

      // Halfway: Switch active layer
      delayedCallRef.current = gsap.delayedCall(animationStepDuration, () => {
        if (activeEl) {
          activeEl.style.display = activate ? 'block' : 'none';
          activeEl.style.pointerEvents = activate ? 'auto' : 'none';
        }
      });

      // Stage 2: Pixels randomly disappear (reveal)
      gsap.to(pixels, {
        display: 'none',
        duration: 0,
        delay: animationStepDuration,
        stagger: {
          each: staggerDuration,
          from: 'random',
        },
        onComplete: () => {
          isAnimatingRef.current = false;
        },
      });
    },
    [animationStepDuration]
  );

  const prevControlledRef = useRef<boolean | undefined>(controlledIsActive);

  // Handle controlled state transitions
  useEffect(() => {
    if (controlledIsActive !== undefined) {
      if (!isMountedRef.current) {
        isMountedRef.current = true;
        prevControlledRef.current = controlledIsActive;
        if (activeRef.current) {
          activeRef.current.style.display = controlledIsActive ? 'block' : 'none';
          activeRef.current.style.pointerEvents = controlledIsActive ? 'auto' : 'none';
        }
        return;
      }

      if (controlledIsActive !== prevControlledRef.current) {
        prevControlledRef.current = controlledIsActive;
        animatePixels(controlledIsActive);
      }
    } else {
      isMountedRef.current = true;
    }
  }, [controlledIsActive, animatePixels]);

  // Clean up GSAP on unmount
  useEffect(() => {
    const gridEl = pixelGridRef.current;
    return () => {
      if (delayedCallRef.current) {
        delayedCallRef.current.kill();
      }
      if (gridEl) {
        const pixels = gridEl.querySelectorAll('.pixelated-image-card__pixel');
        gsap.killTweensOf(pixels);
      }
    };
  }, []);

  const triggerAnimation = (activate: boolean) => {
    if (controlledIsActive === undefined) {
      setInternalActive(activate);
      animatePixels(activate);
    }
    if (onToggle) {
      onToggle(activate);
    }
  };

  const handleEnter = () => {
    if (trigger === 'none') return;
    if (trigger === 'hover' || (trigger === 'auto' && !isTouchDevice)) {
      if (!activeState) triggerAnimation(true);
    }
  };

  const handleLeave = () => {
    if (trigger === 'none') return;
    if (trigger === 'hover' || (trigger === 'auto' && !isTouchDevice)) {
      if (activeState && !once) triggerAnimation(false);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) onClick(e);
    if (trigger === 'none') return;
    if (trigger === 'click' || (trigger === 'auto' && isTouchDevice)) {
      if (!activeState) triggerAnimation(true);
      else if (activeState && !once) triggerAnimation(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`pixelated-image-card ${className}`}
      style={style}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      onFocus={handleEnter}
      onBlur={handleLeave}
      tabIndex={0}
    >
      {aspectRatio && <div className="pixelated-image-card__spacer" style={{ paddingTop: aspectRatio }} />}
      <div className="pixelated-image-card__default" aria-hidden={activeState}>
        {firstContent}
      </div>
      <div className="pixelated-image-card__active" ref={activeRef} aria-hidden={!activeState}>
        {secondContent}
      </div>
      <div className="pixelated-image-card__pixels" ref={pixelGridRef} />
    </div>
  );
}
