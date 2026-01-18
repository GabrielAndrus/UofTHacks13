'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import MainLayout from './components/MainLayout';

/**
 * Main Page Component
 * 
 * 🎓 Learning Points:
 * 1. Component composition - combining Header + MainLayout
 * 2. Layout structure with React fragments (<>) or div wrappers
 * 3. This is the entry point for your app
 */

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <MainLayout />
      </main>
    </div>
  );
}
