import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface Task {
  taskId: string;
  status: 'pending' | 'complete' | 'error';
  resultUrl?: string;
  error?: string;
  startTime: number;
  type?: string; // e.g., 'pdf-generation', 'image-generation'
  metadata?: Record<string, any>;
}

interface TaskContextType {
  currentTask: Task | null;
  isPolling: boolean;
  startTask: (taskId: string, type?: string, metadata?: Record<string, any>) => void;
  pollStatus: (taskId: string) => Promise<void>;
  clearTask: () => void;
  getTaskDuration: () => number;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: React.ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Mock API functions - replace with your actual API calls
  const mockStartTask = async (): Promise<{ taskId: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  };

  const mockGetTaskStatus = async (taskId: string): Promise<{ status: 'pending' | 'complete' | 'error', resultUrl?: string, error?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate random completion (30% chance of completion each poll)
    const shouldComplete = Math.random() < 0.3;
    const shouldError = Math.random() < 0.05; // 5% chance of error
    
    if (shouldError) {
      return { 
        status: 'error', 
        error: 'Task failed due to server error' 
      };
    }
    
    if (shouldComplete) {
      return { 
        status: 'complete', 
        resultUrl: `https://example.com/download/${taskId}.pdf` 
      };
    }
    
    return { status: 'pending' };
  };

  // Start a new task
  const startTask = useCallback(async (taskId: string, type?: string, metadata?: Record<string, any>) => {
    const newTask: Task = {
      taskId,
      status: 'pending',
      startTime: Date.now(),
      type,
      metadata
    };
    
    setCurrentTask(newTask);
    setIsPolling(true);
    
    // Start polling immediately
    pollStatus(taskId);
  }, []);

  // Poll task status
  const pollStatus = useCallback(async (taskId: string) => {
    if (!mountedRef.current) return;
    
    try {
      const response = await mockGetTaskStatus(taskId);
      
      if (!mountedRef.current) return;
      
      setCurrentTask(prevTask => {
        if (!prevTask || prevTask.taskId !== taskId) return prevTask;
        
        return {
          ...prevTask,
          status: response.status,
          resultUrl: response.resultUrl,
          error: response.error
        };
      });
      
      // Stop polling if task is complete or errored
      if (response.status === 'complete' || response.status === 'error') {
        setIsPolling(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error polling task status:', error);
      
      if (!mountedRef.current) return;
      
      setCurrentTask(prevTask => {
        if (!prevTask || prevTask.taskId !== taskId) return prevTask;
        
        return {
          ...prevTask,
          status: 'error',
          error: 'Failed to check task status'
        };
      });
      
      setIsPolling(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, []);

  // Clear current task
  const clearTask = useCallback(() => {
    setCurrentTask(null);
    setIsPolling(false);
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Get task duration in seconds
  const getTaskDuration = useCallback(() => {
    if (!currentTask) return 0;
    return Math.floor((Date.now() - currentTask.startTime) / 1000);
  }, [currentTask]);

  // Set up polling interval when a task is active
  useEffect(() => {
    if (isPolling && currentTask && currentTask.status === 'pending') {
      pollingIntervalRef.current = setInterval(() => {
        if (currentTask && mountedRef.current) {
          pollStatus(currentTask.taskId);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isPolling, currentTask, pollStatus]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const value: TaskContextType = {
    currentTask,
    isPolling,
    startTask,
    pollStatus,
    clearTask,
    getTaskDuration
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};