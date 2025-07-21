import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen,
  Languages, 
  Sparkles, 
  Mic,
  MicOff,
  ThumbsUp,
  ThumbsDown,
  GraduationCap,
  Globe
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

const StoryGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage, availableLanguages } = useLanguage();
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [selectedSubject, setSelectedSubject] = useState('science');
  const [selectedGrade, setSelectedGrade] = useState('3');
  const [prompt, setPrompt] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const subjects = [
    { value: 'science', label: t('science') },
    { value: 'math', label: t('mathematics') },
    { value: 'english', label: t('english') },
    { value: 'hindi', label: t('hindi') },
    { value: 'social', label: t('socialStudies') },
    { value: 'evs', label: t('environmentalStudies') },
  ];

  const grades = [
    { value: 'nursery', label: 'Nursery' },
    { value: 'lkg', label: 'LKG' },
    { value: 'ukg', label: 'UKG' },
    { value: '1', label: t('grade1') },
    { value: '2', label: t('grade2') },
    { value: '3', label: t('grade3') },
    { value: '4', label: t('grade4') },
    { value: '5', label: t('grade5') },
    { value: '6', label: 'Grade 6' },
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
    { value: '9', label: 'Grade 9' },
    { value: '10', label: 'Grade 10' },
  ];

  const samplePrompts = {
    en: 'Create a story about water cycle for village children',
    hi: 'जल चक्र के बारे में एक कहानी बनाएं जो गांव के बच्चों को समझाए',
    kn: 'ನೀರಿನ ಚಕ್ರದ ಬಗ್ಗೆ ಗ್ರಾಮೀಣ ಮಕ್ಕಳಿಗೆ ಕಥೆ ರಚಿಸಿ'
  };

  React.useEffect(() => {
    if (transcript) {
      setPrompt(transcript);
    }
  }, [transcript]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a story prompt');
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await AIService.generatePersonalizedStory({
        prompt,
        language: selectedLanguage,
        grade: selectedGrade,
        subject: selectedSubject,
        localContext: 'Indian classroom environment',
        previousFeedback: feedback ? [feedback] : undefined
      });
      setGeneratedStory(result);
      toast.success('Story generated successfully!');
    } catch (error) {
      console.error('Error generating story:', error);
      toast.error('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedStory || !user) return;
    
    setIsSaving(true);
    try {
      await FirebaseService.saveGeneratedContent({
        type: 'story',
        title: prompt.substring(0, 50) + '...',
        content: generatedStory,
        subject: selectedSubject,
        grade: selectedGrade,
        language: selectedLanguage,
        teacherId: user.uid,
        metadata: { feedback, prompt },
        createdAt: new Date()
      });
      toast.success('Story saved successfully!');
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('Error saving story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(selectedLanguage);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    toast.success(`Feedback recorded! This will help improve future stories.`);
  };

  const currentSamplePrompt = samplePrompts[selectedLanguage as keyof typeof samplePrompts] || samplePrompts.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <LoadingTeacher 
        isVisible={isGenerating}
        message="Creating your personalized story... Please wait ⏳"
      />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('storyTitle')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">{t('storySubtitle')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-[calc(100vh-200px)]">
          {/* Left Panel - Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <InputCard title="Story Configuration" icon={Languages}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Subject" icon={BookOpen} required>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-sm"
                  >
                    {subjects.map((subject) => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Grade Level" icon={GraduationCap} required>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-sm"
                  >
                    {grades.map((grade) => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Output Language" icon={Globe} required>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-sm"
                  >
                    {availableLanguages.slice(0, 6).map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName}
                      </option>
                    ))}
                  </select>
                </InputField>
              </div>
              
              <InputField 
                label="Story Prompt" 
                tooltip="Describe what you want the story to be about"
                required
              >
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('enterPrompt')}
                    className="w-full h-32 p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white/50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-sm"
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
              </InputField>
              
              <InputField label="Sample Prompt">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700/50">
                  <button
                    onClick={() => setPrompt(currentSamplePrompt)}
                    className="text-left text-sm text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 hover:underline w-full"
                  >
                    {currentSamplePrompt}
                  </button>
                </div>
              </InputField>
              
              <GenerateButton
                onClick={handleGenerate}
                isLoading={isGenerating}
                disabled={!prompt.trim()}
              >
                {t('generateStory')}
              </GenerateButton>
            </InputCard>
          </motion.div>

          {/* Right Panel - Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {generatedStory ? (
              <OutputCard
                title={`Story: ${prompt.substring(0, 50)}...`}
                content={generatedStory}
                type="story"
                onSave={handleSave}
                onRegenerate={handleRegenerate}
                isSaving={isSaving}
                isEditable={true}
                additionalData={{ language: selectedLanguage }}
                className="h-full"
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 h-full flex items-center justify-center">
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
                    className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <BookOpen className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Ready to Create Stories</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Your AI-generated story will appear here</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Fill in the form and click generate to get started</p>
                </div>
              </div>
            )}
            
            {/* Feedback Section */}
            {generatedStory && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rate this story:</span>
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
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StoryGenerator;