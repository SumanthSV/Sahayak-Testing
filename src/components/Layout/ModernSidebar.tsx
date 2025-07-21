import React from 'react';
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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings
} from 'lucide-react';
import { FirebaseService } from '../../services/firebaseService';
import { AnimatedAvatar } from '../UI/AnimatedAvatar';
import toast from 'react-hot-toast';

interface ModernSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ isOpen, onToggle, isMobile }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: t('dashboard'), path: '/dashboard', avatarType: 'educational' as const },
    { id: 'stories', icon: BookOpen, label: t('storyGenerator'), path: '/stories', avatarType: 'story' as const },
    { id: 'worksheets', icon: FileText, label: t('worksheetGenerator'), path: '/worksheets', avatarType: 'educational' as const },
    { id: 'concepts', icon: HelpCircle, label: t('conceptExplainer'), path: '/concepts', avatarType: 'concept' as const },
    { id: 'visuals', icon: Image, label: t('visualAids'), path: '/visuals', avatarType: 'visual' as const },
    { id: 'assessment', icon: Mic, label: t('voiceAssessment'), path: '/assessment', avatarType: 'assessment' as const },
    { id: 'planner', icon: Calendar, label: t('lessonPlanner'), path: '/planner', avatarType: 'educational' as const },
    { id: 'tracking', icon: Users, label: t('studentTracker'), path: '/tracking', avatarType: 'educational' as const },
    { id: 'games', icon: Gamepad2, label: 'Magical Games', path: '/games', avatarType: 'game' as const },
  ];

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

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-80';

  return (
    <motion.div
      initial={isMobile ? { x: -320 } : { x: 0 }}
      animate={{ 
        x: isOpen ? 0 : (isMobile ? -320 : 0),
        width: isCollapsed ? 80 : 320
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${sidebarWidth} h-screen
        backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 
        border-r border-gray-200/50 dark:border-gray-700/50 
        flex flex-col z-50 shadow-2xl
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
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
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Sahayak AI
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Teaching Assistant</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {!isMobile && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <NavLink
              to={item.path}
              onClick={() => isMobile && onToggle()}
              className={({ isActive }) =>
                `group flex items-center ${isCollapsed ? 'justify-center px-3' : 'space-x-4 px-4'} py-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20 text-purple-700 dark:text-purple-300 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-gray-200'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {/* Animated background for active state */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBackground"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 dark:from-purple-400/10 dark:to-pink-400/10 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Avatar */}
                  <div className="relative z-10 flex-shrink-0">
                    <AnimatedAvatar 
                      type={item.avatarType} 
                      size="md"
                      className={isActive ? 'shadow-lg shadow-purple-500/25' : ''}
                    />
                  </div>
                  
                  {/* Label */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-sm whitespace-nowrap overflow-hidden relative z-10"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full relative z-10"
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `group flex items-center ${isCollapsed ? 'justify-center px-3' : 'space-x-4 px-4'} py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`
          }
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-medium text-sm whitespace-nowrap overflow-hidden"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className={`group w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'space-x-4 px-4'} py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-medium text-sm whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2"
            >
              <p>Sahayak AI v4.0</p>
              <p>Empowering Teachers</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ModernSidebar;