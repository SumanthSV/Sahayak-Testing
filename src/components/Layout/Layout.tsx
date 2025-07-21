import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import ResponsiveSidebar from './ResponsiveSidebar';
import Header from './Header';
import { VoiceButton } from '../UI/VoiceButton';
import { OfflineIndicator } from '../UI/OfflineIndicator';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const Layout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
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

      {/* Responsive Sidebar */}
      <ResponsiveSidebar isMobile={isMobile} />

      {/* Main Content Area */}
      <motion.div 
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          !isMobile ? 'ml-72' : ''
        }`}
        animate={{
          marginLeft: !isMobile ? (sidebarOpen ? 288 : 0) : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header */}
        <Header />
        
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
            className="h-full container-responsive py-4 bg-transparent"
          >
            <Outlet />
          </motion.div>
        </main>
      </motion.div>

      {/* Persistent Voice Button */}
      <VoiceButton 
        position="fixed"
        size="lg"
      />
    </div>
  );
};

export default Layout;