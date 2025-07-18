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
        metadata: { topic, difficulty, questionTypes }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <LoadingTeacher 
        isVisible={isGenerating}
        message="Creating differentiated worksheets... Please wait ⏳"
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
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center"
            >
              <FileText className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Multi-Grade Worksheet Generator
              </h1>
              <p className="text-gray-600 text-lg mt-2">Create differentiated worksheets for multiple grade levels</p>
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
            <InputCard title="Worksheet Configuration" icon={Target}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Subject" icon={BookOpen} required>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.value} value={sub.value}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
                </InputField>

                <InputField label="Output Language" icon={Globe} required>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </InputField>
              </div>
              
              <InputField 
                label="Topic/Concept" 
                tooltip="Enter the main topic for the worksheet"
                required
              >
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter the topic for the worksheet..."
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </InputField>
              
              <InputField label="Difficulty Level" icon={Settings}>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </InputField>
              
              <InputField label="Select Grades" icon={GraduationCap} required>
                <select
                  multiple
                  value={selectedGrades}
                  onChange={(e) => setSelectedGrades(Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm h-32"
                >
                  {grades.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple grades</p>
              </InputField>
              
              <InputField label="Question Types (Optional)" icon={List}>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-white/50 backdrop-blur-sm">
                  {questionTypeOptions.map((type) => (
                    <label key={type.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questionTypes.includes(type.value)}
                        onChange={() => handleQuestionTypeToggle(type.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </InputField>
            </InputCard>
            
            {/* Image Upload Card */}
            <InputCard title="Reference Image (Optional)" icon={Image}>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img
                      src={uploadedImage}
                      alt="Uploaded reference"
                      className="max-w-full h-32 object-contain mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-600">Reference image uploaded!</p>
                    <label className="cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-200 transition-all duration-200 inline-block">
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
                  <div className="space-y-4">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600 mb-2">Upload a reference image (optional)</p>
                      <label className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-200 inline-block">
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Supported formats: JPG, PNG, PDF
                    additionalData={{ language: language }}
                    </p>
                  </div>
                )}
              </div>
              
              <GenerateButton
                onClick={handleGenerateWorksheet}
                isLoading={isGenerating}
                disabled={!topic.trim() || selectedGrades.length === 0}
              >
                Generate Worksheets
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
            {Object.keys(worksheetContent).length > 0 ? (
              <div className="space-y-4">
                {/* Grade Selector */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200/50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Grade to View
                  </label>
                  <select
                    value={selectedWorksheet}
                    onChange={(e) => setSelectedWorksheet(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.keys(worksheetContent).map((grade) => (
                      <option key={grade} value={grade}>
                        {grades.find(g => g.value === grade)?.label || `Grade ${grade}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Worksheet Output */}
                <AnimatePresence mode="wait">
                  {selectedWorksheet && worksheetContent[selectedWorksheet] && (
                    <OutputCard
                      key={selectedWorksheet}
                      title={`${subject} Worksheet - Grade ${grades.find(g => g.value === selectedWorksheet)?.label}`}
                      content={worksheetContent[selectedWorksheet]}
                      type="worksheet"
                      onSave={handleSave}
                      onRegenerate={handleRegenerate}
                      isSaving={isSaving}
                      className="h-full"
                    />
                  )}
                </AnimatePresence>
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
                    className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <FileText className="w-12 h-12 text-blue-500" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Create Worksheets</h3>
                  <p className="text-gray-600 mb-4">Your differentiated worksheets will appear here</p>
                  <p className="text-sm text-gray-500">Fill in the form and click generate to get started</p>
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