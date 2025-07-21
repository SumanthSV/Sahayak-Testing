"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Trophy, RotateCcw, Gamepad2, CheckCircle, XCircle } from "lucide-react"
import toast from "react-hot-toast"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface GameData {
  title: string
  instructions: string
  questions: Question[]
  timeLimit: number
  totalQuestions: number
}

interface GamePlayProps {
  gameData: GameData
  onGameComplete: () => void
  onBackToGames: () => void
}

interface UserAnswer {
  questionId: number
  selectedAnswer: number | null
  isCorrect: boolean
  timeSpent: number
}

export default function GamePlay({ gameData, onGameComplete, onBackToGames }: GamePlayProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(gameData.timeLimit)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [showResult, setShowResult] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (!gameCompleted && timeLeft > 0 && selectedAnswer === null) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (!gameCompleted && timeLeft === 0 && selectedAnswer === null) {
      handleTimeUp()
    }
    return () => clearTimeout(timer)
  }, [timeLeft, selectedAnswer, gameCompleted])

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || gameCompleted) return

    setSelectedAnswer(answerIndex)
    const currentQ = gameData.questions[currentQuestion]
    const isCorrect = answerIndex === currentQ.correctAnswer
    const timeSpent = gameData.timeLimit - timeLeft

    const userAnswer: UserAnswer = {
      questionId: currentQ.id,
      selectedAnswer: answerIndex,
      isCorrect,
      timeSpent,
    }

    setUserAnswers((prev) => [...prev, userAnswer])

    if (isCorrect) {
      toast.success("Correct! 🎉")
    } else {
      toast.error("Incorrect! 💪")
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion < gameData.totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setTimeLeft(gameData.timeLimit)
      } else {
        endGame()
      }
    }, 1500)
  }

  const handleTimeUp = () => {
    if (selectedAnswer !== null || gameCompleted) return

    toast.error("Time up! ⏰")
    const currentQ = gameData.questions[currentQuestion]

    const userAnswer: UserAnswer = {
      questionId: currentQ.id,
      selectedAnswer: null,
      isCorrect: false,
      timeSpent: gameData.timeLimit,
    }

    setUserAnswers((prev) => [...prev, userAnswer])

    setTimeout(() => {
      if (currentQuestion < gameData.totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setTimeLeft(gameData.timeLimit)
      } else {
        endGame()
      }
    }, 1000)
  }

  const endGame = () => {
    setGameCompleted(true)
    setShowResult(true)
  }

  const getScore = () => {
    return userAnswers.filter((answer) => answer.isCorrect).length
  }

  const getScorePercentage = () => {
    return Math.round((getScore() / gameData.totalQuestions) * 100)
  }

  const getScoreMessage = () => {
    const percentage = getScorePercentage()
    if (percentage >= 90) return "Excellent! 🌟"
    if (percentage >= 70) return "Great job! 👏"
    if (percentage >= 50) return "Good effort! 💪"
    return "Keep practicing! 📚"
  }

  const handlePlayAgain = () => {
    setCurrentQuestion(0)
    setTimeLeft(gameData.timeLimit)
    setSelectedAnswer(null)
    setUserAnswers([])
    setShowResult(false)
    setGameCompleted(false)
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
                <p className="text-2xl font-bold text-blue-600">{getScore()}</p>
                <p className="text-sm text-blue-800">Correct Answers</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-600">{getScorePercentage()}%</p>
                <p className="text-sm text-green-800">Accuracy</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-purple-600">{gameData.totalQuestions}</p>
                <p className="text-sm text-purple-800">Total Questions</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayAgain}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Play Again</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackToGames}
                className="bg-gradient-to-r from-gray-500 to-slate-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-slate-600 transition-all duration-200 flex items-center space-x-2"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>New Game</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentQ = gameData.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
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
                  Question {currentQuestion + 1} / {gameData.totalQuestions}
                </span>
              </div>
              <div className="bg-green-100 rounded-xl p-3">
                <span className="text-green-600 font-bold">Score: {getScore()}</span>
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
              style={{ width: `${((currentQuestion + 1) / gameData.totalQuestions) * 100}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">{currentQ.question}</h3>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {currentQ.options.map((option: string, index: number) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                  whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? selectedAnswer === currentQ.correctAnswer
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                  } disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        selectedAnswer === index
                          ? selectedAnswer === currentQ.correctAnswer
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {selectedAnswer === index ? (
                        selectedAnswer === currentQ.correctAnswer ? (
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
            {selectedAnswer !== null && currentQ.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
              >
                <p className="text-blue-800 font-medium">{currentQ.explanation}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
