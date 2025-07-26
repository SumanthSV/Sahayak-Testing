import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';

interface TaskStatusBadgeProps {
  onClick?: () => void;
  className?: string;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ 
  onClick, 
  className = "" 
}) => {
  const { currentTask, getTaskDuration } = useTask();
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    if (currentTask && currentTask.status === 'pending') {
      const interval = setInterval(() => {
        setDuration(getTaskDuration());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentTask, getTaskDuration]);

  if (!currentTask) return null;

  const getStatusIcon = () => {
    switch (currentTask.status) {
      case 'pending':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-3 h-3" />;
      case 'error':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = () => {
    switch (currentTask.status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (currentTask.status) {
      case 'pending':
        return `Generating... ${duration}s`;
      case 'complete':
        return 'Ready!';
      case 'error':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border
        ${getStatusColor()} hover:shadow-md transition-all duration-200 ${className}
      `}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      
      {currentTask.status === 'pending' && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 bg-current rounded-full opacity-60"
        />
      )}
    </motion.button>
  );
};