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
  Moon
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { FirebaseService } from '../../services/firebaseService';
import { AccessibilityControls } from '../UI/AccessibilityControls';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
    toast.success(`Switched to ${isDarkMode ? 'light' : 'dark'} mode`);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-6 py-4 relative z-40 w-full"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 bg-gray-100/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-100/50 hover:bg-gray-200/50 transition-all duration-200"
              >
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {availableLanguages.find(lang => lang.code === currentLanguage)?.flag}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </motion.button>
              
              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200/50 py-2 z-50"
                    onMouseLeave={() => setShowLanguageMenu(false)}
                  >
                    {availableLanguages.map((language) => (
                      <motion.button
                        key={language.code}
                        whileHover={{ backgroundColor: '#f3f4f6' }}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`w-full text-left px-4 py-3 transition-all duration-200 flex items-center space-x-3 ${
                          currentLanguage === language.code ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <div>
                          <div className="font-medium">{language.nativeName}</div>
                          <div className="text-xs text-gray-500">{language.name}</div>
                        </div>
                      </motion.button>
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
              className="p-2 rounded-xl bg-gray-100/50 hover:bg-gray-200/50 transition-all duration-200"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-600" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>

            {/* Profile Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl bg-gray-100/50 hover:bg-gray-200/50 transition-all duration-200"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">
                    {user?.displayName || 'Teacher'}
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200/50 py-2 z-50"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    {/* Profile Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <UserCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {user?.displayName || 'Teacher'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <motion.button
                      whileHover={{ backgroundColor: '#f3f4f6' }}
                      onClick={() => {
                        setShowAccessibility(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 transition-all duration-200 flex items-center space-x-3 text-gray-700 hover:text-gray-900"
                    >
                      <Accessibility className="w-5 h-5" />
                      <span>Accessibility</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ backgroundColor: '#f3f4f6' }}
                      onClick={() => {
                        navigate('/settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 transition-all duration-200 flex items-center space-x-3 text-gray-700 hover:text-gray-900"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </motion.button>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <motion.button
                        whileHover={{ backgroundColor: '#fef2f2' }}
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 transition-all duration-200 flex items-center space-x-3 text-red-600 hover:text-red-700"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <AccessibilityControls 
            isOpen={showAccessibility}
            onClose={() => setShowAccessibility(false)}
          />
        </div>
      )}
    </>
  );
};

export default Header;