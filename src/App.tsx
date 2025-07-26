import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { LanguageProvider } from './contexts/LanguageContext';
import { LoadingSpinner } from './components/UI/LoadingSpinner';
import { OfflineIndicator } from './components/UI/OfflineIndicator';
import { VoiceButton } from './components/UI/VoiceButton';

// Lazy load components for better performance
const LoginForm = React.lazy(() => import('./components/Auth/LoginForm'));
const SignupForm = React.lazy(() => import('./components/Auth/SignupForm'));
const Layout = React.lazy(() => import('./components/Layout/Layout'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const StoryGenerator = React.lazy(() => import('./pages/StoryGenerator'));
const WorksheetGenerator = React.lazy(() => import('./pages/WorksheetGenerator'));
const ConceptExplainer = React.lazy(() => import('./pages/ConceptExplainer'));
const VisualAids = React.lazy(() => import('./pages/VisualAids'));
const VoiceAssessment = React.lazy(() => import('./pages/VoiceAssessment'));
const LessonPlanner = React.lazy(() => import('./pages/LessonPlanner'));
const StudentTracker = React.lazy(() => import('./pages/StudentTracker'));
const Games = React.lazy(() => import('./pages/Games'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Home = React.lazy(() => import('./pages/Home'));
import Navbar from './components/HomePageComponents/Navbar'

function App() {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
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

  // if (loading) {
  //   return <LoadingSpinner />;
  // }

  return (
    <LanguageProvider>
      <div className="min-h-screen ">
        <OfflineIndicator isOnline={isOnline} />
        
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingSpinner />}>

          
            {!user ? (
              <Routes>
                <Route path="/" element={
                    <Home />
                } />
                <Route path="/signup" element={
                  <div
                    className="container-responsive"
                  >
                    <SignupForm onBackToLogin={() => setShowSignup(false)} />
                  </div>
                } />
                <Route path="/login" element=
                    {showSignup ? (
                      <>
                      <Navbar/>
                      <SignupForm onBackToLogin={() => setShowSignup(false)} />
                        </>
                    ) : (
                      <>
                      <Navbar/>
                      <LoginForm onShowSignup={() => setShowSignup(true)} />
                        </>
                    )
                } />
              </Routes>
            ) : (
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="stories" element={<StoryGenerator />} />
                  <Route path="worksheets" element={<WorksheetGenerator />} />
                  <Route path="concepts" element={<ConceptExplainer />} />
                  <Route path="visuals" element={<VisualAids />} />
                  <Route path="assessment" element={<VoiceAssessment />} />
                  <Route path="planner" element={<LessonPlanner />} />
                  <Route path="tracking" element={<StudentTracker />} />
                  <Route path="games" element={<Games />} />
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