import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Users, 
  Award, 
  TrendingUp, 
  TrendingDown,
  Minus
} from 'lucide-react';

interface ProgressData {
  subject: string;
  icon: React.ComponentType<any>;
  color: string;
  progress: number;
  trend: 'up' | 'down' | 'stable';
  lastActivity: string;
  totalItems: number;
}

interface ProgressTrackerProps {
  data: ProgressData[];
  title?: string;
  showTrends?: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  data,
  title = "Progress Overview",
  showTrends = true
}) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6 shadow-xl border border-white/20">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 text-responsive-lg">
        {title}
      </h3>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={item.subject}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-3"
          >
            {/* Subject Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 text-responsive-sm">
                    {item.subject}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {item.totalItems} items • {item.lastActivity}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-800 text-responsive-sm">
                  {item.progress}%
                </span>
                {showTrends && getTrendIcon(item.trend)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className="progress-fill"
                style={{
                  background: `linear-gradient(90deg, ${item.color.replace('bg-', '').replace('-500', '')}, ${item.color.replace('bg-', '').replace('-500', '')})`,
                }}
              />
            </div>

            {/* Trend Information */}
            {showTrends && (
              <div className={`text-xs ${getTrendColor(item.trend)} flex items-center space-x-1`}>
                {getTrendIcon(item.trend)}
                <span>
                  {item.trend === 'up' && 'Improving'}
                  {item.trend === 'down' && 'Needs attention'}
                  {item.trend === 'stable' && 'Stable progress'}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Overall Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-semibold text-gray-800">
            {Math.round(data.reduce((sum, item) => sum + item.progress, 0) / data.length)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Sample data for demonstration
export const sampleProgressData: ProgressData[] = [
  {
    subject: 'Stories Created',
    icon: BookOpen,
    color: 'bg-purple-500',
    progress: 85,
    trend: 'up',
    lastActivity: '2 hours ago',
    totalItems: 12
  },
  {
    subject: 'Worksheets Generated',
    icon: FileText,
    color: 'bg-blue-500',
    progress: 72,
    trend: 'stable',
    lastActivity: '1 day ago',
    totalItems: 8
  },
  {
    subject: 'Students Tracked',
    icon: Users,
    color: 'bg-green-500',
    progress: 90,
    trend: 'up',
    lastActivity: '3 hours ago',
    totalItems: 25
  },
  {
    subject: 'Assessments Completed',
    icon: Award,
    color: 'bg-orange-500',
    progress: 65,
    trend: 'down',
    lastActivity: '2 days ago',
    totalItems: 15
  }
];