/**
 * TypeScript declarations for React Three Fiber JSX elements
 * 
 * This extends the JSX namespace to include Three.js elements like
 * <group>, <mesh>, <ambientLight>, etc. as valid JSX elements.
 * 
 * For React Three Fiber v9+
 */

import 'react';
import { ThreeElements } from '@react-three/fiber';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
