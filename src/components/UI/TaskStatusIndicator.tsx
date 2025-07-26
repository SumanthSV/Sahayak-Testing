import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download, 
  X, 
  Loader2,
  FileText,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import toast from 'react-hot-toast';

interface TaskStatusIndicatorProps {
  position?: 'fixed' | 'inline';
  showDetails?: boolean;
  onComplete?: (resultUrl: string) => void;
  onError?: (error: string) => void;
}

export const TaskStatusIndicator: React.FC<TaskStatusIndicatorProps> = ({
  position = 'fixed',
  showDetails = true,
  onComplete,
  onError
}) => {
  const { currentTask, isPolling, clearTask, getTaskDuration } = useTask();
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update duration every second
  useEffect(() => {
    if (currentTask && currentTask.status === 'pending') {
      const interval = setInterval(() => {
        setDuration(getTaskDuration());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentTask, getTaskDuration]);

  // Handle task completion
  useEffect(() => {
    if (currentTask?.status === 'complete' && currentTask.resultUrl) {
      toast.success('Task completed successfully!');
      if (onComplete) {
        onComplete(currentTask.resultUrl);
      }
    } else if (currentTask?.status === 'error') {
      toast.error(currentTask.error || 'Task failed');
      if (onError) {
        onError(currentTask.error || 'Unknown error');
      }
    }
  }, [currentTask?.status, currentTask?.resultUrl, currentTask?.error, onComplete, onError]);

  if (!currentTask) return null;

  const getTaskIcon = () => {
    switch (currentTask.type) {
      case 'pdf-generation':
        return <FileText className="w-5 h-5" />;
      case 'image-generation':
        return <ImageIcon className="w-5 h-5" />;
      default:
        return <Loader2 className="w-5 h-5" />;
    }
  };

  const getStatusIcon = () => {
    switch (currentTask.status) {
      case 'pending':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (currentTask.status) {
      case 'pending':
        return `Generating... (${duration}s)`;
      case 'complete':
        return 'Task completed!';
      case 'error':
        return 'Task failed';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (currentTask.status) {
      case 'pending':
        return 'from-blue-500 to-cyan-500';
      case 'complete':
        return 'from-green-500 to-emerald-500';
      case 'error':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const handleDownload = () => {
    if (currentTask.resultUrl) {
      window.open(currentTask.resultUrl, '_blank');
      toast.success('Download started!');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (position === 'inline') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                  {getStatusText()}
                </p>
                {showDetails && currentTask.type && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentTask.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {currentTask.status === 'complete' && currentTask.resultUrl && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200"
                  title="Download Result"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearTask}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          
          {currentTask.status === 'pending' && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 30, ease: "linear" }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-20 right-6 z-50 max-w-sm"
      >
        <div className={`bg-gradient-to-r ${getStatusColor()} rounded-2xl shadow-2xl border border-white/20 overflow-hidden`}>
          {/* Header */}
          <div className="p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getTaskIcon()}
                <div>
                  <p className="font-semibold text-sm">{getStatusText()}</p>
                  {showDetails && currentTask.type && (
                    <p className="text-xs opacity-90">
                      {currentTask.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {showDetails && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200"
                    title="Toggle Details"
                  >
                    <Clock className="w-4 h-4" />
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearTask}
                  className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            
            {/* Progress Bar for Pending Tasks */}
            {currentTask.status === 'pending' && (
              <div className="mt-3">
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <motion.div
                    className="bg-white h-1.5 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 30, ease: "linear" }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-4 text-white text-sm space-y-2"
              >
                <div className="flex justify-between">
                  <span>Task ID:</span>
                  <span className="font-mono text-xs">{currentTask.taskId.slice(-8)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{formatDuration(duration)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="capitalize">{currentTask.status}</span>
                </div>
                
                {currentTask.error && (
                  <div className="mt-2 p-2 bg-red-500/20 rounded-lg">
                    <p className="text-xs text-red-100">{currentTask.error}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Action Buttons */}
          {currentTask.status === 'complete' && currentTask.resultUrl && (
            <div className="p-4 bg-white/10 backdrop-blur-sm border-t border-white/20">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Result</span>
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};