import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Upload, 
  FileText, 
  Image, 
  Download, 
  Sparkles, 
  Eye, 
  Edit3, 
  Save,
  ChevronDown,
  ChevronUp,
  Layers,
  Target
} from 'lucide-react';
import { AIService } from '../services/aiService';
import { FirebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { generatePDF } from '../utils/pdfGenerator';
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
  const [includeVisuals, setIncludeVisuals] = useState(true);
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
    { value: 'marathi', label: 'मराठी' },
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
        includeVisuals
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
        metadata: { topic, difficulty, includeVisuals }
      });
      toast.success('Worksheet saved successfully!');
    } catch (error) {
      console.error('Error saving worksheet:', error);
      toast.error('Error saving worksheet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (selectedWorksheet && worksheetContent[selectedWorksheet]) {
      generatePDF(worksheetContent[selectedWorksheet], `Worksheet_${subject}_Grade_${selectedWorksheet}_${topic.replace(/\s+/g, '_')}`);
      toast.success('PDF downloaded successfully!');
    }
  };

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
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center"
          >
            <FileText className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Multi-Grade Worksheet Generator
            </h1>
            <p className="text-gray-600">Create differentiated worksheets for multiple grade levels</p>
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
          {/* Configuration */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Target className="w-5 h-5 text-blue-600 mr-2" />
              Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
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
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic/Concept
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter the topic for the worksheet..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="flex items-center justify-center">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={includeVisuals}
                    onChange={(e) => setIncludeVisuals(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Include Visual Elements
                  </span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Grades (Multiple Selection)
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-white/50 backdrop-blur-sm">
                {grades.map((grade) => (
                  <label key={grade.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedGrades.includes(grade.value)}
                      onChange={() => handleGradeToggle(grade.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{grade.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Image className="w-5 h-5 text-blue-600 mr-2" />
              Reference Image (Optional)
            </h2>
            
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
                  </p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateWorksheet}
              disabled={!topic.trim() || selectedGrades.length === 0 || isGenerating}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Worksheets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Worksheets</span>
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
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Layers className="w-5 h-5 text-blue-600 mr-2" />
                Generated Worksheets
              </h2>
              {Object.keys(worksheetContent).length > 0 && (
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isSaving || !selectedWorksheet}
                    className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200"
                    title="Save Worksheet"
                  >
                    <Save className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </div>

            {Object.keys(worksheetContent).length > 0 ? (
              <div className="space-y-4">
                {/* Grade Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Grade to View
                  </label>
                  <select
                    value={selectedWorksheet}
                    onChange={(e) => setSelectedWorksheet(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    {Object.keys(worksheetContent).map((grade) => (
                      <option key={grade} value={grade}>
                        {grades.find(g => g.value === grade)?.label || `Grade ${grade}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Worksheet Content */}
                <AnimatePresence mode="wait">
                  {selectedWorksheet && worksheetContent[selectedWorksheet] && (
                    <motion.div
                      key={selectedWorksheet}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                          {worksheetContent[selectedWorksheet]}
                        </pre>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleDownloadPDF}
                          className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl hover:bg-green-200 transition-all duration-200"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download PDF</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigator.clipboard.writeText(worksheetContent[selectedWorksheet])}
                          className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-200 transition-all duration-200"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Copy Content</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Grade Overview */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200/50">
                  <h4 className="font-medium text-blue-800 mb-2">Generated for Grades:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(worksheetContent).map((grade) => (
                      <span
                        key={grade}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                          selectedWorksheet === grade
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                        onClick={() => setSelectedWorksheet(grade)}
                      >
                        {grades.find(g => g.value === grade)?.label || `Grade ${grade}`}
                      </span>
                    ))}
                  </div>
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
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Your generated worksheets will appear here</p>
                  <p className="text-sm mt-2">Enter a topic, select grades, and click generate to get started</p>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorksheetGenerator;