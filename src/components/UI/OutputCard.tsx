import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Copy, 
  Save, 
  RefreshCw, 
  Clock,
  FileText,
  Image as ImageIcon,
  Check,
  Eye,
  Edit3,
  Lightbulb,
  MessageSquare,
  Camera
} from 'lucide-react';
import { generatePDF } from '../../utils/pdfGenerator';
import html2canvas from 'html2canvas';
import { AnimatedAvatar } from './AnimatedAvatar';
import toast from 'react-hot-toast';

interface OutputCardProps {
  title: string;
  content?: string;
  suggestions?: string;
  tips?: string;
  imageUrl?: string;
  timestamp?: Date;
  type: 'story' | 'worksheet' | 'concept' | 'visual-aid' | 'assessment';
  onSave?: () => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
  isSaving?: boolean;
  isEditable?: boolean;
  additionalData?: any;
  className?: string;
}

export const OutputCard: React.FC<OutputCardProps> = ({
  title,
  content,
  suggestions,
  tips,
  imageUrl,
  timestamp = new Date(),
  type,
  onSave,
  onRegenerate,
  onEdit,
  isSaving = false,
  isEditable = false,
  additionalData,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'suggestions' | 'tips' | 'image'>('content');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Determine available tabs
  const availableTabs = [
    { key: 'content', label: 'Content', icon: FileText, available: !!content },
    { key: 'suggestions', label: 'Suggestions', icon: Lightbulb, available: !!suggestions },
    { key: 'tips', label: 'Tips', icon: MessageSquare, available: !!tips },
    { key: 'image', label: 'Image', icon: ImageIcon, available: !!imageUrl }
  ].filter(tab => tab.available);

  // Set initial active tab to first available
  React.useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.key === activeTab)) {
      setActiveTab(availableTabs[0].key as any);
    }
  }, [availableTabs, activeTab]);

  const handleCopy = async () => {
    try {
      const textToCopy = getActiveContent();
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Content copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'suggestions': return suggestions || '';
      case 'tips': return tips || '';
      case 'image': return imageUrl || '';
      default: return content || '';
    }
  };

  const handleDownloadPDF = () => {
    // Combine all available content for PDF
    let pdfContent = '';
    if (content) pdfContent += `CONTENT:\n${content}\n\n`;
    if (suggestions) pdfContent += `SUGGESTIONS:\n${suggestions}\n\n`;
    if (tips) pdfContent += `TIPS:\n${tips}\n\n`;
    if (imageUrl) pdfContent += `IMAGE URL:\n${imageUrl}\n\n`;

    const language = additionalData?.language || 'en';
    generatePDF(pdfContent, `${type}_${title.replace(/\s+/g, '_')}`, language);
    toast.success('PDF downloaded successfully!');
  };

  const handleDownloadCardAsImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = `${type}_${title.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Card image downloaded successfully!');
    } catch (error) {
      console.error('Error capturing card:', error);
      toast.error('Failed to download card image');
    }
  };

  const handleDownloadImageOnly = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.download = `${type}_image_${Date.now()}.png`;
    link.href = imageUrl;
    link.target = '_blank';
    link.click();
    
    toast.success('Image downloaded successfully!');
  };

  const getCardStyle = () => {
    switch (type) {
      case 'story':
        return 'border-l-4 border-purple-500 dark:border-purple-400';
      case 'worksheet':
        return 'border-l-4 border-blue-500 dark:border-blue-400';
      case 'concept':
        return 'border-l-4 border-green-500 dark:border-green-400';
      case 'visual-aid':
        return 'border-l-4 border-orange-500 dark:border-orange-400';
      case 'assessment':
        return 'border-l-4 border-red-500 dark:border-red-400';
      default:
        return 'border-l-4 border-gray-500 dark:border-gray-400';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden ${getCardStyle()} ${className}`}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <AnimatedAvatar type={type} size="md" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">{title}</h3>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{timestamp.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isEditable && onEdit && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200"
                title="Edit Content"
              >
                <Edit3 className="w-4 h-4" />
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className={`p-2 rounded-xl transition-all duration-200 ${
                copied 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Copy Content"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadPDF}
              className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200"
              title="Download PDF"
            >
              <FileText className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadCardAsImage}
              className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200"
              title="Download Card as Image"
            >
              <Camera className="w-4 h-4" />
            </motion.button>

            {imageUrl && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadImageOnly}
                className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all duration-200"
                title="Download Image Only"
              >
                <ImageIcon className="w-4 h-4" />
              </motion.button>
            )}
            
            {onSave && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSave}
                disabled={isSaving}
                className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 disabled:opacity-50"
                title="Save Content"
              >
                <Save className="w-4 h-4" />
              </motion.button>
            )}
            
            {onRegenerate && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRegenerate}
                className="p-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all duration-200"
                title="Regenerate Content"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        {availableTabs.length > 1 && (
          <div className="flex space-x-1 mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto">
            {availableTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
          >
            {activeTab === 'content' && content && (
              <div className="bg-slate-800 dark:bg-gray-900 text-green-400 dark:text-green-300 p-4 rounded-lg border-2 border-slate-600 dark:border-gray-600 font-mono text-sm leading-relaxed">
                <pre className="whitespace-pre-wrap">
                  {content}
                </pre>
              </div>
            )}
            
            {activeTab === 'suggestions' && suggestions && (
              <div className="space-y-3">
                {suggestions.split('\n').filter(line => line.trim()).map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'tips' && tips && (
              <div className="space-y-3">
                {tips.split('\n').filter(line => line.trim()).map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-500 dark:bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'image' && imageUrl && (
              <div className="text-center">
                <img
                  src={imageUrl}
                  alt={title}
                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    toast.error('Failed to load image');
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Click the image download button above to save this image
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};