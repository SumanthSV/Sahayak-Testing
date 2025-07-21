import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'tech';
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ variant = 'tech' }) => {
  const techParticles = Array.from({ length: 50 }, (_, i) => i);


  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Tech grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Floating tech particles */}
      {techParticles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            scale: [null, Math.random() * 0.5 + 0.5],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: Math.random() * 15 + 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Tech aurora effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(6, 182, 212, 0.05), rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05))",
            "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05), rgba(6, 182, 212, 0.05))",
            "linear-gradient(225deg, rgba(168, 85, 247, 0.05), rgba(6, 182, 212, 0.05), rgba(59, 130, 246, 0.05))",
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};