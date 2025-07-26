import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// import { useTranslation } from 'react-i18next';
import { 
  BookOpen, 
  FileText, 
  Users, 
  Calendar,
 
  Download,
  Eye,
  Trash2,
  Plus,
  Volume2,
  VolumeX,
  ImageIcon
} from 'lucide-react'; 
import { useAuth } from '../hooks/useAuth';
import { FirebaseService, GeneratedContent, GeneratedImage, UserData } from '../services/firebaseService';
import { Modal } from '../components/UI/Modal';
import { generatePDF } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';
import '../index.css'

const Dashboard: React.FC = () => {
  // const { t } = useTranslation();
  const { user } = useAuth();
  const [savedContent, setSavedContent] = useState<GeneratedContent[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'images' | 'students' | 'lessons'>('content');

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await FirebaseService.getUserData(user.uid);
      setUserData(data);
      setSavedContent(data.generatedContent);
      setGeneratedImages(data.images);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error loading user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContent = (content: GeneratedContent) => {
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleViewImage = (image: GeneratedImage) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await FirebaseService.deleteGeneratedContent(contentId);
      setSavedContent(prev => prev.filter(c => c.id !== contentId));
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Error deleting content');
    }
  };

  const handleDownloadPDF = (content: GeneratedContent) => {
    generatePDF(content.content, `${content.type}_${content.title.replace(/\s+/g, '_')}`, content.language);
    toast.success('PDF downloaded successfully');
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await FirebaseService.deleteGeneratedImage(imageId);
      setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error deleting image');
    }
  };

  const handlePlayAudio = async (content: GeneratedContent) => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(content.content);
      utterance.lang = content.language === 'hindi' ? 'hi-IN' : 
                      content.language === 'kannada' ? 'kn-IN' :
                      content.language === 'marathi' ? 'mr-IN' : 'en-US';
      
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
      toast.error('Error playing audio');
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'story': return BookOpen;
      case 'worksheet': return FileText;
      case 'visual-aid': return Eye;
      case 'concept-explanation': return BookOpen;
      default: return FileText;
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case 'story': return 'from-purple-500 to-pink-500';
      case 'worksheet': return 'from-blue-500 to-cyan-500';
      case 'visual-aid': return 'from-orange-500 to-red-500';
      case 'concept-explanation': return 'from-green-500 to-emerald-500';
      default: return 'from-mainsubtextColor to-slate-500';
    }
  };

  const stats = [
    {
      title: 'Stories Created',
      value: savedContent.filter(c => c.type === 'story').length,
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      title: 'Images Generated',
      value: generatedImages.length,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Students Tracked',
      value: userData?.students.length || 0,
      icon: Eye,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50'
    },
    {
      title: 'Lesson Plans',
      value: userData?.lessonPlans.length || 0,
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50'
    }
  ];

  return (
    <div  className="p-4  md:p-6 max-w-7xl mx-auto min-h-screen  dark:bg-gradient-to-br dark:from-gray-950 via-60%  dark:via-purple-950/10  dark:to-black">
    <div className="mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome back, {user?.displayName || 'Teacher'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Here's your saved content and progress</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => (
         <motion.div
  key={index}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
  className="bg-white/10 dark:bg-transparent backdrop-blur-[8px] border border-white/10 dark:border-white/10 rounded-2xl p-4 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_40px_rgba(0,0,0,0.4)] transition-all duration-300"
>
  <div className="flex items-center justify-between mb-2">
    <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
      <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
    </div>
  </div>
  <div>
    <p className="dark:text-white/80 text-zinc-800 text-xs md:text-sm font-medium">{stat.title}</p>
    <p className="text-2xl md:text-3xl font-bold dark:text-white text-zinc-800 mt-1">{stat.value}</p>
  </div>
</motion.div>

        ))}
      </div>

      {/* Saved Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/80 dark:bg-transparent backdrop-blur-[8px] border border-white/10 dark:border-white/10 rounded-2xl shadow-xl  p-4 md:p-6"
      >
        {/* Tab Navigation */}
        <div className="flex items-center bg-mainBackground justify-between mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-white/5 backdrop-blur-[8px] border border-white/10 dark:border-white/10 rounded-xl p-1">
            {[
              { key: 'content', label: 'Content', count: savedContent.length },
              { key: 'images', label: 'Images', count: generatedImages.length },
              { key: 'students', label: 'Students', count: userData?.students.length || 0 },
              { key: 'lessons', label: 'Lessons', count: userData?.lessonPlans.length || 0 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2  rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-transparent backdrop-blur-[8px] text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8  border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your data...</p>
          </div>
        ) : (
          <div>
            {/* Content Tab */}
            {activeTab === 'content' && (
              savedContent.length === 0 ? (
                <div className="text-center py-12">
                  <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-700 dark:text-gray-300 mb-2">No content saved yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start creating stories, worksheets, and more!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedContent.map((content, index) => {
                    const Icon = getContentIcon(content.type);
                    const colorClass = getContentColor(content.type);
                    
                    return (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex items-center space-x-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleViewContent(content)}
                              className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handlePlayAudio(content)}
                              className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200"
                              title="Play Audio"
                            >
                              {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownloadPDF(content)}
                              className="p-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all duration-200"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteContent(content.id)}
                              className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 text-sm">
                          {content.title}
                        </h3>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{content.type.replace('-', ' ')}</span>
                          <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                            Grade {content.grade}
                          </span>
                          <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full text-blue-600 dark:text-blue-400 capitalize">
                            {content.language}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              generatedImages.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-700 dark:text-gray-300 mb-2">No images generated yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start generating educational images!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {generatedImages.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-xl rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all duration-200"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={
                            image.imageUrl?.startsWith('http')
                              ? image.imageUrl
                              : image.imageBase64
                              ? `data:image/png;base64,${image.imageBase64}`
                              : ''
                          }
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleViewImage(image)}
                              className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteImage(image.id)}
                              className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg text-red-600 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 mb-1">
                          {image.prompt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{image.style}</span>
                          <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                        </div>
                        {(image.subject || image.grade) && (
                          <div className="flex items-center justify-between mt-2 text-xs">
                            {image.subject && (
                              <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full text-blue-600 dark:text-blue-400 capitalize">
                                {image.subject}
                              </span>
                            )}
                            {image.grade && (
                              <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                                Grade {image.grade}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}
            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="space-y-4">
                {userData?.students.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-gray-700 dark:text-gray-300 mb-2">No students added yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Go to Student Tracker to add students!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userData?.students.map((student, index) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <user className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 dark:text-gray-200">{student.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Grade {student.grade} • Roll #{student.rollNumber}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <p>Subjects: {student.subjects.length}</p>
                          <p>Added: {student.createdAt.toLocaleDateString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div className="space-y-4">
                {userData?.lessonPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-gray-700 dark:text-gray-300 mb-2">No lesson plans created yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Go to Lesson Planner to create plans!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userData?.lessonPlans.map((plan, index) => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{plan.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{plan.subject} • Grade {plan.grade}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <p>Week: {plan.week}</p>
                          <p>Objectives: {plan.objectives.length}</p>
                          <p>Activities: {plan.activities.length}</p>
                          <p>Status: <span className="capitalize">{plan.status || 'draft'}</span></p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title={selectedImage?.prompt || 'Generated Image'}
        size="lg"
      >
        {selectedImage && (
          <div className="text-center py-12">
            <img
              src={
                selectedImage.imageUrl?.startsWith('http')
                  ? selectedImage.imageUrl
                  : selectedImage.imageBase64
                  ? `data:image/png;base64,${selectedImage.imageBase64}`
                  : ''
              }
              alt={selectedImage.prompt}
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg mb-2"
            />
            <div className="text-left space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedImage.subject && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Subject:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">{selectedImage.subject}</span>
                  </div>
                )}
                {selectedImage.grade && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Grade:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Grade {selectedImage.grade}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-600">
                Generated on {selectedImage.createdAt.toLocaleDateString()} at {selectedImage.createdAt.toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Content Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedContent?.title || ''}
        size="lg"
      >
        {selectedContent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-300 capitalize">
                  {selectedContent.type.replace('-', ' ')}
                </span>
                <span className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-sm text-blue-600 dark:text-blue-400">
                  Grade {selectedContent.grade}
                </span>
                <span className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-sm text-green-600 dark:text-green-400 capitalize">
                  {selectedContent.language}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePlayAudio(selectedContent)}
                  className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200"
                >
                  {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isPlaying ? 'Stop' : 'Play'}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownloadPDF(selectedContent)}
                  className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </motion.button>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans leading-relaxed">
                {selectedContent.content}
              </pre>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Created on{" "}
              {new Date(
                selectedContent.createdAt?.toDate?.() || selectedContent.createdAt
              ).toLocaleDateString()}{" "}
              at{" "}
              {new Date(
                selectedContent.createdAt?.toDate?.() || selectedContent.createdAt
              ).toLocaleTimeString()}
            </div>
          </div>
        )}
      </Modal>
    </div>
    </div>
  );
};

export default Dashboard;