import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  Shield, 
  Download, 
  Trash2,
  User,
  Palette,
  Wifi,
  WifiOff,
  Save
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const isOnline = useOnlineStatus();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [theme, setTheme] = useState('light');

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('settings', JSON.stringify({
      notifications,
      autoSave,
      offlineMode,
      theme,
      language: currentLanguage
    }));
    toast.success('Settings saved successfully!');
  };

  const handleClearCache = () => {
    // Clear local storage cache
    const keysToKeep = ['preferred-language', 'settings'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    toast.success('Cache cleared successfully!');
  };

  const handleExportData = () => {
    // Export user data
    const userData = {
      profile: {
        name: user?.displayName,
        email: user?.email
      },
      settings: {
        language: currentLanguage,
        notifications,
        autoSave,
        theme
      },
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sahayak-ai-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center"
          >
            <SettingsIcon className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
              {t('settings')}
            </h1>
            <p className="text-gray-600">Customize your Sahayak AI experience</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Language & Localization */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Language & Localization</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Interface Language
              </label>
              <div className="grid grid-cols-1 gap-2">
                {availableLanguages.map((language) => (
                  <motion.button
                    key={language.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => changeLanguage(language.code)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                      currentLanguage === language.code
                        ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                        : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <div>
                      <div className="font-medium">{language.nativeName}</div>
                      <div className="text-xs text-gray-500">{language.name}</div>
                    </div>
                    {currentLanguage === language.code && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-medium text-gray-800">Auto-save Content</h3>
                <p className="text-sm text-gray-600">Automatically save generated content</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setAutoSave(!autoSave)}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  autoSave ? 'bg-green-500' : 'bg-gray-300'
                } relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                  autoSave ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Connectivity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-green-600" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-800">Connectivity</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200/50">
              <h3 className="font-medium text-blue-800 mb-2">Connection Status</h3>
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700">Online - All features available</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-700">Offline - Limited functionality</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-medium text-gray-800">Offline Mode</h3>
                <p className="text-sm text-gray-600">Enable offline functionality when possible</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOfflineMode(!offlineMode)}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  offlineMode ? 'bg-blue-500' : 'bg-gray-300'
                } relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                  offlineMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Data & Privacy */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Data & Privacy</h2>
          </div>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportData}
              className="w-full flex items-center space-x-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-200 border border-green-200/50"
            >
              <Download className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-green-800">Export Data</p>
                <p className="text-sm text-green-600">Download your data as JSON</p>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearCache}
              className="w-full flex items-center space-x-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 border border-orange-200/50"
            >
              <Trash2 className="w-5 h-5 text-orange-600" />
              <div className="text-left">
                <p className="font-medium text-orange-800">Clear Cache</p>
                <p className="text-sm text-orange-600">Remove stored temporary data</p>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={user?.displayName || ''}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Created
                </label>
                <input
                  type="text"
                  value={user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Sign In
                </label>
                <input
                  type="text"
                  value={user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveSettings}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>Save Settings</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Settings;