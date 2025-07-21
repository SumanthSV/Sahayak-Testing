import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ThreeDSceneProps {
  sceneType: 'login' | 'signup';
}

export const ThreeDScene: React.FC<ThreeDSceneProps> = ({ sceneType }) => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This would integrate with Three.js or Spline
    // For now, we'll create a CSS-based 3D scene
    const scene = sceneRef.current;
    if (!scene) return;

    // Add 3D transformations and animations
    scene.style.perspective = '1000px';
    scene.style.transformStyle = 'preserve-3d';
  }, []);

  if (sceneType === 'signup') {
    return (
      <div ref={sceneRef} className="absolute inset-0 pointer-events-none">
        {/* AI Academy silhouette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-t from-blue-900/50 to-transparent"
          style={{
            clipPath: 'polygon(20% 100%, 30% 80%, 40% 85%, 50% 70%, 60% 85%, 70% 80%, 80% 100%)',
            transform: 'rotateX(10deg) rotateY(-5deg)',
          }}
        />
        
        {/* Floating tech orbs */}
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-sm"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div ref={sceneRef} className="absolute inset-0 pointer-events-none">
      {/* AI Robot silhouette */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 0.2, x: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute left-10 top-1/2 transform -translate-y-1/2 w-32 h-48 bg-gradient-to-b from-cyan-500/30 to-blue-500/30 rounded-2xl"
        style={{
          transform: 'rotateY(15deg) rotateX(5deg)',
        }}
      />
      
      {/* Student silhouette */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.2, x: 0 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
        className="absolute right-10 top-1/2 transform -translate-y-1/2 w-24 h-40 bg-gradient-to-b from-purple-500/30 to-pink-500/30 rounded-full"
        style={{
          transform: 'rotateY(-15deg) rotateX(5deg)',
        }}
      />
      
      {/* Floating tech elements */}
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-cyan-400 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            scale: [0.5, 1, 0.5],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};