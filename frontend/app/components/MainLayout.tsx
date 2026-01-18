'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MainLayout Component
 * 
 * Accurately recreates the screenshot design with:
 * - Environment section (left): Red button, 5 red indicators, dashed box
 * - Objects section (right): Teal button, 3 teal indicators, empty space
 * - Framer Motion animations for interactions and state changes
 * - Light gray background matching screenshot
 */

interface SectionButtonProps {
  label: string;
  color: 'red' | 'teal';
  indicators: number;
  isActive: boolean;
  onClick: () => void;
}

function SectionButton({ label, color, indicators, isActive, onClick }: SectionButtonProps) {
  const bgColor = color === 'red' ? 'bg-red-600' : 'bg-teal-500';
  const indicatorColor = color === 'red' ? 'bg-red-600' : 'bg-teal-500';
  
  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Main Button */}
      <motion.button
        onClick={onClick}
        className={`${bgColor} text-white px-6 py-2 rounded-full font-medium shadow-sm`}
        whileHover={{ scale: 1.05, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        aria-label={`${label} section button`}
      >
        {label}
      </motion.button>
      
      {/* Indicator Dots */}
      <div className="flex gap-2">
        {Array.from({ length: indicators }).map((_, i) => (
          <motion.button
            key={i}
            onClick={onClick}
            className={`w-3 h-3 ${indicatorColor} rounded-full ${
              isActive ? 'opacity-100' : 'opacity-70'
            }`}
            aria-label={`${label} indicator ${i + 1}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: isActive ? 1 : 0.7,
              scale: 1
            }}
            transition={{ 
              delay: i * 0.1,
              duration: 0.3
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MainLayout() {
  const [environmentActive, setEnvironmentActive] = useState(true);
  const [objectsActive, setObjectsActive] = useState(false);

  return (
    <motion.div 
      className="min-h-screen bg-gray-100 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="grid grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
        {/* Left: Environment Section */}
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <SectionButton
            label="Environment"
            color="red"
            indicators={5}
            isActive={environmentActive}
            onClick={() => setEnvironmentActive(!environmentActive)}
          />
          
          {/* Dashed Box Container */}
          <AnimatePresence mode="wait">
            {environmentActive && (
              <motion.div 
                className="flex-1 border-2 border-dashed border-gray-400 rounded-lg p-8 flex items-center justify-center bg-white/50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <motion.p 
                  className="text-gray-700 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  whatever tailwind upload
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right: Objects Section */}
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <SectionButton
            label="Objects"
            color="teal"
            indicators={3}
            isActive={objectsActive}
            onClick={() => setObjectsActive(!objectsActive)}
          />
          
          {/* Empty Space */}
          <AnimatePresence mode="wait">
            {objectsActive ? (
              <motion.div 
                className="flex-1 bg-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <motion.div 
                className="flex-1 bg-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
