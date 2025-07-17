import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Image, 
  Sparkles, 
  Download, 
  Copy, 
  Save, 
  Eye,
  Palette,
  Layers,
  Zap,
  Plus,
  Grid,
  List
} from 'lucide-react';
import { AIService } from '../services/aiService';
import { FirebaseService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { generatePDF } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

const VisualAids: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('science');
  const [grade, setGrade] = useState('3');
  const [language, setLanguage] = useState(currentLanguage);
  const [includeImage, setIncludeImage] = useState(true);
  const [generatedAid, setGeneratedAid] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState<'educational' | 'cartoon' | 'realistic' | 'diagram'>('educational');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16' | '16:9' | '4:3' | '3:4' | '3:2'>('1:1');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const languages = [
    { value: 'hi', label: 'हिंदी' },
    { value: 'en', label: 'English' },
    { value: 'kn', label: 'ಕನ್ನಡ' },
    { value: 'mr', label: 'मराठी' },
    { value: 'ta', label: 'தமிழ்' },
    { value: 'bn', label: 'বাংলা' },
  ];

  const sampleTopics = [
    'Water Cycle',
    'Solar System',
    'Photosynthesis',
    'Human Digestive System',
    'Fractions and Decimals',
    'Indian Freedom Struggle',
    'Weather and Climate',
    'Plant Life Cycle',
    'States of Matter',
    'Food Chain and Food Web'
  ];

  const imageStyles = [
    { value: 'educational', label: 'Educational', description: 'Clean, informative style for learning' },
    { value: 'cartoon', label: 'Cartoon', description: 'Fun, child-friendly illustrations' },
    { value: 'realistic', label: 'Realistic', description: 'Photorealistic images' },
    { value: 'diagram', label: 'Diagram', description: 'Technical diagrams and charts' }
  ];

  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)', description: 'Perfect for social media' },
    { value: '16:9', label: 'Landscape (16:9)', description: 'Great for presentations' },
    { value: '9:16', label: 'Portrait (9:16)', description: 'Mobile-friendly format' },
    { value: '4:3', label: 'Standard (4:3)', description: 'Classic presentation format' },
    { value: '3:4', label: 'Portrait (3:4)', description: 'Tall format for posters' },
    { value: '3:2', label: 'Photo (3:2)', description: 'Standard photo format' }
  ];

  useEffect(() => {
    loadGeneratedImages();
  }, [user]);

  const loadGeneratedImages = async () => {
    if (!user) return;
    
    try {
      const images = await FirebaseService.getGeneratedImages(user.uid);
      setGeneratedImages(images);
    } catch (error) {
      console.error('Error loading generated images:', error);
    }
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
        includeImage
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

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Please enter an image prompt');
      return;
    }
    
    setIsGeneratingImage(true);
    try {
      const result = await AIService.generateEducationalImage({
        prompt: imagePrompt,
        aspectRatio,
        style: imageStyle,
        language,
        subject,
        grade
      });
      
      // Save the generated image
      await FirebaseService.saveGeneratedImage({
        prompt: imagePrompt,
        imageBase64: result.imageBase64,
        style: imageStyle,
        aspectRatio,
        subject,
        grade,
        teacherId: user!.uid,
        tags: [subject, grade, imageStyle]
      });
      
      // Reload images
      await loadGeneratedImages();
      
      // Reset form
      setImagePrompt('');
      setShowImageGenerator(false);
      
      toast.success('Image generated and saved successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
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
        metadata: { topic, includeImage }
      });
      toast.success('Visual aid saved successfully!');
    } catch (error) {
      console.error('Error saving visual aid:', error);
      toast.error('Error saving visual aid. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (generatedAid) {
      navigator.clipboard.writeText(generatedAid.instructions);
      toast.success('Instructions copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    if (generatedAid) {
      const content = `
Visual Aid: ${topic}
Subject: ${subject} | Grade: ${grade} | Language: ${language}

${generatedAid.instructions}

Materials Needed:
${generatedAid.materials?.join('\n') || 'Not specified'}

Time Estimate: ${generatedAid.timeEstimate || 'Not specified'}
Difficulty: ${generatedAid.difficulty || 'Not specified'}
      `;
      generatePDF(content, `Visual_Aid_${topic.replace(/\s+/g, '_')}`);
      toast.success('PDF downloaded successfully!');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await FirebaseService.deleteGeneratedImage(imageId);
      await loadGeneratedImages();
      toast.success('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error deleting image');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center"
            >
              <Image className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Visual Aid & Image Generator
              </h1>
              <p className="text-gray-600">Create engaging visual aids and AI-generated educational images</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowImageGenerator(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Generate Image</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="space-y-8">
        {/* Generated Images Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Image className="w-5 h-5 text-orange-600 mr-2" />
              Generated Images ({generatedImages.length})
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {generatedImages.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-2">No images generated yet</p>
              <p className="text-sm text-gray-500">Click "Generate Image" to create your first educational image!</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
              {generatedImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200 ${
                    viewMode === 'list' ? 'flex items-center space-x-4 p-4' : ''
                  }`}
                >
                  <div className={viewMode === 'grid' ? 'aspect-square relative' : 'w-20 h-20 flex-shrink-0'}>
                    <img
                      src={`data:image/png;base64,${image.imageBase64}`}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                    {viewMode === 'grid' && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteImage(image.id)}
                          className="p-2 bg-white/90 rounded-lg text-red-600 hover:bg-white transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                  <div className={viewMode === 'grid' ? 'p-3' : 'flex-1'}>
                    <p className={`font-medium text-gray-800 mb-1 ${viewMode === 'grid' ? 'text-sm line-clamp-2' : 'text-base'}`}>
                      {image.prompt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="capitalize">{image.style}</span>
                      <span>{image.aspectRatio}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      {image.subject && (
                        <span className="bg-blue-100 px-2 py-1 rounded-full text-blue-600 capitalize">
                          {image.subject}
                        </span>
                      )}
                      {image.grade && (
                        <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                          Grade {image.grade}
                        </span>
                      )}
                      {viewMode === 'list' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteImage(image.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Visual Aid Generator */}
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
              <Palette className="w-5 h-5 text-orange-600 mr-2" />
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
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
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
                  Grade Level
                </label>
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
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic/Concept
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter the topic you want to create a visual aid for..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeImage}
                  onChange={(e) => setIncludeImage(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Generate AI image along with instructions
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                AI-generated images help visualize the concept before drawing on blackboard
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Popular topics:</p>
              <div className="grid grid-cols-2 gap-2">
                {sampleTopics.map((sampleTopic, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTopic(sampleTopic)}
                    className="text-left text-sm text-orange-600 hover:text-orange-700 hover:underline p-2 rounded-lg hover:bg-orange-50 transition-all duration-200"
                  >
                    {sampleTopic}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Visual Aid...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Visual Aid</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200/50">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Teaching Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Use simple, clear diagrams that students can easily see from the back
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Include interactive elements to engage students in the drawing process
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Use colors strategically to highlight important concepts and relationships
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Practice drawing the aid before class to ensure smooth execution
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Involve students in completing parts of the diagram for better engagement
              </li>
            </ul>
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
                <Layers className="w-5 h-5 text-orange-600 mr-2" />
                Generated Visual Aid
              </h2>
              {generatedAid && (
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200"
                    title="Save Visual Aid"
                  >
                    <Save className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </div>

            {generatedAid ? (
              <div className="space-y-6">
                {/* AI Generated Image */}
                {generatedAid.imageUrl && generatedAid.imageUrl !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200/50"
                  >
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Zap className="w-4 h-4 text-orange-600 mr-2" />
                      AI-Generated Reference Image
                    </h3>
                    <div className="w-full max-w-md mx-auto">
                      <img
                        src={`data:image/svg+xml;base64,${generatedAid.imageUrl}`}
                        alt={`Visual aid for ${topic}`}
                        className="w-full rounded-lg shadow-md"
                        onError={(e) => {
                          console.log('Image load error, hiding image section');
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      Use this as a reference while drawing on the blackboard
                    </p>
                  </motion.div>
                )}

                {/* Instructions */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-l-4 border-orange-500">
                  <h3 className="font-semibold text-gray-800 mb-3">Step-by-Step Instructions</h3>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">
                      {generatedAid.instructions}
                    </pre>
                  </div>
                </div>

                {/* Materials and Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedAid.materials && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200/50">
                      <h4 className="font-medium text-blue-800 mb-2">Materials Needed</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {generatedAid.materials.map((material: string, index: number) => (
                          <li key={index}>• {material}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {generatedAid.timeEstimate && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200/50">
                      <h4 className="font-medium text-green-800 mb-2">Time Estimate</h4>
                      <p className="text-sm text-green-700">{generatedAid.timeEstimate}</p>
                    </div>
                  )}
                  
                  {generatedAid.difficulty && (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200/50">
                      <h4 className="font-medium text-purple-800 mb-2">Difficulty Level</h4>
                      <p className="text-sm text-purple-700">{generatedAid.difficulty}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Instructions</span>
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
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Your visual aid guide will appear here</p>
                  <p className="text-sm mt-2">Enter a topic and click generate to get started</p>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Image Generator Modal */}
      {showImageGenerator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                Generate Educational Image
              </h2>
              <button
                onClick={() => setShowImageGenerator(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Description/Prompt
                </label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the educational image you want to generate..."
                  className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject (Optional)
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Grade (Optional)
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {grades.map((gr) => (
                      <option key={gr.value} value={gr.value}>
                        {gr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Image Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {imageStyles.map((style) => (
                    <motion.button
                      key={style.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setImageStyle(style.value as any)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        imageStyle === style.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-medium text-sm">{style.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{style.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {aspectRatios.map((ratio) => (
                    <motion.button
                      key={ratio.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAspectRatio(ratio.value as any)}
                      className={`p-2 rounded-lg border transition-all duration-200 text-center ${
                        aspectRatio === ratio.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-xs">{ratio.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImageGenerator(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateImage}
                  disabled={!imagePrompt.trim() || isGeneratingImage}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
                >
                  {isGeneratingImage ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Image</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

export default VisualAids;