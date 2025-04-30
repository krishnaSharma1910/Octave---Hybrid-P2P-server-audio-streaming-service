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
  repeatCount?: number;
  direction?: "left" | "right";
}

export function ScrollingText({
  text,
  className,
  speed = "medium",
  pauseOnHover = true,
  width = "300px",
  height = "50px",
  repeatCount = 2,
  direction = "left",
}: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [needsAnimation, setNeedsAnimation] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(15);

  useEffect(() => {
    const speedMap = {
      slow: 20,
      medium: 15,
      fast: 10,
    };
    setAnimationDuration(speedMap[speed]);
  }, [speed]);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      const shouldAnimate = textWidth > containerWidth;

      setNeedsAnimation(shouldAnimate);

      if (shouldAnimate) {
        const duration = (textWidth / containerWidth) * animationDuration;
        textRef.current.style.animationDuration = `${duration}s`;
      } else {
        const textElement = textRef.current;
        textElement.style.animation = "none";
        textElement.style.transform = "translateX(0)";
      }
    }
  }, [text, animationDuration]);

  const renderText = () => {
    if (!needsAnimation) return text;
    return Array.from({ length: repeatCount }, (_, i) => (
      <span key={i} className="inline-block pr-4">
        {text}
      </span>
    ));
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-md flex items-center",
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
          "whitespace-nowrap",
          needsAnimation && "animate-scroll",
          pauseOnHover && "hover:animation-play-state-paused"
        )}
        style={{
          ...(needsAnimation && {
            animationDirection: direction === "left" ? "normal" : "reverse",
          }),
        }}
      >
        {renderText()}
      </div>

      {/* Removed jsx prop from style element */}
      <style>
        {`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-scroll {
            animation: scroll linear infinite;
          }
          .hover\\:animation-play-state-paused:hover {
            animation-play-state: paused;
          }
        `}
      </style>
    </div>
  );
}