import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';

interface MagicalCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
  floating?: boolean;
}

export const MagicalCard: React.FC<MagicalCardProps> = ({
  children,
  className = "",
  glowColor = 'purple',
  floating = false
}) => {
  const glowColors = {
    purple: 'shadow-purple-500/25 border-purple-500/30',
    blue: 'shadow-blue-500/25 border-blue-500/30',
    green: 'shadow-green-500/25 border-green-500/30',
    orange: 'shadow-orange-500/25 border-orange-500/30',
    pink: 'shadow-pink-500/25 border-pink-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02, 
        y: floating ? -5 : 0,
        boxShadow: `0 20px 40px rgba(168, 85, 247, 0.3)`
      }}
      transition={{ duration: 0.3 }}
      className={`
        relative backdrop-blur-xl bg-white/10 dark:bg-black/20 
        rounded-2xl border border-white/20 dark:border-gray-700/30
        ${glowColors[glowColor]} shadow-2xl
        overflow-hidden group
        ${className}
      `}
    >
      {/* Magical border glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating sparkles */}
      <motion.div
        animate={{
          scale: [0, 1, 0],
          rotate: [0, 180, 360],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: Math.random() * 2
        }}
        className="absolute top-4 right-4 text-yellow-400"
      >
        <Sparkles className="w-4 h-4" />
      </motion.div>
      
      <motion.div
        animate={{
          scale: [0, 1, 0],
          rotate: [360, 180, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: Math.random() * 2
        }}
        className="absolute bottom-4 left-4 text-pink-400"
      >
        <Star className="w-3 h-3" />
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};