import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Languages, 
  Sparkles, 
  Download, 
  Copy, 
  RefreshCw, 
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Edit3,
  Save,
  FileText,
  Heart,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { AIService } from '../services/aiService';
import { FirebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { generatePDF } from '../utils/pdfGenerator';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editableStory, setEditableStory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    en: [
      'Create a story about water cycle for village children',
      'Tell a story about different types of soil',
      'Story about pollution and its effects',
      'Solar system adventure story',
      'Importance of trees and plants',
      'Story about cleanliness and hygiene'
    ],
    hi: [
      'जल चक्र के बारे में एक कहानी बनाएं जो गांव के बच्चों को समझाए',
      'मिट्टी के प्रकार के बारे में एक रोचक कहानी',
      'प्रदूषण की समस्या पर आधारित एक शिक्षाप्रद कहानी',
      'सौर मंडल की यात्रा पर आधारित एक कहानी',
      'पेड़-पौधों के महत्व पर एक कहानी',
      'स्वच्छता के बारे में एक प्रेरणादायक कहानी'
    ],
    kn: [
      'ನೀರಿನ ಚಕ್ರದ ಬಗ್ಗೆ ಗ್ರಾಮೀಣ ಮಕ್ಕಳಿಗೆ ಕಥೆ ರಚಿಸಿ',
      'ವಿವಿಧ ರೀತಿಯ ಮಣ್ಣಿನ ಬಗ್ಗೆ ಆಸಕ್ತಿದಾಯಕ ಕಥೆ',
      'ಮಾಲಿನ್ಯ ಸಮಸ್ಯೆಯ ಮೇಲೆ ಆಧಾರಿತ ಶಿಕ್ಷಣಾತ್ಮಕ ಕಥೆ',
      'ಸೌರಮಂಡಲದ ಪ್ರಯಾಣದ ಮೇಲೆ ಆಧಾರಿತ ಕಥೆ',
      'ಮರಗಳು ಮತ್ತು ಸಸ್ಯಗಳ ಮಹತ್ವದ ಮೇಲೆ ಕಥೆ',
      'ಸ್ವಚ್ಛತೆಯ ಬಗ್ಗೆ ಪ್ರೇರಣಾದಾಯಕ ಕಥೆ'
    ]
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
      setEditableStory(result);
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
        metadata: { feedback, prompt }
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

  const handlePlayAudio = async () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(generatedStory);
      utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 
                      selectedLanguage === 'kn' ? 'kn-IN' :
                      selectedLanguage === 'mr' ? 'mr-IN' : 
                      selectedLanguage === 'ta' ? 'ta-IN' :
                      selectedLanguage === 'bn' ? 'bn-IN' : 'en-US';
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast.error('Error playing audio');
      };
      
      speechSynthesis.speak(utterance);
      toast.success('Playing audio');
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedStory);
    toast.success('Story copied to clipboard!');
  };

  const handleDownloadPDF = () => {
    generatePDF(generatedStory, `Story_${prompt.substring(0, 20).replace(/\s+/g, '_')}`);
    toast.success('PDF downloaded successfully!');
  };

  const handleSaveEdit = () => {
    setGeneratedStory(editableStory);
    setIsEditing(false);
    toast.success('Changes saved!');
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    toast.success(`Feedback recorded! This will help improve future stories.`);
  };

  const currentSamplePrompts = samplePrompts[selectedLanguage as keyof typeof samplePrompts] || samplePrompts.en;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('storyTitle')}
            </h1>
            <p className="text-gray-600 text-sm md:text-base">{t('storySubtitle')}</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Configuration - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-4 md:p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Languages className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Configuration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                {subjects.map((subject) => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                {grades.map((grade) => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                {availableLanguages.slice(0, 6).map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Story Prompt</label>
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
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </motion.button>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('enterPrompt')}
              className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white/50 backdrop-blur-sm text-sm"
              rows={3}
            />
            
            <details className="mt-3">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-purple-600">
                Sample prompts ({currentSamplePrompts.length})
              </summary>
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {currentSamplePrompts.map((sample, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.01, x: 5 }}
                    onClick={() => setPrompt(sample)}
                    className="text-left text-xs text-purple-600 hover:text-purple-700 hover:underline block w-full p-2 rounded-lg hover:bg-purple-50 transition-all duration-200"
                  >
                    {sample}
                  </motion.button>
                ))}
              </div>
            </details>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{t('generateStory')}</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Output Section - Fixed Height Scrollable */}
        {generatedStory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Generated Story</h2>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayAudio}
                  className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200"
                  title="Play Audio"
                >
                  {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200"
                  title="Edit Story"
                >
                  <Edit3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-2 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all duration-200"
                  title="Save Story"
                >
                  <Save className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editableStory}
                  onChange={(e) => setEditableStory(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white/50 backdrop-blur-sm text-sm"
                />
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveEdit}
                    className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </motion.button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Fixed Height Scrollable Story Container */}
                <div className="h-64 overflow-y-auto bg-gradient-to-r from-purple-50 to-pink-50 p-4 md:p-6 rounded-xl border-l-4 border-purple-500">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {generatedStory}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCopy}
                      className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownloadPDF}
                      className="flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-2 rounded-xl hover:bg-red-200 transition-all duration-200 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>PDF</span>
                    </motion.button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Rate:</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFeedback('like')}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        feedback === 'like' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-500'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFeedback('dislike')}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        feedback === 'dislike' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StoryGenerator;