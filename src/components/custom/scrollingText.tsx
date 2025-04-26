"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollingTextProps {
  text: string;
  className?: string;
  speed?: "slow" | "medium" | "fast";
  pauseOnHover?: boolean;
  width?: string;
  height?: string;
}

export function ScrollingText({
  text,
  className,
  speed = "medium",
  pauseOnHover = true,
  width = "300px",
  height = "50px",
}: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState(15);

  // Set animation speed
  useEffect(() => {
    const speedMap = {
      slow: 20,
      medium: 15,
      fast: 10,
    };
    setAnimationDuration(speedMap[speed]);
  }, [speed]);

  // Calculate animation duration based on text length
  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;

      // Only animate if text is wider than container
      if (textWidth > containerWidth) {
        const textElement = textRef.current;
        textElement.style.animationDuration = `${animationDuration}s`;
        textElement.style.animationName = "scrollText";
      } else {
        // Center the text if it doesn't overflow
        const textElement = textRef.current;
        textElement.style.animationName = "none";
        textElement.style.transform = "translateX(0)";
      }
    }
  }, [text, animationDuration]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-md",
        className
      )}
      style={{
        width,
        height,
      }}
      aria-label={`Scrolling text: ${text}`}
    >
      <div
        ref={textRef}
        className={cn(
          "absolute whitespace-nowrap",
          pauseOnHover && "hover:animation-play-state-paused"
        )}
        style={{
          animation: `scrollText ${animationDuration}s linear infinite`,
        }}
      >
        {text}
      </div>

      <style>{`
        @keyframes scrollText {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .hover\\:animation-play-state-paused:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
