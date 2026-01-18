'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Header Component
 * 
 * Accurately recreates the screenshot design with:
 * - Three red B's arranged vertically (left side)
 * - "Brick by Brick" text next to the B's
 * - Yellow LEGO pattern bar (middle)
 * - Three icon panels on the right (GitHub, MLH, Deer)
 * - Framer Motion animations for entrance and hover effects
 */

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Header Container - Logo and Banner side-by-side */}
      <motion.div 
        className="flex items-center px-4 h-20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo Section - Three red B's VERTICALLY + Text (left side) */}
        <div className="flex-shrink-0 flex items-center gap-3 bg-white px-2">
          {/* Three B's Logo - VERTICAL layout, all red */}
          <div className="flex flex-col gap-0.5">
            <motion.span 
              className="text-3xl font-bold leading-none text-red-600"
              style={{ fontFamily: 'Arial, sans-serif' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              B
            </motion.span>
            <motion.span 
              className="text-3xl font-bold leading-none text-red-600"
              style={{ fontFamily: 'Arial, sans-serif' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              B
            </motion.span>
            <motion.span 
              className="text-3xl font-bold leading-none text-red-600"
              style={{ fontFamily: 'Arial, sans-serif' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              B
            </motion.span>
          </div>
          
          {/* Brand Text - Black (as per screenshot) */}
          <motion.span 
            className="text-2xl font-medium text-black"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            Brick by Brick
          </motion.span>
        </div>

        {/* Spacer to push banner to the right */}
        <div className="flex-1" />

        {/* Banner Section - Yellow LEGO pattern + Icon panels (right side) */}
        <div className="flex-shrink-0 h-20 flex">
          {/* Left: Yellow LEGO Pattern Bar (takes ~66% of space) */}
          <motion.div 
            className="w-2/3 bg-yellow-400 lego-pattern h-full"
            initial={{ width: 0 }}
            animate={{ width: '66.666%' }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
          />

          {/* Right: Three Vertical Icon Panels (takes ~33% of space) */}
          <div className="w-1/3 grid grid-rows-3 divide-y divide-gray-300 border-l border-gray-300 h-full">
            {/* GitHub Panel - White background, black logo */}
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="GitHub"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#000000" className="w-8 h-8">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </motion.a>

            {/* MLH Panel - White background with red text */}
            <motion.a
              href="https://mlh.io"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors py-1"
              aria-label="Major League Hacking"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-0.5 mb-0.5">
                {/* M - Red */}
                <span className="text-2xl font-bold text-red-600" style={{ fontFamily: 'Arial, sans-serif' }}>M</span>
                {/* L - Red */}
                <span className="text-2xl font-bold text-red-600" style={{ fontFamily: 'Arial, sans-serif' }}>L</span>
                {/* H - Red */}
                <span className="text-2xl font-bold text-red-600" style={{ fontFamily: 'Arial, sans-serif' }}>H</span>
              </div>
              <span className="text-[8px] text-gray-500 font-medium uppercase tracking-wide leading-tight">Major League Hacking</span>
            </motion.a>

            {/* Deer Panel - Dark background with gradient antlers (blue and purple per screenshot) */}
            <motion.a
              href="#"
              className="bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors"
              aria-label="Deer Logo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <defs>
                  {/* Gradient for antlers: purple → blue (as per screenshot) */}
                  <linearGradient id="antlerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9B59B6" /> {/* Purple */}
                    <stop offset="100%" stopColor="#3498DB" /> {/* Blue */}
                  </linearGradient>
                </defs>
                
                {/* Deer head circle */}
                <circle cx="12" cy="10" r="4" stroke="white" strokeWidth="1.5" fill="none" />
                
                {/* Eyes */}
                <ellipse cx="9.5" cy="9.5" rx="0.8" ry="1.2" fill="white" />
                <ellipse cx="14.5" cy="9.5" rx="0.8" ry="1.2" fill="white" />
                
                {/* Nose/mouth */}
                <path d="M12 13 L10 15 L14 15 Z" fill="white" />
                
                {/* Left antler with gradient */}
                <g stroke="url(#antlerGradient)" strokeWidth="2" fill="none">
                  <path d="M7 8 L5 4 M8 7 L6 3" />
                  <circle cx="5" cy="4" r="1.5" fill="url(#antlerGradient)" />
                  <circle cx="6" cy="3" r="1.5" fill="url(#antlerGradient)" />
                </g>
                
                {/* Right antler with gradient */}
                <g stroke="url(#antlerGradient)" strokeWidth="2" fill="none">
                  <path d="M17 8 L19 4 M16 7 L18 3" />
                  <circle cx="19" cy="4" r="1.5" fill="url(#antlerGradient)" />
                  <circle cx="18" cy="3" r="1.5" fill="url(#antlerGradient)" />
                </g>
              </svg>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
