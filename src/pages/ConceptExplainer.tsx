import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  HelpCircle, 
  BookOpen, 
  Brain, 
  Mic,
  MicOff,
  Eye,
  Target,
  GraduationCap,
  Globe,
  MessageCircle,
  ThumbsDown,
  ThumbsUp
} from 'lucide-react';
import { AIService } from '../services/aiService';
import { FirebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { LoadingTeacher } from '../components/UI/LoadingTeacher';
import { OutputCard } from '../components/UI/OutputCard';
import { InputCard, InputField } from '../components/UI/InputCard';
import { GenerateButton } from '../components/UI/GenerateButton';
import toast from 'react-hot-toast';

const ConceptExplainer: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState<any>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [difficulty, setDifficulty] = useState('beginner');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState(currentLanguage);
  const [learningStyle, setLearningStyle] = useState<'visual' | 'theoretical'>('visual');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const difficulties = [
    { value: 'beginner', label: 'Beginner (Age 6-8)' },
    { value: 'intermediate', label: 'Intermediate (Age 9-11)' },
    { value: 'advanced', label: 'Advanced (Age 12+)' },
  ];

  const subjects = [
    { value: '', label: 'General' },
    { value: 'science', label: t('science') },
    { value: 'math', label: t('mathematics') },
    { value: 'english', label: t('english') },
    { value: 'hindi', label: t('hindi') },
    { value: 'social', label: t('socialStudies') },
    { value: 'evs', label: t('environmentalStudies') },
  ];

  const learningStyles = [
    { value: 'visual', label: 'Visual', icon: Eye, description: 'Learn through images and diagrams' },
    { value: 'theoretical', label: 'Theoretical', icon: BookOpen, description: 'Learn through detailed explanations' }
  ];

  const sampleQuestions = {
    en: 'Why does it rain?',
    hi: 'बारिश क्यों होती है?'
  };

  React.useEffect(() => {
    if (transcript) {
      setQuestion(transcript);
    }
  }, [transcript]);

  const handleExplain = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    setIsExplaining(true);
    try {
      const result = await AIService.explainConceptAdaptively({
        question,
        difficulty,
        subject: subject || undefined,
        language,
        learningStyle,
        previousQuestions: []
      });
      setExplanation(result);
      toast.success('Concept explained successfully!');
    } catch (error) {
      console.error('Error explaining concept:', error);
      toast.error('Failed to explain concept. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    toast.success(`Feedback recorded! This will help improve future explanations.`);
  };

  const handleSave = async () => {
    if (!explanation || !user) return;
    
    setIsSaving(true);
    try {
      await FirebaseService.saveGeneratedContent({
        type: 'concept-explanation',
        title: `Concept: ${question}`,
        content: JSON.stringify(explanation),
        subject: subject || 'general',
        grade: difficulty === 'beginner' ? '1-2' : difficulty === 'intermediate' ? '3-5' : '6-8',
        language,
        teacherId: user.uid,
        tags: ['concept', 'explanation', difficulty, learningStyle],
        metadata: { question, difficulty, subject, learningStyle },
        createdAt: new Date(),
      });
      toast.success('Explanation saved successfully!');
    } catch (error) {
      console.error('Error saving explanation:', error);
      toast.error('Error saving explanation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = () => {
    handleExplain();
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(language);
    }
  };

  const currentSampleQuestion = sampleQuestions[language as keyof typeof sampleQuestions] || sampleQuestions.en;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <LoadingTeacher 
        isVisible={isExplaining}
        message="Analyzing and explaining the concept... Please wait ⏳"
      />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center"
            >
              <HelpCircle className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Adaptive Concept Explainer
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Get personalized, age-appropriate explanations with learning style adaptation</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content - Fixed Layout */}
      <div className="h-[calc(100vh-140px)] max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
          {/* Left Panel - Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4 overflow-y-auto pr-2"
          >
            {/* Configuration Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Learning Configuration</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {difficulties.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject (Optional)</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.value} value={sub.value}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="kn">ಕನ್ನಡ</option>
                  <option value="mr">मराठी</option>
                  <option value="ta">தமிழ்</option>
                  <option value="bn">বাংলা</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Learning Style</label>
                <div className="grid grid-cols-2 gap-3">
                  {learningStyles.map((style) => (
                    <motion.button
                      key={style.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLearningStyle(style.value as any)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        learningStyle === style.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <style.icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{style.label}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{style.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Question Input Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Ask Your Question</h2>
              </div>
              
              <div className="mb-4">
                <div className="relative">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask any question about science, math, or any topic you want to explain to your students..."
                    className="w-full h-24 p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVoiceInput}
                    className={`absolute top-3 right-3 p-2 rounded-lg transition-all duration-200 ${
                      isListening
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700/50">
                  <button
                    onClick={() => setQuestion(currentSampleQuestion)}
                    className="text-left text-sm text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 hover:underline w-full"
                  >
                    {currentSampleQuestion}
                  </button>
                </div>
              </div>
              
              <GenerateButton
                onClick={handleExplain}
                isLoading={isExplaining}
                disabled={!question.trim()}
                size="md"
              >
                Explain This Concept
              </GenerateButton>
            </div>
          </motion.div>

          {/* Right Panel - Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col h-full"
          >
            {explanation ? (
              <div className="space-y-4 h-full flex flex-col">
                <OutputCard
                  title={`Concept: ${question}`}
                  content={explanation.explanation}
                  suggestions={explanation.nextTopics?.join('\n')}
                  tips={explanation.activities?.join('\n')}
                  type="concept"
                  onSave={handleSave}
                  onRegenerate={handleRegenerate}
                  isSaving={isSaving}
                  additionalData={{
                    language: language,
                  }}
                  className="flex-1"
                />
                
                {/* Feedback Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rate this explanation:</span>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleFeedback('like')}
                        className={`p-2 rounded-full transition-all duration-200 ${
                          feedback === 'like' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleFeedback('dislike')}
                        className={`p-2 rounded-full transition-all duration-200 ${
                          feedback === 'dislike' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <Brain className="w-10 h-10 text-green-500 dark:text-green-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Ready to Explain Concepts</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Your adaptive explanation will appear here</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Ask a question and click explain to get started</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConceptExplainer;