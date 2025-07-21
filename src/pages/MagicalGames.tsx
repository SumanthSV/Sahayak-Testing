"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Gamepad2, Calculator, Puzzle, Type, Target, Sparkles, Wand2, Crown, Shield, Scroll } from "lucide-react"
import toast from "react-hot-toast"
import GameReady from "../components/PageComponents/GamesPage/GameReady"
import GamePlay from "../components/PageComponents/GamesPage/GamePlay"
import { AIService } from "../services/aiService"
import { MagicalCard } from "../components/UI/MagicalCard"
import { AnimatedAvatar } from "../components/UI/AnimatedAvatar"

interface GameConfig {
  grade: string
  difficulty: "easy" | "medium" | "hard"
}

enum gameType {Math = "math" , Puzzle = "puzzle", Word = "word"}

interface GameData {
  title: string
  instructions: string
  questions: any[]
  timeLimit: number
  totalQuestions: number
}

export default function MagicalGames() {
  const [selectedGame, setSelectedGame] = useState<"math" | "puzzle" | "word" | null>(null)
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [isGenerating, setIsGenerating] = useState({
    Math : false,
    Puzzle : false,
    Word : false
  })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    grade: "3",
    difficulty: "medium",
  })

  const grades = [
    { value: "1", label: "First Year" },
    { value: "2", label: "Second Year" },
    { value: "3", label: "Third Year" },
    { value: "4", label: "Fourth Year" },
    { value: "5", label: "Fifth Year" },
    { value: "6", label: "Sixth Year" },
    { value: "7", label: "Seventh Year" },
    { value: "8", label: "Eighth Year" },
  ]

  const generateGame = async (gameType: "math" | "puzzle" | "word") => {
    setIsGenerating(prev => ({ ...prev, [gameType.charAt(0).toUpperCase() + gameType.slice(1)]: true }))
    try {
      const result = await AIService.generateEducationalGame({
        gameType : gameType,
        grade: gameConfig.grade,
        difficulty: gameConfig.difficulty,
      });

      console.log(result)
      setGameData(result)
      setSelectedGame(gameType)
      toast.success("Magical game conjured successfully!")
    } catch (error) {
      console.error("Error generating game:", error)
      toast.error("Failed to conjure game. The magic seems unstable.")
    } finally {
      setIsGenerating(prev => ({ ...prev, [gameType.charAt(0).toUpperCase() + gameType.slice(1)]: false }))
    }
  }

  const handleStartGame = () => {
    setGameStarted(true)
  }

  const handleBackToGames = () => {
    setSelectedGame(null)
    setGameData(null)
    setGameStarted(false)
  }

  const handleGameComplete = () => {
    setGameStarted(false)
  }

  if (gameStarted && gameData) {
    return <GamePlay gameData={gameData} onGameComplete={handleGameComplete} onBackToGames={handleBackToGames} />
  }

  if (selectedGame && gameData) {
    return (
      <GameReady
        gameData={gameData}
        gameConfig={gameConfig}
        onStartGame={handleStartGame}
        onBackToGames={handleBackToGames}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 relative overflow-hidden">
      {/* Magical background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23a855f7" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
      
      {/* Floating magical orbs */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            scale: [0.5, 1.5, 0.5],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: Math.random() * 15 + 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50"
              >
                <Crown className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent mb-2">
                  Magical Learning Academy
                </h1>
                <p className="text-gray-300 text-lg">Where knowledge meets enchantment</p>
              </div>
            </div>
          </motion.div>

          {/* Game Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <MagicalCard className="p-6" glowColor="purple">
              <div className="flex items-center space-x-3 mb-6">
                <AnimatedAvatar type="educational" size="md" />
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Scroll className="w-5 h-5 text-purple-400 mr-2" />
                  Academy Settings
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">Academic Year</label>
                  <select
                    value={gameConfig.grade}
                    onChange={(e) => setGameConfig((prev) => ({ ...prev, grade: e.target.value }))}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white transition-all duration-200"
                  >
                    {grades.map((grade) => (
                      <option key={grade.value} value={grade.value} className="bg-purple-900 text-white">
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">Challenge Level</label>
                  <select
                    value={gameConfig.difficulty}
                    onChange={(e) => setGameConfig((prev) => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white transition-all duration-200"
                  >
                    <option value="easy" className="bg-purple-900 text-white">Apprentice</option>
                    <option value="medium" className="bg-purple-900 text-white">Scholar</option>
                    <option value="hard" className="bg-purple-900 text-white">Master</option>
                  </select>
                </div>
              </div>
            </MagicalCard>
          </motion.div>

          {/* Game Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Arithmancy (Math) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MagicalCard 
                className="p-6 cursor-pointer h-full" 
                glowColor="blue"
                floating
                onClick={() => !isGenerating.Math && generateGame(gameType.Math)}
              >
                <div className="flex items-center justify-between mb-6">
                  <AnimatedAvatar type="educational" size="lg" />
                  {isGenerating.Math && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"
                    />
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 flex items-center">
                  <Calculator className="w-6 h-6 text-blue-400 mr-2" />
                  Arithmancy
                </h3>
                <p className="text-gray-300 text-sm mb-6">Master the ancient art of magical mathematics and numerical spells</p>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isGenerating.Math}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center space-x-2">
                    {isGenerating.Math ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Conjuring...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        <span>Begin Quest</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </MagicalCard>
            </motion.div>

            {/* Riddles & Mysteries (Puzzle) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <MagicalCard 
                className="p-6 cursor-pointer h-full" 
                glowColor="purple"
                floating
                onClick={() => !isGenerating.Puzzle && generateGame(gameType.Puzzle)}
              >
                <div className="flex items-center justify-between mb-6">
                  <AnimatedAvatar type="game" size="lg" />
                  {isGenerating.Puzzle && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
                    />
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 flex items-center">
                  <Puzzle className="w-6 h-6 text-purple-400 mr-2" />
                  Riddles & Mysteries
                </h3>
                <p className="text-gray-300 text-sm mb-6">Unravel ancient puzzles and unlock the secrets of wisdom</p>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(168, 85, 247, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isGenerating.Puzzle}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center space-x-2">
                    {isGenerating.Puzzle ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Conjuring...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        <span>Begin Quest</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </MagicalCard>
            </motion.div>

            {/* Spellcrafting (Word) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <MagicalCard 
                className="p-6 cursor-pointer h-full" 
                glowColor="green"
                floating
                onClick={() => !isGenerating.Word && generateGame(gameType.Word)}
              >
                <div className="flex items-center justify-between mb-6">
                  <AnimatedAvatar type="story" size="lg" />
                  {isGenerating.Word && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full"
                    />
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 flex items-center">
                  <Type className="w-6 h-6 text-green-400 mr-2" />
                  Spellcrafting
                </h3>
                <p className="text-gray-300 text-sm mb-6">Weave words into powerful spells and expand your magical vocabulary</p>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(34, 197, 94, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isGenerating.Word}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center space-x-2">
                    {isGenerating.Word ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Conjuring...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        <span>Begin Quest</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </MagicalCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}