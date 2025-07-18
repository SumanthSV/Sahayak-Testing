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
  MessageCircle
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
        metadata: { question, difficulty, subject, learningStyle }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <LoadingTeacher 
        isVisible={isExplaining}
        message="Analyzing and explaining the concept... Please wait ⏳"
      />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-6 py-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center"
            >
              <HelpCircle className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Adaptive Concept Explainer
              </h1>
              <p className="text-gray-600 text-lg mt-2">Get personalized, age-appropriate explanations with learning style adaptation</p>
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
            <InputCard title="Learning Configuration" icon={Target}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Difficulty Level" icon={GraduationCap} required>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    {difficulties.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Subject (Optional)" icon={BookOpen}>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.value} value={sub.value}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
                </InputField>
              </div>
              
              <InputField label="Output Language" icon={Globe} required>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="kn">ಕನ್ನಡ</option>
                  <option value="mr">मराठी</option>
                  <option value="ta">தமிழ்</option>
                  <option value="bn">বাংলা</option>
                </select>
              </InputField>
              
              <InputField label="Learning Style Preference">
                <div className="grid grid-cols-2 gap-3">
                  {learningStyles.map((style) => (
                    <motion.button
                      key={style.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLearningStyle(style.value as any)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        learningStyle === style.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <style.icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{style.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{style.description}</p>
                    </motion.button>
                  ))}
                </div>
              </InputField>
            </InputCard>
            
            <InputCard title="Ask Your Question" icon={MessageCircle}>
              <InputField 
                label="Your Question" 
                tooltip="Ask any question about science, math, or any topic"
                required
              >
                <div className="relative">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask any question about science, math, or any topic you want to explain to your students..."
                    className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white/50 backdrop-blur-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVoiceInput}
                    className={`absolute top-3 right-3 p-2 rounded-lg transition-all duration-200 ${
                      isListening
                        ? 'bg-red-100 text-red-600 animate-pulse'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </motion.button>
                </div>
              </InputField>
              
              <InputField label="Popular Question">
                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <button
                    onClick={() => setQuestion(currentSampleQuestion)}
                    className="text-left text-sm text-green-700 hover:text-green-800 hover:underline w-full"
                  >
                    {currentSampleQuestion}
                  </button>
                </div>
              </InputField>
              
              <GenerateButton
                onClick={handleExplain}
                isLoading={isExplaining}
                disabled={!question.trim()}
              >
                Explain This Concept
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
            {explanation ? (
              <OutputCard
                title={`Concept: ${question}`}
                content={explanation.explanation}
                type="concept"
                onSave={handleSave}
                onRegenerate={handleRegenerate}
                isSaving={isSaving}
                additionalData={{
                  language: language,
                  tips: explanation.visualAids,
                  suggestions: explanation.activities
                }}
                className="h-full"
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8 h-full flex items-center justify-center">
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
                    className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <Brain className="w-12 h-12 text-green-500" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Explain Concepts</h3>
                  <p className="text-gray-600 mb-4">Your adaptive explanation will appear here</p>
                  <p className="text-sm text-gray-500">Ask a question and click explain to get started</p>
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