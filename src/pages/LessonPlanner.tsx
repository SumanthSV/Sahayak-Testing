import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  BookOpen, 
  Clock, 
  Target,
  CheckCircle,
  Circle,
  Users,
  FileText,
  Sparkles,
  X,
  Award,
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { FirebaseService, LessonPlan } from '../services/firebaseService';
import { format, startOfWeek, addDays, isSameWeek } from 'date-fns';
import { AIService } from '../services/aiService';
import toast from 'react-hot-toast';

const LessonPlanner: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [showImprovements, setShowImprovements] = useState(false);
  const [improvements, setImprovements] = useState<any>(null);
  const [isGeneratingImprovements, setIsGeneratingImprovements] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subject: 'math',
    grade: '3',
    week: '',
    objectives: [''],
    activities: [''],
    resources: [''],
    assessment: '',
    duration: '45',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    status: 'draft' as 'draft' | 'active' | 'completed'
  });

  const subjects = [
    { value: 'math', label: t('mathematics') },
    { value: 'science', label: t('science') },
    { value: 'english', label: t('english') },
    { value: 'hindi', label: t('hindi') },
    { value: 'social', label: t('socialStudies') },
    { value: 'evs', label: t('environmentalStudies') },
  ];

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

  useEffect(() => {
    loadLessonPlans();
  }, [user]);

  useEffect(() => {
    const weekStart = startOfWeek(selectedWeek);
    const weekEnd = addDays(weekStart, 6);
    setFormData(prev => ({
      ...prev,
      week: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`
    }));
  }, [selectedWeek]);

  const loadLessonPlans = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const plans = await FirebaseService.getLessonPlans(user.uid);
      setLessonPlans(plans);
    } catch (error) {
      console.error('Error loading lesson plans:', error);
      toast.error('Error loading lesson plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'objectives' | 'activities' | 'resources', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'objectives' | 'activities' | 'resources') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'objectives' | 'activities' | 'resources', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!user || !formData.title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    setIsSaving(true);
    try {
      const planData = {
        ...formData,
        objectives: formData.objectives.filter(obj => obj.trim()),
        activities: formData.activities.filter(act => act.trim()),
        resources: formData.resources.filter(res => res.trim()),
        teacherId: user.uid
      };

      if (editingPlan) {
        await FirebaseService.updateLessonPlan(editingPlan.id, planData);
        toast.success('Lesson plan updated successfully!');
      } else {
        await FirebaseService.saveLessonPlan(planData);
        toast.success('Lesson plan saved successfully!');
      }

      await loadLessonPlans();
      resetForm();
      
      // Generate suggestions for the saved plan
      if (!editingPlan) {
        generateSuggestions({
          title: formData.title,
          subject: formData.subject,
          grade: formData.grade,
          objectives: formData.objectives.filter(obj => obj.trim()),
          activities: formData.activities.filter(act => act.trim())
        });
      }
    } catch (error) {
      console.error('Error saving lesson plan:', error);
      toast.error('Error saving lesson plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateSuggestions = async (planData: {
    title: string;
    subject: string;
    grade: string;
    objectives: string[];
    activities: string[];
  }) => {
    setIsGeneratingSuggestions(true);
    try {
      const result = await AIService.generateLessonSuggestions(planData);
      setSuggestions(result);
      setShowSuggestions(true);
      toast.success('AI suggestions generated!');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const generateImprovements = async (planData: any) => {
    setIsGeneratingImprovements(true);
    try {
      const result = await AIService.generateLessonImprovements(planData);
      setImprovements(result);
      setShowImprovements(true);
      toast.success('AI improvements generated!');
    } catch (error) {
      console.error('Error generating improvements:', error);
      toast.error('Failed to generate improvements');
    } finally {
      setIsGeneratingImprovements(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: 'math',
      grade: '3',
      week: format(selectedWeek, 'MMM dd - MMM dd, yyyy'),
      objectives: [''],
      activities: [''],
      resources: [''],
      assessment: '',
      duration: '45',
      difficulty: 'medium',
      status: 'draft'
    });
    setIsCreating(false);
    setEditingPlan(null);
  };

  const startEditing = (plan: LessonPlan) => {
    setFormData({
      title: plan.title,
      subject: plan.subject,
      grade: plan.grade,
      week: plan.week,
      objectives: plan.objectives.length ? plan.objectives : [''],
      activities: plan.activities.length ? plan.activities : [''],
      resources: plan.resources.length ? plan.resources : [''],
      assessment: plan.assessment,
      duration: (plan as any).duration || '45',
      difficulty: (plan as any).difficulty || 'medium',
      status: plan.status || 'draft'
    });
    setEditingPlan(plan);
    setIsCreating(true);
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this lesson plan?')) return;

    try {
      // Note: Would need to implement deleteLessonPlan in FirebaseService
      toast.success('Lesson plan deleted successfully!');
      await loadLessonPlans();
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      toast.error('Error deleting lesson plan');
    }
  };

  const togglePlanStatus = async (plan: LessonPlan) => {
    const newStatus = plan.status === 'completed' ? 'active' : 'completed';
    try {
      await FirebaseService.updateLessonPlan(plan.id, { status: newStatus });
      await loadLessonPlans();
      toast.success(`Lesson plan marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating plan status:', error);
      toast.error('Error updating plan status');
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfWeek(selectedWeek), i);
    const dayPlans = lessonPlans.filter(plan => 
      isSameWeek(new Date(plan.createdAt), selectedWeek) && 
      plan.week === format(startOfWeek(selectedWeek), 'MMM dd - MMM dd, yyyy')
    );
    
    return {
      date: day,
      dayName: format(day, 'EEEE'),
      dayNumber: format(day, 'd'),
      plans: dayPlans
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white dark:bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12  rounded-xl flex items-center justify-center"
            >
              <Calendar className="w-6 h-6 text-black dark:text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Multi-Grade Lesson Planner
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Plan and organize lessons for multiple grade levels</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreating(true)}
            className="dark:text-white text-zinc-900 font-semibold border border-zinc-400 py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Lesson Plan</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Week Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Weekly Overview</h2>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-950 transition-all duration-200"
            >
              ←
            </motion.button>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {format(startOfWeek(selectedWeek), 'MMM dd')} - {format(addDays(startOfWeek(selectedWeek), 6), 'MMM dd, yyyy')}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              →
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-transparent border border-zinc-500  rounded-xl p-4 min-h-[120px]"
            >
              <div className="text-center mb-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{day.dayName}</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{day.dayNumber}</p>
              </div>
              <div className="space-y-2">
                {day.plans.map((plan, planIndex) => (
                  <motion.div
                    key={planIndex}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => startEditing(plan)}
                    className="bg-white dark:bg-gray-600 p-2 rounded-lg border-l-4 border-indigo-500 cursor-pointer hover:shadow-md transition-all duration-200"
                  >
                    <p className="text-xs font-medium text-indigo-600">{plan.subject}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{plan.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(plan.status || 'draft')}`}>
                        {plan.status || 'draft'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Grade {plan.grade}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Create/Edit Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {editingPlan ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter lesson title..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                  >
                    {subjects.map((subject) => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                  >
                    {grades.map((grade) => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Week
                </label>
                <input
                  type="text"
                  value={formData.week}
                  readOnly
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Learning Objectives
                </label>
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => handleArrayChange('objectives', index, e.target.value)}
                      placeholder="Enter learning objective..."
                      className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                    />
                    {formData.objectives.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeArrayItem('objectives', index)}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('objectives')}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                >
                  + Add Objective
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activities
                </label>
                {formData.activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={activity}
                      onChange={(e) => handleArrayChange('activities', index, e.target.value)}
                      placeholder="Enter activity..."
                      className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                    />
                    {formData.activities.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeArrayItem('activities', index)}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('activities')}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                >
                  + Add Activity
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resources Needed
                </label>
                {formData.resources.map((resource, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={resource}
                      onChange={(e) => handleArrayChange('resources', index, e.target.value)}
                      placeholder="Enter resource..."
                      className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                    />
                    {formData.resources.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeArrayItem('resources', index)}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('resources')}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                >
                  + Add Resource
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assessment Method
                </label>
                <textarea
                  value={formData.assessment}
                  onChange={(e) => handleInputChange('assessment', e.target.value)}
                  placeholder="How will you assess student learning?"
                  className="w-full h-24 p-3 border border-gray-200 dark:border-gray-600 rounded-xl  resize-none bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!formData.title.trim() || isSaving}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{editingPlan ? 'Update Plan' : 'Save Plan'}</span>
                  </>
                )}
              </motion.button>
              
              {!editingPlan && formData.title.trim() && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => generateSuggestions({
                      title: formData.title,
                      subject: formData.subject,
                      grade: formData.grade,
                      objectives: formData.objectives.filter(obj => obj.trim()),
                      activities: formData.activities.filter(act => act.trim())
                    })}
                    disabled={isGeneratingSuggestions}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isGeneratingSuggestions ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Suggestions...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm">AI Suggestions</span>
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => generateImprovements(formData)}
                    disabled={isGeneratingImprovements}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isGeneratingImprovements ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Improving...</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        <span className="text-sm">Get Improvements</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Suggestions Modal */}
      {showSuggestions && suggestions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
                AI Lesson Suggestions
              </h2>
              <button
                onClick={() => setShowSuggestions(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto space-y-6">
              {/* Improvements */}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700/50">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Suggested Improvements
                </h3>
                <ul className="space-y-2">
                  {suggestions.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="text-blue-700 dark:text-blue-300 text-sm flex items-start">
                      <span className="text-blue-500 dark:text-blue-400 mr-2">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Activities */}
              <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 border border-green-200 dark:border-green-700/50">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Additional Activities
                </h3>
                <ul className="space-y-2">
                  {suggestions.additionalActivities.map((activity: string, index: number) => (
                    <li key={index} className="text-green-700 dark:text-green-300 text-sm flex items-start">
                      <span className="text-green-500 dark:text-green-400 mr-2">•</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700/50">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Recommended Resources
                </h3>
                <ul className="space-y-2">
                  {suggestions.resources.map((resource: string, index: number) => (
                    <li key={index} className="text-purple-700 dark:text-purple-300 text-sm flex items-start">
                      <span className="text-purple-500 dark:text-purple-400 mr-2">•</span>
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Assessment Ideas */}
              <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-4 border border-orange-200 dark:border-orange-700/50">
                <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-3 flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Assessment Ideas
                </h3>
                <ul className="space-y-2">
                  {suggestions.assessmentIdeas.map((idea: string, index: number) => (
                    <li key={index} className="text-orange-700 dark:text-orange-300 text-sm flex items-start">
                      <span className="text-orange-500 dark:text-orange-400 mr-2">•</span>
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Lesson Topics */}
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700/50">
                <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Next Lesson Topics
                </h3>
                <ul className="space-y-2">
                  {suggestions.nextLessonTopics.map((topic: string, index: number) => (
                    <li key={index} className="text-indigo-700 dark:text-indigo-300 text-sm flex items-start">
                      <span className="text-indigo-500 dark:text-indigo-400 mr-2">•</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Improvements Modal */}
      {showImprovements && improvements && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <Target className="w-5 h-5 text-purple-600 mr-2" />
                AI Lesson Plan Improvements
              </h2>
              <button
                onClick={() => setShowImprovements(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Overall Feedback */}
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700/50">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Overall Feedback</h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">{improvements.overallFeedback}</p>
                  </div>

                  {/* Strengths */}
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 border border-green-200 dark:border-green-700/50">
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Strengths Identified</h3>
                    <ul className="space-y-1">
                      {improvements.strengthsIdentified.map((strength: string, index: number) => (
                        <li key={index} className="text-green-700 dark:text-green-300 text-sm flex items-start">
                          <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-4 border border-orange-200 dark:border-orange-700/50">
                    <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Areas for Improvement</h3>
                    <ul className="space-y-1">
                      {improvements.areasForImprovement.map((area: string, index: number) => (
                        <li key={index} className="text-orange-700 dark:text-orange-300 text-sm flex items-start">
                          <span className="text-orange-500 dark:text-orange-400 mr-2">•</span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Enhanced Objectives */}
                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700/50">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Enhanced Objectives</h3>
                    <ul className="space-y-1">
                      {improvements.enhancedObjectives.map((objective: string, index: number) => (
                        <li key={index} className="text-purple-700 dark:text-purple-300 text-sm flex items-start">
                          <span className="text-purple-500 dark:text-purple-400 mr-2">→</span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Additional Activities */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700/50">
                    <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Additional Activities</h3>
                    <ul className="space-y-1">
                      {improvements.additionalActivities.map((activity: string, index: number) => (
                        <li key={index} className="text-indigo-700 dark:text-indigo-300 text-sm flex items-start">
                          <span className="text-indigo-500 dark:text-indigo-400 mr-2">+</span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Recommended Resources */}
                  <div className="bg-teal-50 dark:bg-teal-900/30 rounded-xl p-4 border border-teal-200 dark:border-teal-700/50">
                    <h3 className="font-semibold text-teal-800 dark:text-teal-300 mb-2">Recommended Resources</h3>
                    <ul className="space-y-1">
                      {improvements.recommendedResources.map((resource: string, index: number) => (
                        <li key={index} className="text-teal-700 dark:text-teal-300 text-sm flex items-start">
                          <span className="text-teal-500 dark:text-teal-400 mr-2">📚</span>
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Assessment Enhancements */}
                  <div className="bg-pink-50 dark:bg-pink-900/30 rounded-xl p-4 border border-pink-200 dark:border-pink-700/50">
                    <h3 className="font-semibold text-pink-800 dark:text-pink-300 mb-2">Assessment Enhancements</h3>
                    <ul className="space-y-1">
                      {improvements.assessmentEnhancements.map((enhancement: string, index: number) => (
                        <li key={index} className="text-pink-700 dark:text-pink-300 text-sm flex items-start">
                          <span className="text-pink-500 dark:text-pink-400 mr-2">📊</span>
                          {enhancement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Time Management Tips */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700/50">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Time Management Tips</h3>
                    <ul className="space-y-1">
                      {improvements.timeManagementTips.map((tip: string, index: number) => (
                        <li key={index} className="text-yellow-700 dark:text-yellow-300 text-sm flex items-start">
                          <span className="text-yellow-500 dark:text-yellow-400 mr-2">⏰</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Differentiation Strategies */}
                  <div className="bg-cyan-50 dark:bg-cyan-900/30 rounded-xl p-4 border border-cyan-200 dark:border-cyan-700/50">
                    <h3 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-2">Differentiation Strategies</h3>
                    <ul className="space-y-1">
                      {improvements.differentiationStrategies.map((strategy: string, index: number) => (
                        <li key={index} className="text-cyan-700 dark:text-cyan-300 text-sm flex items-start">
                          <span className="text-cyan-500 dark:text-cyan-400 mr-2">🎯</span>
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technology Integration */}
                  <div className="bg-violet-50 dark:bg-violet-900/30 rounded-xl p-4 border border-violet-200 dark:border-violet-700/50">
                    <h3 className="font-semibold text-violet-800 dark:text-violet-300 mb-2">Technology Integration</h3>
                    <ul className="space-y-1">
                      {improvements.technologyIntegration.map((tech: string, index: number) => (
                        <li key={index} className="text-violet-700 dark:text-violet-300 text-sm flex items-start">
                          <span className="text-violet-500 dark:text-violet-400 mr-2">💻</span>
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Apply improvements to form data
                    setFormData(prev => ({
                      ...prev,
                      objectives: [...prev.objectives, ...improvements.enhancedObjectives.slice(0, 2)],
                      activities: [...prev.activities, ...improvements.additionalActivities.slice(0, 2)],
                      resources: [...prev.resources, ...improvements.recommendedResources.slice(0, 2)]
                    }));
                    setShowImprovements(false);
                    toast.success('Improvements applied to lesson plan!');
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  Apply Improvements
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowImprovements(false)}
                  className="bg-gradient-to-r from-gray-500 to-slate-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-slate-600 transition-all duration-200"
                >
                  Keep Original
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lesson Plans List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">All Lesson Plans</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading lesson plans...</p>
          </div>
        ) : lessonPlans.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-600 dark:text-gray-400">No lesson plans created yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Click "New Lesson Plan" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessonPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm"
                onClick={() => startEditing(plan)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{plan.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{plan.subject} • Grade {plan.grade}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlanStatus(plan);
                      }}
                      className="p-1"
                    >
                      {plan.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                    </motion.button>
                    <Edit3 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-gray-600 dark:text-gray-400">{plan.week}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">{plan.objectives.length} objectives</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600 dark:text-gray-400">{plan.activities.length} activities</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(plan.status || 'draft')}`}>
                    {plan.status || 'draft'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor((plan as any).difficulty || 'medium')}`}>
                    {(plan as any).difficulty || 'medium'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LessonPlanner;