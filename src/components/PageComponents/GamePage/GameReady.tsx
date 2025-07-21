"use client"

import { motion } from "framer-motion"
import { Clock, Target, Star, Play, RotateCcw } from "lucide-react"

interface GameData {
  title: string
  instructions: string
  questions: any[]
  timeLimit: number
  totalQuestions: number
}

interface GameConfig {
//   subject: string
  grade: string
  difficulty: "easy" | "medium" | "hard"
}

interface GameReadyProps {
  gameData: GameData
  gameConfig: GameConfig
  onStartGame: () => void
  onBackToGames: () => void
}

export default function GameReady({ gameData, gameConfig, onStartGame, onBackToGames }: GameReadyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{gameData.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{gameData.instructions}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center">
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="font-semibold text-blue-800 dark:text-blue-300">{gameData.timeLimit}s</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Per Question</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center">
              <Target className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="font-semibold text-green-800 dark:text-green-300">{gameData.totalQuestions}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Total Questions</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 text-center">
              <Star className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="font-semibold text-purple-800 dark:text-purple-300">{gameConfig.difficulty}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">Difficulty</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartGame}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-4 px-8 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Play className="w-6 h-6" />
              <span>Start Game</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBackToGames}
              className="bg-gradient-to-r from-gray-500 to-slate-500 text-white font-semibold py-4 px-8 rounded-xl hover:from-gray-600 hover:to-slate-600 transition-all duration-200 flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Back to Games</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
