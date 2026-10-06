import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  gridSize = 8,
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
  const animTimeoutsRef = useRef<number[]>([]);

  const [internalActive, setInternalActive] = useState<boolean>(false);
  const activeState = controlledIsActive !== undefined ? controlledIsActive : internalActive;

  const isMountedRef = useRef<boolean>(false);
  const isAnimatingRef = useRef<boolean>(false);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches);

  const clearAnimationTimeouts = useCallback(() => {
    animTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    animTimeoutsRef.current = [];
  }, []);

  // Build grid pixels with single-batch DocumentFragment to avoid reflows
  useEffect(() => {
    const pixelGridEl = pixelGridRef.current;
    if (!pixelGridEl) return;

    pixelGridEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const size = 100 / gridSize;
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixelated-image-card__pixel';
        pixel.style.cssText = `background-color:${pixelColor};width:${size}%;height:${size}%;left:${col * size}%;top:${row * size}%;display:none;`;
        fragment.appendChild(pixel);
      }
    }
    pixelGridEl.appendChild(fragment);
  }, [gridSize, pixelColor]);

  // High-performance native JavaScript Pixel Animation (Zero external dependencies)
  const animatePixels = useCallback(
    (activate: boolean) => {
      const pixelGridEl = pixelGridRef.current;
      const activeEl = activeRef.current;
      if (!pixelGridEl || !activeEl) return;

      const pixels = Array.from(
        pixelGridEl.querySelectorAll<HTMLElement>('.pixelated-image-card__pixel')
      );
      if (!pixels.length) return;

      clearAnimationTimeouts();

      // Reset pixels initially
      for (let i = 0; i < pixels.length; i++) {
        pixels[i].style.display = 'none';
      }

      const totalPixels = pixels.length;
      const stepMs = (animationStepDuration * 1000) / totalPixels;
      const halfTimeMs = animationStepDuration * 1000;

      isAnimatingRef.current = true;

      // Randomize reveal order
      const shuffleCover = [...pixels].sort(() => Math.random() - 0.5);
      shuffleCover.forEach((pixel, index) => {
        const tid = window.setTimeout(() => {
          pixel.style.display = 'block';
        }, index * stepMs);
        animTimeoutsRef.current.push(tid);
      });

      // Halfway: Switch active layer
      const midTid = window.setTimeout(() => {
        if (activeEl) {
          activeEl.style.display = activate ? 'block' : 'none';
          activeEl.style.pointerEvents = activate ? 'auto' : 'none';
        }
      }, halfTimeMs);
      animTimeoutsRef.current.push(midTid);

      // Randomize uncover order
      const shuffleReveal = [...pixels].sort(() => Math.random() - 0.5);
      shuffleReveal.forEach((pixel, index) => {
        const tid = window.setTimeout(() => {
          pixel.style.display = 'none';
        }, halfTimeMs + index * stepMs);
        animTimeoutsRef.current.push(tid);
      });

      // Completion callback
      const doneTid = window.setTimeout(() => {
        isAnimatingRef.current = false;
      }, halfTimeMs + totalPixels * stepMs + 20);
      animTimeoutsRef.current.push(doneTid);
    },
    [animationStepDuration, clearAnimationTimeouts]
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAnimationTimeouts();
    };
  }, [clearAnimationTimeouts]);

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
      role="region"
      aria-label="Interactive profile image transition"
    >
      {aspectRatio && (
        <div className="pixelated-image-card__spacer" style={{ paddingTop: aspectRatio }} />
      )}
      <div className="pixelated-image-card__default" aria-hidden={activeState}>
        {firstContent}
      </div>
      <div
        className="pixelated-image-card__active"
        ref={activeRef}
        aria-hidden={!activeState}
      >
        {secondContent}
      </div>
      <div className="pixelated-image-card__pixels" ref={pixelGridRef} />
    </div>
  );
}
