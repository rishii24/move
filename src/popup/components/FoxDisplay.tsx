import { useEffect, useRef, useState } from "react";
import foxRunSprite from "../../content/Cat/Fox Sprite Sheet Run.png";

// Sprite configuration for Fox - single row sprite sheet
const SPRITE_CONFIG = {
  frameWidth: 32,
  frameHeight: 32,
  runFrameCount: 6,
  scale: 3,
};

const FoxDisplay = () => {
  const [position, setPosition] = useState(0); // pixels
  const [direction, setDirection] = useState<"right" | "left">("right");
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const speed = 1.5; // pixels per frame
    const maxPosition =
      container.clientWidth - SPRITE_CONFIG.frameWidth * SPRITE_CONFIG.scale;

    // Use requestAnimationFrame for smooth movement
    const animate = () => {
      setPosition((prev) => {
        let newPos = prev;

        if (direction === "right") {
          newPos = prev + speed;
          if (newPos >= maxPosition - 20) {
            setDirection("left");
          }
        } else {
          newPos = prev - speed;
          if (newPos <= 20) {
            setDirection("right");
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
  }, [direction]);

  const spriteSheetWidth =
    SPRITE_CONFIG.runFrameCount * SPRITE_CONFIG.frameWidth;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-32 overflow-hidden bg-gradient-to-b from-transparent to-slate-100/50 dark:to-slate-800/50 rounded-lg mt-4"
    >
      <style>{`
        @keyframes fox-sprite-anim {
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
          transform: `translateX(${position}px) scale(${
            direction === "left" ? -SPRITE_CONFIG.scale : SPRITE_CONFIG.scale
          }, ${SPRITE_CONFIG.scale})`,
          bottom: "20px",

          imageRendering: "pixelated",

          backgroundImage: `url(${foxRunSprite})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 0",
          animation: `fox-sprite-anim 0.6s steps(${SPRITE_CONFIG.runFrameCount}) infinite`,

          willChange: "transform, background-position",
          backfaceVisibility: "hidden",
        }}
      >
        {" "}
      </div>
    </div>
  );
};

export default FoxDisplay;
