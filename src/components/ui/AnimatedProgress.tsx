import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showGlow?: boolean;
  color?: string;
  height?: string;
  label?: string;
  showPercentage?: boolean;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  className,
  showGlow = false,
  color = 'bg-[#B8EE7C]',
  height = 'h-4',
  label,
  showPercentage = true
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  useEffect(() => {
    if (value === 0) {
      setAnimatedValue(0);
      return;
    }

    setIsAnimating(true);
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);

    return () => clearTimeout(timer);
  }, [value, max, percentage]);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={cn("bg-gray-200 rounded-full overflow-hidden", height)}>
        <div
          className={cn(
            "rounded-full transition-all duration-700 ease-out relative",
            color,
            showGlow && "shadow-lg shadow-current/30"
          )}
          style={{
            width: `${animatedValue}%`,
            transition: "width 700ms cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          {showGlow && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
          {isAnimating && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
