import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Sparkles } from 'lucide-react';

interface LoadingTeacherProps {
  message?: string;
  isVisible: boolean;
}

export const LoadingTeacher: React.FC<LoadingTeacherProps> = ({ 
  message = "Generating your teaching content... Please wait ⏳", 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        {/* 3D Teacher Avatar Animation */}
        <div className="relative mb-6">
          <motion.div
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center relative overflow-hidden"
          >
            <GraduationCap className="w-12 h-12 text-white" />
            
            {/* Floating elements around avatar */}
            <motion.div
              animate={{ 
                y: [-10, 10, -10],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <BookOpen className="w-3 h-3 text-white" />
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [10, -10, 10],
                rotate: [360, 180, 0]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-3 h-3 text-white" />
            </motion.div>
          </motion.div>
          
          {/* Ripple effect */}
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-green-400 rounded-full"
          />
        </div>
        
        {/* Loading message */}
        <motion.h3
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-lg font-semibold text-gray-800 mb-2"
        >
          AI Teacher at Work
        </motion.h3>
        
        <p className="text-gray-600 text-sm mb-4">{message}</p>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};