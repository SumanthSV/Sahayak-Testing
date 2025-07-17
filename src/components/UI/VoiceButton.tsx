import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceButtonProps {
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onPlayAudio?: () => void;
  hasAudio?: boolean;
  isPlaying?: boolean;
  position?: 'fixed' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isRecording = false,
  onStartRecording,
  onStopRecording,
  onPlayAudio,
  hasAudio = false,
  isPlaying = false,
  position = 'inline',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = () => {
    if (hasAudio && onPlayAudio) {
      onPlayAudio();
    } else if (isRecording && onStopRecording) {
      onStopRecording();
    } else if (onStartRecording) {
      onStartRecording();
    }
  };

  const getButtonContent = () => {
    if (hasAudio) {
      return (
        <Volume2 
          className={`${iconSizes[size]} ${isPlaying ? 'text-blue-600' : 'text-gray-600'}`} 
        />
      );
    }
    
    if (isRecording) {
      return <MicOff className={`${iconSizes[size]} text-red-600`} />;
    }
    
    return <Mic className={`${iconSizes[size]} text-green-600`} />;
  };

  const getButtonColor = () => {
    if (hasAudio) {
      return isPlaying ? 'bg-blue-100 hover:bg-blue-200' : 'bg-gray-100 hover:bg-gray-200';
    }
    
    if (isRecording) {
      return 'bg-red-100 hover:bg-red-200';
    }
    
    return 'bg-green-100 hover:bg-green-200';
  };

  const getAriaLabel = () => {
    if (hasAudio) {
      return isPlaying ? 'Stop audio' : 'Play audio';
    }
    
    if (isRecording) {
      return 'Stop recording';
    }
    
    return 'Start recording';
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`
        ${sizeClasses[size]} 
        ${getButtonColor()}
        ${position === 'fixed' ? 'fixed bottom-6 right-6 z-40 shadow-lg' : ''}
        ${isRecording ? 'recording-pulse' : ''}
        rounded-full flex items-center justify-center transition-all duration-300
        touch-target focus-ring
      `}
      aria-label={getAriaLabel()}
      role="button"
    >
      {getButtonContent()}
      
      {/* Recording indicator */}
      {isRecording && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
        />
      )}
    </motion.button>
  );
};