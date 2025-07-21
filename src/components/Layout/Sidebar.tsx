import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { FirebaseService } from '../../services/firebaseService';
import toast from 'react-hot-toast';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: t('dashboard'), path: '/dashboard', color: 'text-gray-600' },
    { id: 'stories', icon: BookOpen, label: t('storyGenerator'), path: '/stories', color: 'text-purple-600' },
    { id: 'worksheets', icon: FileText, label: t('worksheetGenerator'), path: '/worksheets', color: 'text-blue-600' },
    { id: 'concepts', icon: HelpCircle, label: t('conceptExplainer'), path: '/concepts', color: 'text-green-600' },
    { id: 'visuals', icon: Image, label: t('visualAids'), path: '/visuals', color: 'text-orange-600' },
    { id: 'assessment', icon: Mic, label: t('voiceAssessment'), path: '/assessment', color: 'text-red-600' },
    { id: 'planner', icon: Calendar, label: t('lessonPlanner'), path: '/planner', color: 'text-indigo-600' },
    { id: 'tracking', icon: Users, label: t('studentTracker'), path: '/tracking', color: 'text-teal-600' },
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

  return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200/50 flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center space-x-2"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sahayak AI
            </h1>
            <p className="text-xs text-gray-600">Teaching Assistant</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-sm border border-purple-200/50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon 
                      className={`w-4 h-4 ${
                        isActive ? 'text-purple-600' : item.color
                      } group-hover:scale-110 transition-transform duration-200`} 
                    />
                  </motion.div>
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 bg-purple-500 rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-200/50 space-y-1 flex-shrink-0">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span className="font-medium text-sm">{t('settings')}</span>
        </NavLink>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">{t('logout')}</span>
        </motion.button>
        
        {/* Footer */}
        <div className="pt-2 mt-2 border-t border-gray-200/50">
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Sahayak AI v4.0</p>
            <p>Empowering Teachers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;