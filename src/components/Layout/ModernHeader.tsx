import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  User, 
  Globe, 
  Settings, 
  LogOut, 
  Accessibility,
  ChevronDown,
  UserCircle,
  Sun,
  Moon,
  Menu,
  Bell,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { FirebaseService } from '../../services/firebaseService';
import { AccessibilityControls } from '../UI/AccessibilityControls';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ModernHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({ 
  onToggleSidebar, 
  isSidebarOpen, 
  isMobile 
}) => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

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

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setShowLanguageMenu(false);
    toast.success('Language changed successfully');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-b border-gray-200/50 dark:border-gray-700/50 px-4 sm:px-6 py-4 relative z-30 shadow-lg"
      >
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            {isMobile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleSidebar}
                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </motion.button>
            )}

            {/* Search Bar */}
            <div className="relative max-w-md hidden sm:block">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search anything magical..."
                className="pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full transition-all duration-200 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
            </motion.button>

            {/* Language Selector */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-2 px-3 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {!isMobile && (
                  <>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {availableLanguages.find(lang => lang.code === currentLanguage)?.flag}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </>
                )}
              </motion.button>
              
              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-56 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50"
                    onMouseLeave={() => setShowLanguageMenu(false)}
                  >
                    {availableLanguages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`w-full text-left px-4 py-3 transition-all duration-200 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                          currentLanguage === language.code ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <div>
                          <div className="font-medium">{language.nativeName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{language.name}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <AnimatePresence mode="wait">
                {isDarkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5 text-yellow-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5 text-gray-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Profile Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                {!isMobile && (
                  <>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user?.displayName || 'Teacher'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Online
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-64 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    {/* Profile Info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                          <UserCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {user?.displayName || 'Teacher'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setShowAccessibility(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 transition-all duration-200 flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Accessibility className="w-5 h-5" />
                      <span>Accessibility</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        navigate('/settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 transition-all duration-200 flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </motion.button>

                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 transition-all duration-200 flex items-center space-x-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Accessibility Controls */}
      {showAccessibility && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <AccessibilityControls 
            isOpen={showAccessibility}
            onClose={() => setShowAccessibility(false)}
          />
        </div>
      )}
    </>
  );
};

export default ModernHeader;