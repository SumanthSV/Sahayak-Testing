import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ModernSidebar from './ModernSidebar';
import ModernHeader from './ModernHeader';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { OfflineIndicator } from '../UI/OfflineIndicator';

const ModernLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Skip Link for Screen Readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Offline Indicator */}
      <OfflineIndicator isOnline={isOnline} />

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] min-h-screen">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {(isSidebarOpen || !isMobile) && (
            <ModernSidebar 
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              isMobile={isMobile}
            />
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <ModernHeader 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            isMobile={isMobile}
          />
          
          {/* Main Content */}
          <main 
            id="main-content"
            className="flex-1 overflow-auto"
            role="main"
            aria-label="Main content"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernLayout;