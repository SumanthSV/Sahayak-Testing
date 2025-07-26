import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import { TaskStatusIndicator } from '../components/UI/TaskStatusIndicator';
import { GenerateButton } from '../components/UI/GenerateButton';
import toast from 'react-hot-toast';

const GeneratePage: React.FC = () => {
  const { currentTask, isPolling, startTask, clearTask } = useTask();
  const [selectedType, setSelectedType] = useState<'pdf-generation' | 'image-generation'>('pdf-generation');
  const [content, setContent] = useState('');

  // Mock API function to start a task - replace with your actual API
  const mockStartTaskAPI = async (type: string, content: string): Promise<{ taskId: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a mock task ID
    return { 
      taskId: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
    };
  };

  const handleStartGeneration = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content to generate');
      return;
    }

    try {
      // Start the task via your API
      const response = await mockStartTaskAPI(selectedType, content);
      
      // Start tracking the task in context
      startTask(response.taskId, selectedType, { 
        content: content.substring(0, 100) + '...',
        timestamp: new Date().toISOString()
      });
      
      toast.success('Generation started! You can navigate away and come back.');
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Failed to start generation. Please try again.');
    }
  };

  const handleTaskComplete = (resultUrl: string) => {
    console.log('Task completed with result:', resultUrl);
    // You can add additional logic here when task completes
  };

  const handleTaskError = (error: string) => {
    console.error('Task failed with error:', error);
    // You can add additional error handling here
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf-generation':
        return <FileText className="w-5 h-5" />;
      case 'image-generation':
        return <ImageIcon className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf-generation':
        return 'PDF Generation';
      case 'image-generation':
        return 'Image Generation';
      default:
        return 'Unknown Task';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Task Status Indicator */}
      <TaskStatusIndicator 
        position="fixed"
        showDetails={true}
        onComplete={handleTaskComplete}
        onError={handleTaskError}
      />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Background Task Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Generate content in the background while you navigate</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Task Type Selection */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Select Generation Type
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 'pdf-generation', label: 'PDF Generation', icon: FileText },
                  { type: 'image-generation', label: 'Image Generation', icon: ImageIcon }
                ].map((option) => (
                  <motion.button
                    key={option.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(option.type as any)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedType === option.type
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <option.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content Input */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Content to Generate
              </h2>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Enter content for ${getTaskTypeLabel(selectedType).toLowerCase()}...`}
                className="w-full h-32 p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              
              <div className="mt-4">
                <GenerateButton
                  onClick={handleStartGeneration}
                  isLoading={currentTask?.status === 'pending'}
                  disabled={!content.trim() || (currentTask?.status === 'pending')}
                  size="md"
                >
                  {currentTask?.status === 'pending' ? 'Generating...' : `Start ${getTaskTypeLabel(selectedType)}`}
                </GenerateButton>
              </div>
            </div>

            {/* Sample Content */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Sample Content
              </h3>
              
              <div className="space-y-2">
                {[
                  'Create a comprehensive lesson plan about photosynthesis for grade 5 students',
                  'Generate a colorful educational poster about the water cycle',
                  'Design a worksheet with math problems for elementary students'
                ].map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => setContent(sample)}
                    className="text-left text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline block w-full p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Status Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Current Task Status */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Task Status
              </h2>
              
              {currentTask ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center space-x-3">
                      {getTaskTypeIcon(currentTask.type || '')}
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {getTaskTypeLabel(currentTask.type || '')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {currentTask.taskId.slice(-8)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {currentTask.status === 'pending' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                        />
                      )}
                      {currentTask.status === 'complete' && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                      {currentTask.status === 'error' && (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`font-medium capitalize ${
                        currentTask.status === 'pending' ? 'text-blue-600 dark:text-blue-400' :
                        currentTask.status === 'complete' ? 'text-green-600 dark:text-green-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {currentTask.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Started:</span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {new Date(currentTask.startTime).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {currentTask.metadata?.content && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          Content: {currentTask.metadata.content}
                        </p>
                      </div>
                    )}
                    
                    {currentTask.error && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <p className="text-xs text-red-800 dark:text-red-300">
                          Error: {currentTask.error}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {currentTask.status === 'complete' && currentTask.resultUrl && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.open(currentTask.resultUrl, '_blank')}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download Result</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearTask}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Clear Task</span>
                  </motion.button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No active tasks</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Start a generation to see status here</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                How it Works
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Start a generation task and it runs in the background</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Navigate to other pages - the task continues running</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Return to see the status or download the result</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <p>Status updates automatically every 3 seconds</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePage;