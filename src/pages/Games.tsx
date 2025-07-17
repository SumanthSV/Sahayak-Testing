import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Gamepad2, 
  Calculator, 
  Puzzle, 
  Type, 
  Play, 
  RotateCcw, 
  Trophy,
  Clock,
  Star,
  Target,
  Sparkles,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AIService } from '../services/aiService';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

interface GameData {
  title: string;
  instructions: string;
  questions?: any[];
  puzzles?: any[];
  rounds?: any[];
  timeLimit?: number;
  totalQuestions?: number;
  totalPuzzles?: number;
  totalRounds?: number;
}

const Games: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [selectedGame, setSelectedGame] = useState<'math' | 'puzzle' | 'word' | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameConfig, setGameConfig] = useState({
    subject: 'math',
    grade: '3',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });

  const gameTypes = [
    {
      id: 'math',
      title: 'Math Challenge',
      description: 'Solve math problems and improve your calculation skills',
      icon: Calculator,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      id: 'puzzle',
      title: 'Brain Puzzles',
      description: 'Challenge your mind with word puzzles and riddles',
      icon: Puzzle,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      id: 'word',
      title: 'Word Master',
      description: 'Choose the correct words and build your vocabulary',
      icon: Type,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50'
    }
  ];

  const subjects = [
    { value: 'math', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'social', label: 'Social Studies' },
    { value: 'evs', label: 'Environmental Studies' },
  ];

  const grades = [
    { value: '1', label: 'Grade 1' },
    { value: '2', label: 'Grade 2' },
    { value: '3', label: 'Grade 3' },
    { value: '4', label: 'Grade 4' },
    { value: '5', label: 'Grade 5' },
    { value: '6', label: 'Grade 6' },
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
  ];

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft]);

  const generateGame = async (gameType: 'math' | 'puzzle' | 'word') => {
    setIsGenerating(true);
    try {
      const result = await AIService.generateEducationalGame({
        gameType,
        subject: gameConfig.subject,
        grade: gameConfig.grade,
        language: currentLanguage,
        difficulty: gameConfig.difficulty
      });
      
      setGameData(result);
      setSelectedGame(gameType);
      toast.success('Game generated successfully!');
    } catch (error) {
      console.error('Error generating game:', error);
      toast.error('Failed to generate game. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startGame = () => {
    if (!gameData) return;
    
    setIsPlaying(true);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    
    // Set time limit based on game type
    const timeLimit = gameData.timeLimit || 30;
    setTimeLeft(timeLimit);
  };

  const handleAnswer = (answerIndex: number) => {
    if (!gameData || !isPlaying) return;
    
    setSelectedAnswer(answerIndex);
    
    // Check if answer is correct
    const currentData = gameData.questions?.[currentQuestion] || 
                       gameData.puzzles?.[currentQuestion] || 
                       gameData.rounds?.[currentQuestion];
    
    if (currentData && currentData.correctAnswer === answerIndex) {
      setScore(score + 1);
      toast.success('Correct! 🎉');
    } else {
      toast.error('Try again! 💪');
    }
    
    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestion < (gameData.totalQuestions || gameData.totalPuzzles || gameData.totalRounds || 10) - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(gameData.timeLimit || 30);
      } else {
        endGame();
      }
    }, 1500);
  };

  const handleTimeUp = () => {
    toast.error('Time up! ⏰');
    if (currentQuestion < (gameData?.totalQuestions || gameData?.totalPuzzles || gameData?.totalRounds || 10) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(gameData?.timeLimit || 30);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    setShowResult(true);
  };

  const resetGame = () => {
    setSelectedGame(null);
    setGameData(null);
    setIsPlaying(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const getCurrentGameData = () => {
    if (!gameData) return null;
    return gameData.questions?.[currentQuestion] || 
           gameData.puzzles?.[currentQuestion] || 
           gameData.rounds?.[currentQuestion];
  };

  const getTotalQuestions = () => {
    return gameData?.totalQuestions || gameData?.totalPuzzles || gameData?.totalRounds || 10;
  };

  const getScorePercentage = () => {
    return Math.round((score / getTotalQuestions()) * 100);
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return "Excellent! 🌟";
    if (percentage >= 70) return "Great job! 👏";
    if (percentage >= 50) return "Good effort! 💪";
    return "Keep practicing! 📚";
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
            className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center"
          >
            <Gamepad2 className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Educational Games
            </h1>
            <p className="text-gray-600">Learn through fun, AI-generated games and challenges</p>
          </div>
        </div>
      </motion.div>

      {!selectedGame ? (
        <>
          {/* Game Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Target className="w-5 h-5 text-indigo-600 mr-2" />
              Game Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={gameConfig.subject}
                  onChange={(e) => setGameConfig(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  {subjects.map((subject) => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  value={gameConfig.grade}
                  onChange={(e) => setGameConfig(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
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
                  Difficulty
                </label>
                <select
                  value={gameConfig.difficulty}
                  onChange={(e) => setGameConfig(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Game Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gameTypes.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`bg-gradient-to-br ${game.bgColor} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 cursor-pointer`}
                onClick={() => generateGame(game.id as any)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${game.color} rounded-xl flex items-center justify-center`}>
                    <game.icon className="w-6 h-6 text-white" />
                  </div>
                  {isGenerating ? (
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Play className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{game.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{game.description}</p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isGenerating}
                  className={`w-full bg-gradient-to-r ${game.color} text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate & Play</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <AnimatePresence mode="wait">
          {showResult ? (
            // Game Results
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Game Complete!</h2>
              <p className="text-xl text-gray-600 mb-6">{getScoreMessage()}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-blue-600">{score}</p>
                  <p className="text-sm text-blue-800">Correct Answers</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-green-600">{getScorePercentage()}%</p>
                  <p className="text-sm text-green-800">Accuracy</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-purple-600">{getTotalQuestions()}</p>
                  <p className="text-sm text-purple-800">Total Questions</p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Play Again</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="bg-gradient-to-r from-gray-500 to-slate-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-slate-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>New Game</span>
                </motion.button>
              </div>
            </motion.div>
          ) : !isPlaying ? (
            // Game Ready Screen
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{gameData?.title}</h2>
                <p className="text-gray-600">{gameData?.instructions}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-blue-800">{gameData?.timeLimit || 30}s</p>
                  <p className="text-sm text-blue-600">Per Question</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800">{getTotalQuestions()}</p>
                  <p className="text-sm text-green-600">Total Questions</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold text-purple-800">{gameConfig.difficulty}</p>
                  <p className="text-sm text-purple-600">Difficulty</p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-4 px-8 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <Play className="w-6 h-6" />
                  <span>Start Game</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="bg-gradient-to-r from-gray-500 to-slate-500 text-white font-semibold py-4 px-8 rounded-xl hover:from-gray-600 hover:to-slate-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Back to Games</span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            // Game Playing Screen
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-8"
            >
              {/* Game Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 rounded-xl p-3">
                    <span className="text-indigo-600 font-bold">
                      Question {currentQuestion + 1} / {getTotalQuestions()}
                    </span>
                  </div>
                  <div className="bg-green-100 rounded-xl p-3">
                    <span className="text-green-600 font-bold">Score: {score}</span>
                  </div>
                </div>
                <div className="bg-red-100 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-bold">{timeLeft}s</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / getTotalQuestions()) * 100}%` }}
                ></div>
              </div>

              {/* Question */}
              {getCurrentGameData() && (
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {getCurrentGameData().question || getCurrentGameData().sentence}
                  </h3>
                  
                  {/* Answer Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {getCurrentGameData().options?.map((option: string, index: number) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedAnswer === index
                            ? selectedAnswer === getCurrentGameData().correctAnswer
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                        } disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            selectedAnswer === index
                              ? selectedAnswer === getCurrentGameData().correctAnswer
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {selectedAnswer === index ? (
                              selectedAnswer === getCurrentGameData().correctAnswer ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <XCircle className="w-5 h-5" />
                              )
                            ) : (
                              String.fromCharCode(65 + index)
                            )}
                          </div>
                          <span className="text-left font-medium">{option}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Explanation */}
                  {selectedAnswer !== null && getCurrentGameData().explanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
                    >
                      <p className="text-blue-800 font-medium">
                        {getCurrentGameData().explanation}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Games;