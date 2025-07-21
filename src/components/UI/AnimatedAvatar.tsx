import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Wand2, 
  Gamepad2, 
  Robot, 
  BookOpen, 
  Sparkles,
  Crown,
  Shield,
  Zap
} from 'lucide-react';

interface AnimatedAvatarProps {
  type: 'educational' | 'story' | 'game' | 'loading' | 'concept' | 'visual' | 'assessment';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ 
  type, 
  size = 'md',
  className = "" 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getAvatarConfig = () => {
    switch (type) {
      case 'educational':
        return {
          icon: GraduationCap,
          gradient: 'from-blue-500 to-indigo-600',
          animation: {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          },
          duration: 3
        };
      case 'story':
        return {
          icon: BookOpen,
          gradient: 'from-purple-500 to-pink-600',
          animation: {
            scale: [1, 1.15, 1],
            y: [0, -5, 0]
          },
          duration: 2.5
        };
      case 'game':
        return {
          icon: Crown,
          gradient: 'from-yellow-500 to-orange-600',
          animation: {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          },
          duration: 2
        };
      case 'loading':
        return {
          icon: Robot,
          gradient: 'from-cyan-500 to-blue-600',
          animation: {
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          },
          duration: 2
        };
      case 'concept':
        return {
          icon: Zap,
          gradient: 'from-green-500 to-emerald-600',
          animation: {
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          },
          duration: 1.5
        };
      case 'visual':
        return {
          icon: Sparkles,
          gradient: 'from-orange-500 to-red-600',
          animation: {
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          },
          duration: 3
        };
      case 'assessment':
        return {
          icon: Shield,
          gradient: 'from-red-500 to-pink-600',
          animation: {
            scale: [1, 1.1, 1],
            x: [0, 2, -2, 0]
          },
          duration: 2.5
        };
      default:
        return {
          icon: GraduationCap,
          gradient: 'from-gray-500 to-gray-600',
          animation: { scale: [1, 1.1, 1] },
          duration: 2
        };
    }
  };

  const config = getAvatarConfig();
  const Icon = config.icon;

  return (
    <motion.div
      animate={config.animation}
      transition={{
        duration: config.duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br ${config.gradient} 
        rounded-full flex items-center justify-center 
        shadow-lg relative overflow-hidden
        ${className}
      `}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50 blur-md rounded-full`} />
      
      {/* Icon */}
      <Icon className={`${iconSizes[size]} text-white relative z-10`} />
      
      {/* Magical sparkles for story/game types */}
      {(type === 'story' || type === 'game') && (
        <>
          <motion.div
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5
            }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
          />
          <motion.div
            animate={{
              scale: [0, 1, 0],
              rotate: [360, 180, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1
            }}
            className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full"
          />
        </>
      )}
      
      {/* Tech particles for loading/educational */}
      {(type === 'loading' || type === 'educational') && (
        <>
          <motion.div
            animate={{
              y: [-2, 2, -2],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.2
            }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-300 rounded-full"
          />
          <motion.div
            animate={{
              y: [2, -2, 2],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.7
            }}
            className="absolute bottom-0 right-1/4 w-1 h-1 bg-blue-300 rounded-full"
          />
        </>
      )}
    </motion.div>
  );
};