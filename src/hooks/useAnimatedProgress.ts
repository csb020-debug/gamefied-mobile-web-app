import { useState, useEffect } from 'react';

interface UseAnimatedProgressProps {
  targetValue: number;
  duration?: number;
  delay?: number;
  easing?: 'ease-out' | 'ease-in' | 'ease-in-out' | 'linear';
}

export const useAnimatedProgress = ({ 
  targetValue, 
  duration = 700, 
  delay = 0,
  easing = 'ease-out' 
}: UseAnimatedProgressProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (targetValue === 0) {
      setAnimatedValue(0);
      return;
    }

    const timer = setTimeout(() => {
      setIsAnimating(true);
      setAnimatedValue(targetValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [targetValue, delay]);

  const easingFunctions = {
    'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'linear': 'linear'
  };

  const transitionStyle = {
    transition: `width ${duration}ms ${easingFunctions[easing]}`,
    width: `${animatedValue}%`
  };

  return {
    animatedValue,
    isAnimating,
    transitionStyle
  };
};
