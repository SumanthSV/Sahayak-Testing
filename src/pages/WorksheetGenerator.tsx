import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Upload, 
  FileText, 
  Image, 
  Target,
  BookOpen,
  GraduationCap,
  Globe,
  Settings,
  CheckSquare,
  Edit,
  List
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

const WorksheetGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [worksheetContent, setWorksheetContent] = useState<{ [grade: string]: string }>({});
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['3']);
  const [subject, setSubject] = useState('math');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState(currentLanguage);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionTypes, setQuestionTypes] = useState<string[]>(['mcq', 'fillblanks']);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedWorksheet, setSelectedWorksheet] = useState<string>('');

  const subjects = [
    { value: 'math', label: t('mathematics') },
    { value: 'science', label: t('science') },
    { value: 'english', label: t('english') },
    { value: 'hindi', label: t('hindi') },
    { value: 'social', label: t('socialStudies') },
    { value: 'evs', label: t('environmentalStudies') },
  ];

  const grades = [
    { value: 'nursery', label: 'Nursery' },
    { value: 'lkg', label: 'LKG' },
    { value: 'ukg', label: 'UKG' },
    { value: '1', label: 'Grade 1' },
    { value: '2', label: 'Grade 2' },
    { value: '3', label: 'Grade 3' },
    { value: '4', label: 'Grade 4' },
    { value: '5', label: 'Grade 5' },
    { value: '6', label: 'Grade 6' },
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
    { value: '9', label: 'Grade 9' },
    { value: '10', label: 'Grade 10' },
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'हिंदी' },
    { value: 'kannada', label: 'ಕನ್ನಡ' },
    { value: 'mr', label: 'मराठी' },
  ];

  const questionTypeOptions = [
    { value: 'mcq', label: 'Multiple Choice Questions' },
    { value: 'fillblanks', label: 'Fill in the Blanks' },
    { value: 'shortanswer', label: 'Short Answer Questions' },
    { value: 'truefalse', label: 'True/False Questions' },
    { value: 'matching', label: 'Matching Questions' },
    { value: 'essay', label: 'Essay Questions' }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGradeToggle = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  const handleQuestionTypeToggle = (type: string) => {
    setQuestionTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleGenerateWorksheet = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    
    if (selectedGrades.length === 0) {
      toast.error('Please select at least one grade');
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await AIService.generateDifferentiatedWorksheet({
        imageData: uploadedImage || undefined,
        topic,
        subject,
        grades: selectedGrades,
        language,
        difficulty,
        includeVisuals: true
      });
      
      setWorksheetContent(result);
      setSelectedWorksheet(selectedGrades[0]);
      toast.success('Worksheets generated successfully!');
    } catch (error) {
      console.error('Error generating worksheet:', error);
      toast.error('Failed to generate worksheet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!worksheetContent || !user || !selectedWorksheet) return;
    
    setIsSaving(true);
    try {
      await FirebaseService.saveGeneratedContent({
        type: 'worksheet',
        title: `${subject} Worksheet - ${topic} - Grade ${selectedWorksheet}`,
        content: worksheetContent[selectedWorksheet],
        subject,
        grade: selectedWorksheet,
        language,
        teacherId: user.uid,
        metadata: { topic, difficulty, questionTypes },
        createdAt: new Date()
      });
      toast.success('Worksheet saved successfully!');
    } catch (error) {
      console.error('Error saving worksheet:', error);
      toast.error('Error saving worksheet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerateWorksheet();
  };

  return (
    <div className="h-screen bg-white dark:bg-black overflow-hidden">
      <LoadingTeacher 
        isVisible={isGenerating}
        message="Creating differentiated worksheets... Please wait ⏳"
      />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12  rounded-2xl flex items-center justify-center"
            >
              <FileText className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                Multi-Grade Worksheet Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Create differentiated worksheets for multiple grade levels</p>
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
            <div className="bg-white/90 dark:bg-black backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Configuration</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.value} value={sub.value}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl   bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic/Concept</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter the topic for the worksheet..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grades</label>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 max-h-20 overflow-y-auto">
                    {grades.slice(0, 8).map((grade) => (
                      <button
                        key={grade.value}
                        onClick={() => handleGradeToggle(grade.value)}
                        className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 ${
                          selectedGrades.includes(grade.value)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }`}
                      >
                        {grade.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload Card */}
            <div className="bg-white/90 dark:bg-zinc-950 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8  rounded-xl flex items-center justify-center">
                  <Image className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Reference Image</h2>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center">
                {uploadedImage ? (
                  <div className="space-y-3">
                    <img
                      src={uploadedImage}
                      alt="Uploaded reference"
                      className="max-w-full h-24 object-contain mx-auto rounded-lg"
                    />
                    <label className="cursor-pointer bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 inline-block">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">Upload reference image (optional)</p>
                      <label className="cursor-pointer bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-all duration-200 inline-block">
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <GenerateButton
                  onClick={handleGenerateWorksheet}
                  isLoading={isGenerating}
                  disabled={!topic.trim() || selectedGrades.length === 0}
                  size="md"
                >
                  Generate Worksheets
                </GenerateButton>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col h-full"
          >
            {Object.keys(worksheetContent).length > 0 ? (
              <div className="flex flex-col h-full space-y-4">
                {/* Grade Selector */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Grade to View
                  </label>
                  <select
                    value={selectedWorksheet}
                    onChange={(e) => setSelectedWorksheet(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {Object.keys(worksheetContent).map((grade) => (
                      <option key={grade} value={grade}>
                        {grades.find(g => g.value === grade)?.label || `Grade ${grade}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Worksheet Output - Fixed Height */}
                <div className="flex-1 min-h-0">
                  <AnimatePresence mode="wait">
                    {selectedWorksheet && worksheetContent[selectedWorksheet] && (
                      <div className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                              {subject} Worksheet - Grade {grades.find(g => g.value === selectedWorksheet)?.label}
                            </h3>
                            <button
                              onClick={handleSave}
                              disabled={isSaving}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 disabled:opacity-50"
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                        <div className="p-4 h-[calc(100%-80px)] overflow-y-auto">
                          <div className="bg-slate-800 dark:bg-gray-900 text-green-400 dark:text-green-300 p-4 rounded-lg border-2 border-slate-600 dark:border-gray-600 font-mono text-sm leading-relaxed">
                            <pre className="whitespace-pre-wrap">
                              {worksheetContent[selectedWorksheet]}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white/90 dark:bg-zinc-950 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center">
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
                    className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <FileText className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Ready to Create Worksheets</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Your differentiated worksheets will appear here</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Fill in the form and click generate to get started</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetGenerator;