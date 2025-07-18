import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Image, 
  Target,
  BookOpen,
  GraduationCap,
  Globe,
  Palette
} from 'lucide-react';
import { AIService } from '../services/aiService';
import { FirebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { LoadingTeacher } from '../components/UI/LoadingTeacher';
import { OutputCard } from '../components/UI/OutputCard';
import { InputCard, InputField } from '../components/UI/InputCard';
import { GenerateButton } from '../components/UI/GenerateButton';
import toast from 'react-hot-toast';

const VisualAids: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('science');
  const [grade, setGrade] = useState('3');
  const [language, setLanguage] = useState(currentLanguage);
  const [generatedAid, setGeneratedAid] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const subjects = [
    { value: 'science', label: t('science') },
    { value: 'math', label: t('mathematics') },
    { value: 'english', label: t('english') },
    { value: 'hindi', label: t('hindi') },
    { value: 'social', label: t('socialStudies') },
    { value: 'evs', label: t('environmentalStudies') },
  ];

  const grades = [
    { value: '1', label: t('grade1') },
    { value: '2', label: t('grade2') },
    { value: '3', label: t('grade3') },
    { value: '4', label: t('grade4') },
    { value: '5', label: t('grade5') },
    { value: '6', label: 'Grade 6' },
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
  ];

  const sampleTopic = {
    en: 'Water Cycle',
    hi: 'जल चक्र',
    kn: 'ನೀರಿನ ಚಕ್ರ'
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await AIService.generateVisualAidWithImage({
        topic,
        subject,
        grade,
        language,
        includeImage: true
      });
      setGeneratedAid(result);
      toast.success('Visual aid generated successfully!');
    } catch (error) {
      console.error('Error generating visual aid:', error);
      toast.error('Failed to generate visual aid. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedAid || !user) return;
    
    setIsSaving(true);
    try {
      await FirebaseService.saveGeneratedContent({
        type: 'visual-aid',
        title: `Visual Aid: ${topic}`,
        content: JSON.stringify(generatedAid),
        subject,
        grade,
        language,
        teacherId: user.uid,
        metadata: { topic }
      });
      toast.success('Visual aid saved successfully!');
    } catch (error) {
      console.error('Error saving visual aid:', error);
      toast.error('Error saving visual aid. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const currentSampleTopic = sampleTopic[language as keyof typeof sampleTopic] || sampleTopic.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <LoadingTeacher 
        isVisible={isGenerating}
        message="Creating visual aid instructions... Please wait ⏳"
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
              className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center"
            >
              <Image className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Visual Aid Generator
              </h1>
              <p className="text-gray-600 text-lg mt-2">Create engaging visual aids with step-by-step instructions</p>
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
            <InputCard title="Visual Aid Configuration" icon={Target}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Subject" icon={BookOpen} required>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.value} value={sub.value}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Grade Level" icon={GraduationCap} required>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    {grades.map((gr) => (
                      <option key={gr.value} value={gr.value}>
                        {gr.label}
                      </option>
                    ))}
                  </select>
                </InputField>
              </div>
              
              <InputField label="Output Language" icon={Globe} required>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="kn">ಕನ್ನಡ</option>
                  <option value="mr">मराठी</option>
                  <option value="ta">தமிழ்</option>
                  <option value="bn">বাংলা</option>
                </select>
              </InputField>
              
              <InputField 
                label="Topic/Concept" 
                tooltip="Enter the topic you want to create a visual aid for"
                required
              >
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter the topic you want to create a visual aid for..."
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </InputField>
              
              <InputField label="Popular Topic">
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <button
                    onClick={() => setTopic(currentSampleTopic)}
                    className="text-left text-sm text-orange-700 hover:text-orange-800 hover:underline w-full"
                  >
                    {currentSampleTopic}
                  </button>
                </div>
              </InputField>
              
              <GenerateButton
                onClick={handleGenerate}
                isLoading={isGenerating}
                disabled={!topic.trim()}
              >
                Generate Visual Aid
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
            {generatedAid ? (
              <div className="space-y-4">
                {/* AI Generated Image */}
                {generatedAid.imageUrl && (
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Palette className="w-5 h-5 text-orange-600 mr-2" />
                      Reference Image
                    </h3>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl">
                      <img
                        src={`data:image/svg+xml;base64,${generatedAid.imageUrl}`}
                        alt={`Visual aid for ${topic}`}
                        className="w-full max-w-md mx-auto rounded-lg shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        Use this as a reference while drawing on the blackboard
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Instructions */}
                <OutputCard
                  title={`Visual Aid: ${topic}`}
                  content={generatedAid.instructions}
                  type="visual-aid"
                  onSave={handleSave}
                  onRegenerate={handleRegenerate}
                  isSaving={isSaving}
                  additionalData={{
                    tips: generatedAid.materials,
                    suggestions: [`Time: ${generatedAid.timeEstimate}`, `Difficulty: ${generatedAid.difficulty}`]
                  }}
                  className="h-full"
                />
              </div>
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
                    className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <Image className="w-12 h-12 text-orange-500" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Create Visual Aids</h3>
                  <p className="text-gray-600 mb-4">Your visual aid guide will appear here</p>
                  <p className="text-sm text-gray-500">Enter a topic and click generate to get started</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VisualAids;