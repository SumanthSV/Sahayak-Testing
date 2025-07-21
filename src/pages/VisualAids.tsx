import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Image, 
  Target,
  BookOpen,
  GraduationCap,
  Globe,
  Palette,
  Save
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
  const [imageType, setImageType] = useState('3D Visuals');
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
        imageType,
        includeImage: true
      });
      setGeneratedAid(result);
      console.log('Generated Visual Aid:', result);
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
      const imagePath = `visual-aids/${user.uid}/${Date.now()}.png`;
      const downloadURL = await FirebaseService.uploadImageToStorage(generatedAid.imageBase64, imagePath);

      const imagePayload = {
        type: 'visual-aid',
        title: `Visual Aid: ${topic}`,
        subject,
        grade,
        language,
        teacherId: user.uid,
        imageUrl: downloadURL,
        mimeType: generatedAid.mimeType || 'image/png',
        tags: [topic],
      };

      await FirebaseService.saveGeneratedImage(imagePayload);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <LoadingTeacher 
        isVisible={isGenerating}
        message="Creating visual aid instructions... Please wait ⏳"
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
              className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center"
            >
              <Image className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Visual Aid Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">Create engaging visual aids with step-by-step instructions</p>
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
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-sm"
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
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-sm"
                  >
                    {grades.map((gr) => (
                      <option key={gr.value} value={gr.value}>
                        {gr.label}
                      </option>
                    ))}
                  </select>
                </InputField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Output Language" icon={Globe} required>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-sm"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="kn">ಕನ್ನಡ</option>
                    <option value="mr">मराठी</option>
                    <option value="ta">தமிழ்</option>
                    <option value="bn">বাংলা</option>
                  </select>
                </InputField>

                <InputField label="Type of Visuals" icon={Image} required>
                  <select
                    value={imageType}
                    onChange={(e) => setImageType(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-sm"
                  >
                    <option value="3D Visuals">3D Visuals</option>
                    <option value="Drawable Visuals">Drawable Visuals</option>
                  </select>
                </InputField>
              </div>
              
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
                  className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-sm"
                />
              </InputField>
              
              <InputField label="Popular Topic">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl border border-orange-200 dark:border-orange-700/50">
                  <button
                    onClick={() => setTopic(currentSampleTopic)}
                    className="text-left text-sm text-orange-700 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-200 hover:underline w-full"
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
              <OutputCard
                title={`Visual Aid: ${topic}`}
                content={generatedAid.instructions}
                tips={generatedAid.teachingTips?.join('\n')}
                suggestions={generatedAid.variations?.join('\n')}
                imageUrl={generatedAid.imageUrl ? `data:image/png;base64,${generatedAid.imageUrl}` : undefined}
                type="visual-aid"
                onSave={handleSave}
                onRegenerate={handleRegenerate}
                isSaving={isSaving}
                additionalData={{ language }}
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
                    className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <Image className="w-12 h-12 text-orange-500 dark:text-orange-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Ready to Create Visual Aids</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Your visual aid guide will appear here</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Enter a topic and click generate to get started</p>
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