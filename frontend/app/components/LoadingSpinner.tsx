'use client';

import React from 'react';

/**
 * LoadingSpinner Component
 * 
 * 🎓 Learning Points:
 * 1. CSS animations with @keyframes (defined in globals.css)
 * 2. animate-spin utility class for rotation
 * 3. Conditional rendering based on loading state
 * 4. Accessibility with aria-label for screen readers
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-gray-600 animate-pulse">{text}</p>}
    </div>
  );
}

/**
 * PulseLoader - Alternative loading style using pulse animation
 */
export function PulseLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      {text && <p className="text-gray-600 ml-2">{text}</p>}
    </div>
  );
}