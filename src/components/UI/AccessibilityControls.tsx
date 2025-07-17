import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Type, 
  Eye, 
  Palette, 
  Volume2, 
  Keyboard,
  X,
  Plus,
  Minus
} from 'lucide-react';

interface AccessibilityControlsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  isOpen,
  onClose
}) => {
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion');
    const savedScreenReader = localStorage.getItem('accessibility-screen-reader');

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedHighContrast) setHighContrast(JSON.parse(savedHighContrast));
    if (savedReducedMotion) setReducedMotion(JSON.parse(savedReducedMotion));
    if (savedScreenReader) setScreenReader(JSON.parse(savedScreenReader));
  }, []);

  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('accessibility-font-size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility-high-contrast', JSON.stringify(highContrast));
  }, [highContrast]);

  useEffect(() => {
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    localStorage.setItem('accessibility-reduced-motion', JSON.stringify(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    // Apply screen reader optimizations
    if (screenReader) {
      document.documentElement.classList.add('screen-reader-mode');
    } else {
      document.documentElement.classList.remove('screen-reader-mode');
    }
    localStorage.setItem('accessibility-screen-reader', JSON.stringify(screenReader));
  }, [screenReader]);

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(80, Math.min(200, fontSize + delta));
    setFontSize(newSize);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
          role="dialog"
          aria-label="Accessibility Controls"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Accessibility
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="touch-target p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                aria-label="Close accessibility controls"
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>

            <div className="space-y-6">
              {/* Font Size Control */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Type className="w-5 h-5 text-gray-600" />
                  <label className="font-medium text-gray-800">Text Size</label>
                </div>
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => adjustFontSize(-10)}
                    className="touch-target p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                    aria-label="Decrease text size"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="flex-1 text-center font-medium">{fontSize}%</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => adjustFontSize(10)}
                    className="touch-target p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                    aria-label="Increase text size"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                <input
                  type="range"
                  min="80"
                  max="200"
                  step="10"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                  aria-label="Text size slider"
                />
              </div>

              {/* High Contrast Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-gray-600" />
                    <label className="font-medium text-gray-800">High Contrast</label>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setHighContrast(!highContrast)}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      highContrast ? 'bg-blue-500' : 'bg-gray-300'
                    } relative`}
                    aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
                    role="switch"
                    aria-checked={highContrast}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                      highContrast ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </motion.button>
                </div>
                <p className="text-sm text-gray-600">
                  Increases color contrast for better visibility
                </p>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <label className="font-medium text-gray-800">Reduce Motion</label>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setReducedMotion(!reducedMotion)}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      reducedMotion ? 'bg-blue-500' : 'bg-gray-300'
                    } relative`}
                    aria-label={`${reducedMotion ? 'Disable' : 'Enable'} reduced motion`}
                    role="switch"
                    aria-checked={reducedMotion}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </motion.button>
                </div>
                <p className="text-sm text-gray-600">
                  Minimizes animations and transitions
                </p>
              </div>

              {/* Screen Reader Mode */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-5 h-5 text-gray-600" />
                    <label className="font-medium text-gray-800">Screen Reader Mode</label>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setScreenReader(!screenReader)}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      screenReader ? 'bg-blue-500' : 'bg-gray-300'
                    } relative`}
                    aria-label={`${screenReader ? 'Disable' : 'Enable'} screen reader optimizations`}
                    role="switch"
                    aria-checked={screenReader}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                      screenReader ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </motion.button>
                </div>
                <p className="text-sm text-gray-600">
                  Optimizes interface for screen readers
                </p>
              </div>

              {/* Keyboard Navigation Info */}
              <div className="space-y-3 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Keyboard className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-800">Keyboard Navigation</h3>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Tab: Navigate forward</p>
                  <p>• Shift + Tab: Navigate backward</p>
                  <p>• Enter/Space: Activate buttons</p>
                  <p>• Escape: Close modals</p>
                  <p>• Arrow keys: Navigate lists</p>
                </div>
              </div>

              {/* Reset Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFontSize(100);
                  setHighContrast(false);
                  setReducedMotion(false);
                  setScreenReader(false);
                }}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-200"
              >
                Reset to Defaults
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};