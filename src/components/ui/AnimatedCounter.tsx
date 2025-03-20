
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  formatter = (val) => val.toFixed(0),
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);
  
  useEffect(() => {
    startValue.current = displayValue;
    startTime.current = null;
    
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = timestamp - startTime.current;
      
      if (progress < duration) {
        const percentage = progress / duration;
        // Easing function: cubic-bezier(0.34, 1.56, 0.64, 1)
        const eased = percentage < 0.5
          ? 4 * percentage * percentage * percentage
          : 1 - Math.pow(-2 * percentage + 2, 3) / 2;
        
        const currentValue = startValue.current + (value - startValue.current) * eased;
        setDisplayValue(currentValue);
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [value, duration]);
  
  return (
    <div 
      ref={counterRef} 
      className={cn("font-medium", className)}
      aria-live="polite"
    >
      {formatter(displayValue)}
    </div>
  );
};

export default AnimatedCounter;
