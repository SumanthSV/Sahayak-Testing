import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Edit3
} from 'lucide-react';
import { generatePDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

interface OutputCardProps {
  title: string;
  content: string;
  timestamp?: Date;
  type: 'story' | 'worksheet' | 'concept' | 'visual-aid';
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
  const [activeTab, setActiveTab] = useState<'content' | 'tips' | 'suggestions'>('content');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Content copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const handleDownloadPDF = () => {
    // Extract language from additionalData, default to 'en'
    const language = additionalData?.language || 'en';
    generatePDF(content, `${type}_${title.replace(/\s+/g, '_')}`, language);
    toast.success('PDF downloaded successfully!');
  };

  const handleDownloadImage = () => {
    // Create a canvas to render the content as image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add content
    ctx.fillStyle = '#1f2937';
    ctx.font = '16px Inter, sans-serif';
    
    const lines = content.split('\n');
    let y = 50;
    lines.forEach(line => {
      if (y < canvas.height - 50) {
        ctx.fillText(line.substring(0, 80), 50, y);
        y += 25;
      }
    });
    
    // Download as PNG
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${title.replace(/\s+/g, '_')}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Image downloaded successfully!');
      }
    });
  };

  const getCardStyle = () => {
    switch (type) {
      case 'story':
        return 'bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500';
      case 'worksheet':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500';
      case 'concept':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500';
      case 'visual-aid':
        return 'bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-l-4 border-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{timestamp.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {isEditable && onEdit && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="p-2 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200"
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
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Copy Content"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadPDF}
              className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200"
              title="Download PDF"
            >
              <FileText className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadImage}
              className="p-2 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all duration-200"
              title="Download as Image"
            >
              <ImageIcon className="w-4 h-4" />
            </motion.button>
            
            {onSave && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSave}
                disabled={isSaving}
                className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200 disabled:opacity-50"
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
                className="p-2 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all duration-200"
                title="Regenerate Content"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        {additionalData && (
          <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'content'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Content
            </button>
            {additionalData.tips && (
              <button
                onClick={() => setActiveTab('tips')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'tips'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Tips
              </button>
            )}
            {additionalData.suggestions && (
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'suggestions'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Suggestions
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className={`p-6 ${getCardStyle()}`}>
        {activeTab === 'content' && (
          <div className="prose prose-sm max-w-none">
            {/* Scrollable content container with chalkboard styling */}
            <div className="max-h-96 overflow-y-auto bg-slate-800 text-green-400 p-4 rounded-lg border-2 border-slate-600 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              <pre className="whitespace-pre-wrap">
                {content}
              </pre>
            </div>
          </div>
        )}
        
        {activeTab === 'tips' && additionalData?.tips && (
          <div className="max-h-96 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {additionalData.tips.map((tip: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-700 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'suggestions' && additionalData?.suggestions && (
          <div className="max-h-96 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {additionalData.suggestions.map((suggestion: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-700 text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};