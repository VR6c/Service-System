import React, { useEffect, useState, useRef } from 'react';

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatter?: (val: number) => string;
}

/**
 * High performance 60/120fps ease-out number counter
 * Uses requestAnimationFrame with exponential decay easing for a silky smooth finish.
 */
export const useAnimatedCount = (targetValue: number, durationMs: number = 800, decimals: number = 0) => {
  const [displayValue, setDisplayValue] = useState<number>(targetValue);
  const startValRef = useRef<number>(targetValue);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // If target value hasn't changed or isn't a valid number, skip
    if (isNaN(targetValue)) return;

    const startVal = displayValue;
    startValRef.current = startVal;
    startTimeRef.current = null;

    // Smooth exponential ease-out curve (feels snappy at start, settles softly)
    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = easeOutExpo(progress);

      const current = startVal + (targetValue - startVal) * easedProgress;
      const factor = Math.pow(10, decimals);
      setDisplayValue(Math.round(current * factor) / factor);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [targetValue, durationMs, decimals]);

  return displayValue;
};

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 850,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  formatter
}) => {
  const current = useAnimatedCount(value, duration, decimals);

  const formattedValue = formatter
    ? formatter(current)
    : current.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });

  return (
    <span className={`inline-block tabular-nums transition-opacity duration-150 ${className}`}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};
