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
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Skip Link for Screen Readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Offline Indicator */}
      <OfflineIndicator isOnline={isOnline} />

      {/* Responsive Sidebar */}
      <ResponsiveSidebar isMobile={isMobile} />

      {/* Main Content Area */}
      <div className={`flex flex-col ${!isMobile ? 'ml-72' : ''} min-h-screen`}>
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
            className="h-full container-responsive py-4"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Persistent Voice Button */}
      <VoiceButton 
        position="fixed"
        size="lg"
      />
    </div>
  );
};

export default Layout;