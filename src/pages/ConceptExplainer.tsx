import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Brain, 
  Save, 
  Copy, 
  Download,
  Mic,
  MicOff,
  Volume2,
  Eye,
  Activity,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AIService } from '../services/aiService';
import { FirebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { generatePDF } from '../utils/pdfGenerator';
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
  const [learningStyle, setLearningStyle] = useState<'visual' | 'auditory' | 'kinesthetic' | 'reading'>('visual');
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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
    { value: 'auditory', label: 'Auditory', icon: Volume2, description: 'Learn through listening and discussion' },
    { value: 'kinesthetic', label: 'Kinesthetic', icon: Activity, description: 'Learn through hands-on activities' },
    { value: 'reading', label: 'Reading/Writing', icon: BookOpen, description: 'Learn through text and writing' },
  ];

  const sampleQuestions = {
    en: [
      'Why does it rain?',
      'How does photosynthesis work?',
      'What makes the seasons change?',
      'Why do we have day and night?',
      'How do plants grow?',
      'What is gravity?',
      'Why is the sky blue?',
      'How do magnets work?',
      'What causes earthquakes?',
      'Why do we need to breathe?'
    ],
    hi: [
      'बारिश क्यों होती है?',
      'प्रकाश संश्लेषण कैसे काम करता है?',
      'मौसम क्यों बदलते हैं?',
      'दिन और रात क्यों होते हैं?',
      'पौधे कैसे बढ़ते हैं?',
      'गुरुत्वाकर्षण क्या है?',
      'आकाश नीला क्यों है?',
      'चुंबक कैसे काम करते हैं?',
      'भूकंप क्यों आते हैं?',
      'हमें सांस लेने की जरूरत क्यों है?'
    ]
  };

  React.useEffect(() => {
    if (transcript) {
      setQuestion(transcript);
    }
  }, [transcript]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation.explanation);
      toast.success('Explanation copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    if (explanation) {
      const content = `
Concept Explanation: ${question}

${explanation.explanation}

Visual Aids Suggested:
${explanation.visualAids?.join('\n') || 'None'}

Hands-on Activities:
${explanation.activities?.join('\n') || 'None'}

Assessment Questions:
${explanation.assessmentQuestions?.join('\n') || 'None'}

Next Topics to Explore:
${explanation.nextTopics?.join('\n') || 'None'}
      `;
      generatePDF(content, `Concept_Explanation_${question.substring(0, 20).replace(/\s+/g, '_')}`);
      toast.success('PDF downloaded successfully!');
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(language);
    }
  };

  const handlePlayAudio = async () => {
    if (explanation?.explanation) {
      try {
        const languageCode = language === 'hi' ? 'hi-IN' : 
                            language === 'kn' ? 'kn-IN' :
                            language === 'mr' ? 'mr-IN' : 'en-IN';
        
        const audioUrl = await AIService.synthesizeSpeech({
          text: explanation.explanation,
          languageCode
        });
        
        const audio = new Audio(audioUrl);
        audio.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        toast.error('Failed to play audio');
      }
    }
  };

  const currentSampleQuestions = sampleQuestions[language as keyof typeof sampleQuestions] || sampleQuestions.en;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center"
          >
            <HelpCircle className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Adaptive Concept Explainer
            </h1>
            <p className="text-gray-600">Get personalized, age-appropriate explanations with learning style adaptation</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Target className="w-5 h-5 text-green-600 mr-2" />
              Learning Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject (Optional)
                </label>
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
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Learning Style Preference
              </label>
              <div className="grid grid-cols-2 gap-3">
                {learningStyles.map((style) => (
                  <motion.button
                    key={style.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLearningStyle(style.value)}
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
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
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
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Ask Your Question</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isListening
                    ? 'bg-red-100 text-red-600 animate-pulse'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </motion.button>
            </div>
            
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask any question about science, math, or any topic you want to explain to your students..."
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white/50 backdrop-blur-sm"
            />

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">Popular questions:</p>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {currentSampleQuestions.slice(0, 4).map((sample, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.01, x: 5 }}
                    onClick={() => setQuestion(sample)}
                    className="text-left text-sm text-green-600 hover:text-green-700 hover:underline p-2 rounded-lg hover:bg-green-50 transition-all duration-200"
                  >
                    {sample}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExplain}
              disabled={!question.trim() || isExplaining}
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isExplaining ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Explaining...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Explain This Concept</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Output Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Adaptive Explanation</h2>
              <div className="flex items-center space-x-2">
                {explanation && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePlayAudio}
                      className="p-2 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200"
                      title="Play Audio"
                    >
                      <Volume2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      disabled={isSaving}
                      className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200"
                      title="Save Explanation"
                    >
                      <Save className="w-5 h-5" />
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {explanation ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-500">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">
                      {explanation.explanation}
                    </pre>
                  </div>
                </div>

                {/* Collapsible Sections */}
                {explanation.visualAids && explanation.visualAids.length > 0 && (
                  <details className="bg-blue-50 rounded-xl border border-blue-200/50 overflow-hidden">
                    <summary className="p-4 cursor-pointer hover:bg-blue-100 transition-all duration-200 flex items-center justify-between">
                      <h4 className="font-medium text-blue-800 flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Visual Aids Suggested ({explanation.visualAids.length})
                      </h4>
                      <ChevronDown className="w-4 h-4 text-blue-600" />
                    </summary>
                    <div className="p-4 pt-0">
                      <ul className="text-sm text-blue-700 space-y-1">
                        {explanation.visualAids.map((aid: string, index: number) => (
                          <li key={index}>• {aid}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}

                {explanation.activities && explanation.activities.length > 0 && (
                  <details className="bg-orange-50 rounded-xl border border-orange-200/50 overflow-hidden">
                    <summary className="p-4 cursor-pointer hover:bg-orange-100 transition-all duration-200 flex items-center justify-between">
                      <h4 className="font-medium text-orange-800 flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        Hands-on Activities ({explanation.activities.length})
                      </h4>
                      <ChevronDown className="w-4 h-4 text-orange-600" />
                    </summary>
                    <div className="p-4 pt-0">
                      <ul className="text-sm text-orange-700 space-y-1">
                        {explanation.activities.map((activity: string, index: number) => (
                          <li key={index}>• {activity}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}

                {explanation.assessmentQuestions && explanation.assessmentQuestions.length > 0 && (
                  <details className="bg-purple-50 rounded-xl border border-purple-200/50 overflow-hidden">
                    <summary className="p-4 cursor-pointer hover:bg-purple-100 transition-all duration-200 flex items-center justify-between">
                      <h4 className="font-medium text-purple-800 flex items-center">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Assessment Questions ({explanation.assessmentQuestions.length})
                      </h4>
                      <ChevronDown className="w-4 h-4 text-purple-600" />
                    </summary>
                    <div className="p-4 pt-0">
                      <ul className="text-sm text-purple-700 space-y-1">
                        {explanation.assessmentQuestions.map((question: string, index: number) => (
                          <li key={index}>• {question}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}

                {explanation.nextTopics && explanation.nextTopics.length > 0 && (
                  <details className="bg-indigo-50 rounded-xl border border-indigo-200/50 overflow-hidden">
                    <summary className="p-4 cursor-pointer hover:bg-indigo-100 transition-all duration-200 flex items-center justify-between">
                      <h4 className="font-medium text-indigo-800 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Next Topics to Explore ({explanation.nextTopics.length})
                      </h4>
                      <ChevronDown className="w-4 h-4 text-indigo-600" />
                    </summary>
                    <div className="p-4 pt-0">
                      <ul className="text-sm text-indigo-700 space-y-1">
                        {explanation.nextTopics.map((topic: string, index: number) => (
                          <li key={index}>• {topic}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}
                
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadPDF}
                    className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-200 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Your adaptive explanation will appear here</p>
                  <p className="text-sm mt-2">Ask a question and click explain to get started</p>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConceptExplainer;