import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useResponsiveBreakpoints } from './hooks/useResponsiveBreakpoints';
import { LanguageProvider } from './contexts/LanguageContext';
import { LoadingSpinner } from './components/UI/LoadingSpinner';
import { OfflineIndicator } from './components/UI/OfflineIndicator';
import { VoiceButton } from './components/UI/VoiceButton';

// Lazy load components for better performance
const FuturisticLoginForm = React.lazy(() => import('./components/Auth/FuturisticLoginForm'));
const FuturisticSignupForm = React.lazy(() => import('./components/Auth/FuturisticSignupForm'));
const ModernLayout = React.lazy(() => import('./components/Layout/ModernLayout'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const StoryGenerator = React.lazy(() => import('./pages/StoryGenerator'));
const ModernWorksheetGenerator = React.lazy(() => import('./pages/ModernWorksheetGenerator'));
const ConceptExplainer = React.lazy(() => import('./pages/ConceptExplainer'));
const VisualAids = React.lazy(() => import('./pages/VisualAids'));
const VoiceAssessment = React.lazy(() => import('./pages/VoiceAssessment'));
const LessonPlanner = React.lazy(() => import('./pages/LessonPlanner'));
const StudentTracker = React.lazy(() => import('./pages/StudentTracker'));
const MagicalGames = React.lazy(() => import('./pages/MagicalGames'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  const { user, loading } = useAuth();
  const isOnline = useOnlineStatus();
  const { isMobile, isTablet, isDesktop } = useResponsiveBreakpoints();
  const [showSignup, setShowSignup] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Initialize accessibility preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion');

    if (savedFontSize) {
      document.documentElement.style.fontSize = `${savedFontSize}%`;
    }

    if (savedHighContrast === 'true') {
      document.documentElement.classList.add('high-contrast');
    }

    if (savedReducedMotion === 'true') {
      document.documentElement.classList.add('reduce-motion');
    }
  }, []);

  // Add responsive classes to body
  useEffect(() => {
    const bodyClasses = ['responsive-app'];
    
    if (isMobile) bodyClasses.push('mobile-view');
    if (isTablet) bodyClasses.push('tablet-view');
    if (isDesktop) bodyClasses.push('desktop-view');
    
    document.body.className = bodyClasses.join(' ');
    
    return () => {
      document.body.className = '';
    };
  }, [isMobile, isTablet, isDesktop]);

  // if (loading) {
  //   return <LoadingSpinner />;
  // }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Skip Link for Accessibility
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a> */}

        {/* Offline Indicator */}
        <OfflineIndicator isOnline={isOnline} />
        
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingSpinner />}>
            {!user ? (
              <Routes>
                <Route path="/signup" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="container-responsive"
                  >
                    <FuturisticSignupForm onBackToLogin={() => setShowSignup(false)} />
                  </motion.div>
                } />
                <Route path="/*" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="container-responsive"
                  >
                    {showSignup ? (
                      <FuturisticSignupForm onBackToLogin={() => setShowSignup(false)} />
                    ) : (
                      <FuturisticLoginForm onShowSignup={() => setShowSignup(true)} />
                    )}
                  </motion.div>
                } />
              </Routes>
            ) : (
              <Routes>
                <Route path="/" element={<ModernLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="stories" element={<StoryGenerator />} />
                  <Route path="worksheets" element={<ModernWorksheetGenerator />} />
                  <Route path="concepts" element={<ConceptExplainer />} />
                  <Route path="visuals" element={<VisualAids />} />
                  <Route path="assessment" element={<VoiceAssessment />} />
                  <Route path="planner" element={<LessonPlanner />} />
                  <Route path="tracking" element={<StudentTracker />} />
                  <Route path="games" element={<MagicalGames />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            )}
          </Suspense>
        </AnimatePresence>

        {/* Global Voice Button - Only show when user is logged in */}
        {user && (
          <VoiceButton 
            position="fixed"
            size={isMobile ? 'md' : 'lg'}
            isRecording={isVoiceActive}
            onStartRecording={() => setIsVoiceActive(true)}
            onStopRecording={() => setIsVoiceActive(false)}
          />
        )}
      </div>
    </LanguageProvider>
  );
}

export default App;