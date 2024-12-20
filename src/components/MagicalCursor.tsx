import React, { useEffect, useState, useCallback, useRef } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export default function MagicalCursor() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const lastUpdate = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const updatePosition = useCallback((e: MouseEvent) => {
    if (isScrolling.current) return;

    const now = Date.now();
    if (now - lastUpdate.current < 16) return; // Limit to ~60fps
    lastUpdate.current = now;

    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      isScrolling.current = true;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
        if (cursorRef.current) {
          cursorRef.current.style.opacity = '1';
        }
      }, 150);
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.body.classList.add('wand-cursor');

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('wand-cursor');
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [updatePosition]);

  return (
    <div 
      ref={cursorRef}
      className="cursor-dot"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) rotate(45deg)`
      }}
    />
  );
} 