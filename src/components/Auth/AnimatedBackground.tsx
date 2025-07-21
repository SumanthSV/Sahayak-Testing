import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'tech' | 'magical';
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ variant = 'tech' }) => {
  const techParticles = Array.from({ length: 50 }, (_, i) => i);
  const magicalParticles = Array.from({ length: 30 }, (_, i) => i);

  if (variant === 'magical') {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* Magical floating particles */}
        {magicalParticles.map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
              scale: [null, Math.random() * 0.5 + 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Magical aurora effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1), rgba(251, 146, 60, 0.1))",
              "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(251, 146, 60, 0.1), rgba(168, 85, 247, 0.1))",
              "linear-gradient(225deg, rgba(251, 146, 60, 0.1), rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

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