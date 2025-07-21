import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, ChevronDown, AlertCircle } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  syncStatus?: 'idle' | 'syncing' | 'error';
  offlineItemsCount?: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  isOnline, 
  syncStatus = 'idle',
  offlineItemsCount = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldShow = !isOnline || syncStatus === 'syncing' || syncStatus === 'error';
  if (!shouldShow) return null;

  const getStatusColor = () => {
    if (!isOnline) return 'from-red-500 to-orange-500';
    if (syncStatus === 'syncing') return 'from-blue-500 to-cyan-500';
    if (syncStatus === 'error') return 'from-red-500 to-pink-500';
    return 'from-green-500 to-emerald-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline Mode';
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'error') return 'Sync Error';
    return '';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (syncStatus === 'syncing') return <Sync className="w-4 h-4 animate-spin" />;
    if (syncStatus === 'error') return <AlertCircle className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-16 left-80 right-0 bg-gradient-to-r ${getStatusColor()} text-white z-50 shadow-lg`}
      >
        <div className="container-responsive">
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-1.5 px-4 flex items-center justify-between hover:bg-black/10 transition-colors duration-200"
            aria-expanded={isExpanded}
            aria-label="Toggle connection status details"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={!isOnline ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {getStatusIcon()}
              </motion.div>
              <span className="font-medium text-responsive-sm">{getStatusText()}</span>
              {offlineItemsCount > 0 && (
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {offlineItemsCount} items cached
                </span>
              )}
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-white/20 px-4 pb-4 overflow-hidden"
              >
                <div className="pt-3 space-y-2 text-responsive-xs">
                  {!isOnline ? (
                    <>
                      <p>• Limited functionality available</p>
                      <p>• Data will sync when connection is restored</p>
                      <p>• Cached content remains accessible</p>
                    </>
                  ) : syncStatus === 'syncing' ? (
                    <>
                      <p>• Synchronizing offline changes</p>
                      <p>• Please wait for sync to complete</p>
                    </>
                  ) : (
                    <>
                      <p>• Failed to sync some changes</p>
                      <p>• Will retry automatically</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
