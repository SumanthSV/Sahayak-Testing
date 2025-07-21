import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3,
  BookOpen, 
  FileText, 
  HelpCircle, 
  Image, 
  Mic, 
  Calendar, 
  Users, 
  Gamepad2,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { FirebaseService } from '../../services/firebaseService';
import toast from 'react-hot-toast';

interface ResponsiveSidebarProps {
  isMobile: boolean;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ isMobile }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: t('dashboard'), path: '/dashboard', color: 'text-gray-600 dark:text-gray-400' },
    { id: 'stories', icon: BookOpen, label: t('storyGenerator'), path: '/stories', color: 'text-purple-600 dark:text-purple-400' },
    { id: 'worksheets', icon: FileText, label: t('worksheetGenerator'), path: '/worksheets', color: 'text-blue-600 dark:text-blue-400' },
    { id: 'concepts', icon: HelpCircle, label: t('conceptExplainer'), path: '/concepts', color: 'text-green-600 dark:text-green-400' },
    { id: 'visuals', icon: Image, label: t('visualAids'), path: '/visuals', color: 'text-orange-600 dark:text-orange-400' },
    { id: 'assessment', icon: Mic, label: t('voiceAssessment'), path: '/assessment', color: 'text-red-600 dark:text-red-400' },
    { id: 'planner', icon: Calendar, label: t('lessonPlanner'), path: '/planner', color: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'tracking', icon: Users, label: t('studentTracker'), path: '/tracking', color: 'text-teal-600 dark:text-teal-400' },
    { id: 'games', icon: Gamepad2, label: 'Educational Games', path: '/games', color: 'text-purple-600 dark:text-purple-400' },
  ];

  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const handleLogout = async () => {
    try {
      await FirebaseService.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-72';

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 touch-target p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
        </motion.button>
      )}

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { x: -288 } : { x: 0 }}
            animate={{ x: 0, width: isCollapsed ? 64 : 288 }}
            exit={isMobile ? { x: -288 } : { x: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 40, duration: 0.3 }}
            className={`
              ${isMobile ? 'fixed' : 'fixed'} 
              left-0 top-0 h-screen ${sidebarWidth}
              bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl 
              border-r border-gray-200/50 dark:border-gray-700/50 
              flex flex-col z-50 transition-all duration-300
            `}
          >
            {/* Logo */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                        Sahayak AI
                      </h1>
                      <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Teaching Assistant</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Collapse Toggle Button */}
            {!isMobile && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCollapse}
                className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-lg z-10"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                )}
              </motion.button>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <NavLink
                    to={item.path}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-3 rounded-lg transition-all duration-200 group touch-target focus-ring ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200/50 dark:border-purple-700/50'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-gray-200'
                      }`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-shrink-0"
                        >
                          <item.icon 
                            className={`w-5 h-5 ${
                              isActive ? 'text-purple-600 dark:text-purple-400' : item.color
                            } group-hover:scale-110 transition-transform duration-200`} 
                          />
                        </motion.div>
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="font-medium text-sm whitespace-nowrap overflow-hidden"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {isActive && !isCollapsed && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto w-1.5 h-1.5 bg-purple-500 dark:bg-purple-400 rounded-full"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1"
                  >
                    <p>Sahayak AI v4.0</p>
                    <p>Empowering Teachers</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResponsiveSidebar;