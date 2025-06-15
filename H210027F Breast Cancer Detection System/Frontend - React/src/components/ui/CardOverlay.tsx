
import React from 'react';
import { cn } from '@/lib/utils';

interface CardOverlayProps {
  children: React.ReactNode;
  className?: string;
}

const CardOverlay = ({ children, className }: CardOverlayProps) => {
  return (
    <div 
      className={cn(
        "glass-panel p-6 transition-all duration-300 animate-scale-in",
        className
      )}
    >
      {children}
    </div>
  );
};

export default CardOverlay;
