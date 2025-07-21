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
  Sparkles,
  Wand2,
  Scroll
} from 'lucide-react';
import { AIService } from '../services/aiService';
import { FirebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { LoadingTeacher } from '../components/UI/LoadingTeacher';
import { MagicalCard } from '../components/UI/MagicalCard';
import { AnimatedAvatar } from '../components/UI/AnimatedAvatar';
import { GenerateButton } from '../components/UI/GenerateButton';
import toast from 'react-hot-toast';

const ModernWorksheetGenerator: React.FC = () => {
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
  const [isSaving, setIsSaving] = useState(false);
  const [selectedWorksheet, setSelectedWorksheet] = useState<string>('');

  const subjects = [
    { value: 'math', label: 'Arithmancy', icon: '🔢' },
    { value: 'science', label: 'Potions & Sciences', icon: '⚗️' },
    { value: 'english', label: 'Ancient Runes', icon: '📜' },
    { value: 'hindi', label: 'Sacred Scripts', icon: '🕉️' },
    { value: 'social', label: 'History of Magic', icon: '🏛️' },
    { value: 'evs', label: 'Magical Creatures', icon: '🦄' },
  ];

  const grades = [
    { value: 'nursery', label: 'Tiny Wizards' },
    { value: 'lkg', label: 'Little Sorcerers' },
    { value: 'ukg', label: 'Young Mages' },
    { value: '1', label: 'First Year' },
    { value: '2', label: 'Second Year' },
    { value: '3', label: 'Third Year' },
    { value: '4', label: 'Fourth Year' },
    { value: '5', label: 'Fifth Year' },
    { value: '6', label: 'Sixth Year' },
    { value: '7', label: 'Seventh Year' },
    { value: '8', label: 'Eighth Year' },
  ];

  const languages = [
    { value: 'english', label: 'Common Tongue', flag: '🇬🇧' },
    { value: 'hindi', label: 'Ancient Sanskrit', flag: '🇮🇳' },
    { value: 'kannada', label: 'Southern Runes', flag: '🇮🇳' },
    { value: 'mr', label: 'Western Scripts', flag: '🇮🇳' },
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
      toast.error('Please enter a magical topic');
      return;
    }
    
    if (selectedGrades.length === 0) {
      toast.error('Please select at least one year');
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
      toast.success('Magical scrolls conjured successfully!');
    } catch (error) {
      console.error('Error generating worksheet:', error);
      toast.error('The magic failed to work. Please try again.');
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
        title: `${subject} Scroll - ${topic} - ${selectedWorksheet} Year`,
        content: worksheetContent[selectedWorksheet],
        subject,
        grade: selectedWorksheet,
        language,
        teacherId: user.uid,
        metadata: { topic, difficulty },
        createdAt: new Date()
      });
      toast.success('Magical scroll preserved in the archives!');
    } catch (error) {
      console.error('Error saving worksheet:', error);
      toast.error('Failed to preserve the scroll. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 relative overflow-hidden">
      <LoadingTeacher 
        isVisible={isGenerating}
        message="Conjuring magical worksheets... The ancient scrolls are being prepared ⏳"
      />
      
      {/* Magical background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23a855f7" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 text-center"
      >
        <div className="flex items-center justify-center space-x-4 mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50"
          >
            <Scroll className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Magical Scroll Crafting
            </h1>
            <p className="text-gray-300 text-lg">Create enchanted worksheets for every year of study</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Basic Configuration */}
            <MagicalCard className="p-6" glowColor="blue">
              <div className="flex items-center space-x-3 mb-6">
                <AnimatedAvatar type="educational" size="md" />
                <h2 className="text-xl font-semibold text-white">Scroll Configuration</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Subject of Study</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white transition-all duration-200"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.value} value={sub.value} className="bg-purple-900 text-white">
                        {sub.icon} {sub.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Magical Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white transition-all duration-200"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value} className="bg-purple-900 text-white">
                        {lang.flag} {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Topic of Enchantment</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter the magical topic..."
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white transition-all duration-200"
                  >
                    <option value="easy" className="bg-purple-900 text-white">Apprentice</option>
                    <option value="medium" className="bg-purple-900 text-white">Scholar</option>
                    <option value="hard" className="bg-purple-900 text-white">Master</option>
                  </select>
                </div>
              </div>
            </MagicalCard>

            {/* Year Selection */}
            <MagicalCard className="p-6" glowColor="purple">
              <div className="flex items-center space-x-3 mb-6">
                <AnimatedAvatar type="game" size="md" />
                <h2 className="text-xl font-semibold text-white">Academic Years</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {grades.map((grade) => (
                  <motion.button
                    key={grade.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGradeToggle(grade.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                      selectedGrades.includes(grade.value)
                        ? 'border-purple-400 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/25'
                        : 'border-white/20 bg-white/5 text-gray-300 hover:border-purple-400/50 hover:bg-purple-500/10'
                    }`}
                  >
                    {grade.label}
                  </motion.button>
                ))}
              </div>
            </MagicalCard>

            {/* Reference Image */}
            <MagicalCard className="p-6" glowColor="green">
              <div className="flex items-center space-x-3 mb-6">
                <AnimatedAvatar type="visual" size="md" />
                <h2 className="text-xl font-semibold text-white">Mystical Reference</h2>
              </div>
              
              <div className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center">
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img
                      src={uploadedImage}
                      alt="Uploaded reference"
                      className="max-w-full h-32 object-contain mx-auto rounded-lg shadow-lg"
                    />
                    <label className="cursor-pointer bg-green-500/20 text-green-300 px-4 py-2 rounded-xl hover:bg-green-500/30 transition-all duration-200 inline-block">
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
                      <p className="text-gray-300 mb-3 text-sm">Upload mystical reference (optional)</p>
                      <label className="cursor-pointer bg-green-500/20 text-green-300 px-4 py-2 rounded-xl hover:bg-green-500/30 transition-all duration-200 inline-block">
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
            </MagicalCard>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateWorksheet}
              disabled={!topic.trim() || selectedGrades.length === 0 || isGenerating}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center space-x-3">
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Conjuring Scrolls...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6" />
                    <span>Craft Magical Scrolls</span>
                    <Sparkles className="w-6 h-6" />
                  </>
                )}
              </div>
            </motion.button>
          </motion.div>

          {/* Output Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="xl:col-span-2"
          >
            {Object.keys(worksheetContent).length > 0 ? (
              <MagicalCard className="p-6 h-full" glowColor="orange">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <AnimatedAvatar type="story" size="md" />
                    <h2 className="text-xl font-semibold text-white">Enchanted Scrolls</h2>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedWorksheet}
                      onChange={(e) => setSelectedWorksheet(e.target.value)}
                      className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white"
                    >
                      {Object.keys(worksheetContent).map((grade) => (
                        <option key={grade} value={grade} className="bg-purple-900 text-white">
                          {grades.find(g => g.value === grade)?.label || `${grade} Year`}
                        </option>
                      ))}
                    </select>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Preserving...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Preserve Scroll</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  {selectedWorksheet && worksheetContent[selectedWorksheet] && (
                    <motion.div
                      key={selectedWorksheet}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="h-[600px] overflow-y-auto"
                    >
                      <div className="bg-gradient-to-br from-amber-50/10 to-orange-50/10 backdrop-blur-sm border border-amber-200/20 rounded-xl p-6">
                        <div className="bg-slate-800/90 backdrop-blur-sm text-green-400 p-6 rounded-lg border-2 border-amber-500/30 font-mono text-sm leading-relaxed shadow-2xl">
                          <pre className="whitespace-pre-wrap">
                            {worksheetContent[selectedWorksheet]}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </MagicalCard>
            ) : (
              <MagicalCard className="p-8 h-full flex items-center justify-center" glowColor="purple">
                <div className="text-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-400/30"
                  >
                    <Scroll className="w-12 h-12 text-purple-400" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-white mb-3">Awaiting Your Magic</h3>
                  <p className="text-gray-300 mb-4">Your enchanted worksheets will materialize here</p>
                  <p className="text-sm text-gray-400">Configure your spell and begin the conjuration</p>
                </div>
              </MagicalCard>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ModernWorksheetGenerator;