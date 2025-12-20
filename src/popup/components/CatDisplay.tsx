import { useEffect, useRef, useState } from 'react';
import catRunSprite from '../../content/Cat/Cat Sprite Sheet Run.png';
import catIdleSprite from '../../content/Cat/CatIdle/CatIdle.png';
import catLickSprite from '../../content/Cat/CatLick/CatLick.png';

type CatState = 'idle' | 'run' | 'lick' | 'sleep';

// Sprite configuration matching catScript.ts
const SPRITE_CONFIG = {
  frameWidth: 32,
  frameHeight: 32,
  runFrameCount: 6,
  idleFrameCount: 10,
  lickFrameCount: 8,
};

const CatDisplay = () => {
  const [catState, setCatState] = useState<CatState>('run');
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const speed = 1.5; // pixels per frame (matching catScript.ts)
    const maxPosition = container.clientWidth - SPRITE_CONFIG.frameWidth * 3;

    // Use requestAnimationFrame for smooth movement
    const animate = () => {
      setPosition((prev) => {
        let newPos = prev;
        
        if (catState === 'run') {
          if (direction === 'right') {
            newPos = prev + speed;
            if (newPos >= maxPosition - 20) {
              setDirection('left');
            }
          } else {
            newPos = prev - speed;
            if (newPos <= 20) {
              setDirection('right');
            }
          }
        }
        
        return Math.max(0, Math.min(maxPosition, newPos));
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [catState, direction]);

  // Random state transitions
  useEffect(() => {
    if (catState === 'idle') {
      const timeout = setTimeout(() => {
        if (Math.random() < 0.3) {
          setCatState('sleep');
        } else {
          setCatState('run');
        }
      }, 3000);
      return () => clearTimeout(timeout);
    } else if (catState === 'sleep') {
      const timeout = setTimeout(() => {
        setCatState('run');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [catState]);

  // Listen for reminder trigger
  useEffect(() => {
    const handleReminder = () => {
      setCatState('lick');
      setTimeout(() => {
        setCatState('idle');
      }, 3000);
    };

    window.addEventListener('trigger-cat-lick', handleReminder);
    return () => window.removeEventListener('trigger-cat-lick', handleReminder);
  }, []);

  const getSpriteConfig = () => {
    switch (catState) {
      case 'run':
        return {
          sprite: catRunSprite,
          frameCount: SPRITE_CONFIG.runFrameCount,
          duration: 0.6,
        };
      case 'idle':
        return {
          sprite: catIdleSprite,
          frameCount: SPRITE_CONFIG.idleFrameCount,
          duration: 1.2,
        };
      case 'lick':
      case 'sleep':
        return {
          sprite: catLickSprite,
          frameCount: SPRITE_CONFIG.lickFrameCount,
          duration: 1.0,
        };
    }
  };

  const { frameCount, sprite, duration } = getSpriteConfig();
  const spriteSheetWidth = frameCount * SPRITE_CONFIG.frameWidth;

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-32 overflow-hidden bg-gradient-to-b from-transparent to-slate-100/50 dark:to-slate-800/50 rounded-lg mt-4"
    >
      <style>{`
        @keyframes sprite-anim-${catState} {
          from {
            background-position: 0 0;
          }
          to {
            background-position: -${spriteSheetWidth}px 0;
          }
        }
      `}</style>
      
      <div
        className="absolute"
        style={{
          width: `${SPRITE_CONFIG.frameWidth}px`,
          height: `${SPRITE_CONFIG.frameHeight}px`,
          transform: `translateX(${position}px) scale(${direction === 'left' ? -3 : 3}, ${3})`,
          bottom: '20px',
          
          // Pixel-perfect rendering
          imageRendering: 'pixelated',
          
          // Sprite animation
          backgroundImage: `url(${sprite})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '0 0',
          animation: `sprite-anim-${catState} ${duration}s steps(${frameCount}) infinite`,
          
          // Performance
          willChange: 'transform, background-position',
          backfaceVisibility: 'hidden',
        }}
      />
    </div>
  );
};

export default CatDisplay;
