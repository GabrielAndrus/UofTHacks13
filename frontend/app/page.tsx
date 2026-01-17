'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with Three.js
// Using ssr: false ensures it never renders on server
const SequentialBuilderExample = dynamic(
  () => import('./components/SequentialBuilderExample'),
  { 
    ssr: false,
    loading: () => (
      <div
        key="loading"
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          color: 'white',
          fontFamily: 'monospace',
        }}
      >
        Loading LEGO Builder...
      </div>
    ),
  }
);

export default function Home() {
  // Always return the same structure - dynamic import handles the rest
  return <SequentialBuilderExample />;
}
