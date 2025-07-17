import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Award,
  Volume2,
  FileText,
  BarChart3,
  Target,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { FirebaseService } from '../services/firebaseService';
import { AIService } from '../services/aiService';
import toast from 'react-hot-toast';

import type { VoiceEvaluationResult } from '../services/aiService';

const VoiceAssessment: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [assessmentText, setAssessmentText] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('3');
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [assessmentResult, setAssessmentResult] = useState<VoiceEvaluationResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    { value: 'hindi', label: 'हिंदी', code: 'hi-IN' },
    { value: 'english', label: 'English', code: 'en-IN' },
    { value: 'kannada', label: 'ಕನ್ನಡ', code: 'kn-IN' },
    { value: 'marathi', label: 'मराठी', code: 'mr-IN' },
    { value: 'tamil', label: 'தமிழ்', code: 'ta-IN' },
    { value: 'bengali', label: 'বাংলা', code: 'bn-IN' },
  ];

  const sampleTexts = {
    hindi: [
      'राम एक अच्छा लड़का है। वह रोज स्कूल जाता है और मन लगाकर पढ़ता है।',
      'सूरज पूर्व में उगता है और पश्चिम में डूबता है। यह हमारे जीवन के लिए बहुत महत्वपूर्ण है।',
      'हमें अपने माता-पिता का सम्मान करना चाहिए और उनकी बात मानकर चलना चाहिए।',
      'पेड़-पौधे हमारे लिए बहुत उपयोगी हैं। वे हमें ऑक्सीजन देते हैं और वातावरण को शुद्ध रखते हैं।'
    ],
    english: [
      'The cat sat on the mat. It was a sunny day and the birds were singing in the trees.',
      'Birds fly high in the blue sky. They build their nests on tall trees and take care of their babies.',
      'We should always help our friends when they are in trouble. Friendship is very important in life.',
      'Plants need water, sunlight, and air to grow. They give us oxygen and make our environment beautiful.'
    ],
    kannada: [
      'ನಾನು ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ। ನನಗೆ ಓದುವುದು ಮತ್ತು ಬರೆಯುವುದು ತುಂಬಾ ಇಷ್ಟ.',
      'ಸೂರ್ಯ ಪೂರ್ವದಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ ಮತ್ತು ಪಶ್ಚಿಮದಲ್ಲಿ ಅಸ್ತಮಿಸುತ್ತಾನೆ.',
      'ನಾವು ನಮ್ಮ ಪೋಷಕರನ್ನು ಗೌರವಿಸಬೇಕು ಮತ್ತು ಅವರ ಮಾತುಗಳನ್ನು ಕೇಳಬೇಕು.',
    ],
    marathi: [
      'मी शाळेत जातो। मला वाचायला आणि लिहायला खूप आवडते.',
      'सूर्य पूर्वेला उगवतो आणि पश्चिमेला मावळतो.',
      'आपण आपल्या आई-वडिलांचा आदर करायला हवा.',
    ],
    tamil: [
      'நான் பள்ளிக்குச் செல்கிறேன். எனக்கு படிப்பது மிகவும் பிடிக்கும்.',
      'சூரியன் கிழக்கில் உதிக்கிறது மற்றும் மேற்கில் மறைகிறது.',
      'நாம் நமது பெற்றோரை மதிக்க வேண்டும்.',
    ],
    bengali: [
      'আমি স্কুলে যাই। আমার পড়াশোনা করতে খুব ভালো লাগে।',
      'সূর্য পূর্ব দিকে ওঠে এবং পশ্চিম দিকে অস্ত যায়।',
      'আমাদের বাবা-মায়ের সম্মান করা উচিত।',
    ]
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const playRecording = () => {
    if (recordedAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    setRecordedAudio(null);
    setRecordedBlob(null);
    setIsPlaying(false);
    setAssessmentResult(null);
    toast.success('Recording reset');
  };

  const assessReading = async () => {
    if (!recordedBlob || !assessmentText) {
      toast.error('Please record audio and enter assessment text');
      return;
    }
    
    setIsAssessing(true);
    
    try {
      const result = await AIService.evaluateVoiceReading({
        audioBlob: recordedBlob,
        expectedText: assessmentText,
        language: selectedLanguage,
        grade: selectedGrade,
        studentName: studentName || undefined
      });
      
      setAssessmentResult(result);
      toast.success('Assessment completed!');
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to assess reading. Please try again.');
    } finally {
      setIsAssessing(false);
    }
  };

  const saveAssessment = async () => {
    if (!assessmentResult || !user) return;
    
    setIsSaving(true);
    try {
      await FirebaseService.saveGeneratedContent({
        type: 'assessment' as any,
        title: `Reading Assessment - ${studentName || 'Student'} - ${selectedLanguage} - Grade ${selectedGrade}`,
        content: JSON.stringify({
          studentName,
          text: assessmentText,
          result: assessmentResult,
          date: new Date().toISOString(),
          language: selectedLanguage,
          grade: selectedGrade
        }),
        subject: 'reading',
        grade: selectedGrade,
        language: selectedLanguage,
        teacherId: user.uid,
        metadata: { studentName, assessmentType: 'voice-reading' }
      });
      toast.success('Assessment saved successfully!');
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Error saving assessment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const playTextAudio = async () => {
    if (assessmentText) {
      try {
        const languageCode = languages.find(lang => lang.value === selectedLanguage)?.code || 'en-IN';
        
        const audioUrl = await AIService.synthesizeSpeech({
          text: assessmentText,
          languageCode
        });
        
        const audio = new Audio(audioUrl);
        audio.play();
      } catch (error) {
        console.error('Error playing text audio:', error);
        toast.error('Failed to play audio');
      }
    }
  };

  const currentSampleTexts = sampleTexts[selectedLanguage as keyof typeof sampleTexts] || sampleTexts.english;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center"
          >
            <Mic className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              AI Voice Assessment
            </h1>
            <p className="text-gray-600 text-sm md:text-base">Assess students' reading skills with AI-powered voice analysis</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Configuration Section - Mobile First */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-4 md:p-6"
        >
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 text-red-600 mr-2" />
            Assessment Setup
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name (Optional)
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student name..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  {grades.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Reading Text
                </label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={playTextAudio}
                  className="p-1 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200"
                  title="Play Text Audio"
                >
                  <Volume2 className="w-4 h-4" />
                </motion.button>
              </div>
              <textarea
                value={assessmentText}
                onChange={(e) => setAssessmentText(e.target.value)}
                placeholder="Enter the text for students to read..."
                className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-white/50 backdrop-blur-sm text-sm"
              />
            </div>

            <details className="border border-gray-200 rounded-xl">
              <summary className="p-3 cursor-pointer hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-700">
                Sample texts for {selectedLanguage} ({currentSampleTexts.length})
              </summary>
              <div className="p-3 pt-0 space-y-2 max-h-32 overflow-y-auto">
                {currentSampleTexts.map((text, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.01, x: 5 }}
                    onClick={() => setAssessmentText(text)}
                    className="text-left text-xs text-red-600 hover:text-red-700 hover:underline block w-full p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                  >
                    {text}
                  </motion.button>
                ))}
              </div>
            </details>
          </div>
        </motion.div>

        {/* Recording Controls - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-4 md:p-6"
        >
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Mic className="w-5 h-5 text-red-600 mr-2" />
            Voice Recording
          </h2>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!assessmentText.trim()}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </motion.button>

            {recordedAudio && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={playRecording}
                  className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-200"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetRecording}
                  className="w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center transition-all duration-200"
                >
                  <RotateCcw className="w-6 h-6" />
                </motion.button>
              </>
            )}
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              {isRecording ? 'Recording... Click the red button to stop' : 
               recordedAudio ? 'Recording complete! Click play to listen' : 
               'Click the green button to start recording'}
            </p>
          </div>

          {recordedAudio && (
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={recordedAudio}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={assessReading}
                disabled={isAssessing}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isAssessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    <span>Assess Reading</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Results Section - Mobile Optimized */}
        {assessmentResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                <BarChart3 className="w-5 h-5 text-red-600 mr-2" />
                Assessment Results
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveAssessment}
                disabled={isSaving}
                className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200"
                title="Save Assessment"
              >
                <Save className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-blue-50 p-3 rounded-xl border border-blue-200/50"
                >
                  <p className="text-sm text-blue-600 font-medium">Accuracy</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-700">{assessmentResult.accuracy}%</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-green-50 p-3 rounded-xl border border-green-200/50"
                >
                  <p className="text-sm text-green-600 font-medium">Fluency</p>
                  <p className="text-xl md:text-2xl font-bold text-green-700">{assessmentResult.fluency}%</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-purple-50 p-3 rounded-xl border border-purple-200/50"
                >
                  <p className="text-sm text-purple-600 font-medium">Pronunciation</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-700">{assessmentResult.pronunciation}%</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-orange-50 p-3 rounded-xl border border-orange-200/50"
                >
                  <p className="text-sm text-orange-600 font-medium">Overall Score</p>
                  <p className="text-xl md:text-2xl font-bold text-orange-700">{assessmentResult.overallScore}%</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border-l-4 border-red-500"
              >
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Award className="w-4 h-4 text-red-600 mr-2" />
                  Feedback & Recommendations
                </h3>
                <p className="text-gray-700 leading-relaxed mb-2 text-sm">{assessmentResult.feedback}</p>
                <p className="text-gray-600 text-xs">{assessmentResult.detailedAnalysis}</p>
                
                {assessmentResult.transcript && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                    <h4 className="text-xs font-medium text-red-800 mb-1">Recognized Text:</h4>
                    <p className="text-xs text-gray-700 italic">"{assessmentResult.transcript}"</p>
                  </div>
                )}
              </motion.div>

              {assessmentResult.strengths && assessmentResult.strengths.length > 0 && (
                <details className="bg-green-50 rounded-xl border border-green-200/50 overflow-hidden">
                  <summary className="p-3 cursor-pointer hover:bg-green-100 transition-all duration-200 flex items-center justify-between">
                    <h4 className="font-medium text-green-800 text-sm flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Strengths ({assessmentResult.strengths.length})
                    </h4>
                    <ChevronDown className="w-4 h-4 text-green-600" />
                  </summary>
                  <div className="p-3 pt-0">
                    <ul className="text-xs text-green-700 space-y-1">
                      {assessmentResult.strengths.map((strength, index) => (
                        <li key={index}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}

              {assessmentResult.improvementAreas && assessmentResult.improvementAreas.length > 0 && (
                <details className="bg-yellow-50 rounded-xl border border-yellow-200/50 overflow-hidden">
                  <summary className="p-3 cursor-pointer hover:bg-yellow-100 transition-all duration-200 flex items-center justify-between">
                    <h4 className="font-medium text-yellow-800 text-sm flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Areas for Improvement ({assessmentResult.improvementAreas.length})
                    </h4>
                    <ChevronDown className="w-4 h-4 text-yellow-600" />
                  </summary>
                  <div className="p-3 pt-0">
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {assessmentResult.improvementAreas.map((area, index) => (
                        <li key={index}>• {area}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/50">
                <h4 className="font-medium text-gray-800 mb-2 text-sm">Next Steps:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Practice reading aloud for 10 minutes daily</li>
                  <li>• Focus on difficult words and their pronunciation</li>
                  <li>• Record yourself reading and listen back</li>
                  <li>• Ask for help with unfamiliar words</li>
                  <li>• Read with expression and proper intonation</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssessment;