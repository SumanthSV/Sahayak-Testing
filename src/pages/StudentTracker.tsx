import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  User,
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  X,
  Save,
  Upload,
  BarChart3,
  Target,
  Eye
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { FirebaseService, Student, StudentMark } from '../services/firebaseService';
import { Modal } from '../components/UI/Modal';
import { ResponsiveModal } from '../components/UI/ResponsiveModal';
import toast from 'react-hot-toast';

const StudentTracker: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    rollNumber: '',
    class: '',
    section: '',
    gender: '',
    subjects: [] as string[]
  });

  // Marks form state
  const [marksData, setMarksData] = useState({
    subject: '',
    testName: '',
    score: '',
    maxScore: '',
    remarks: ''
  });

  const grades = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Environmental Studies', 'Art', 'Physical Education'];
  const genders = ['Male', 'Female', 'Other'];

  useEffect(() => {
    loadStudents();
  }, [user]);

  const loadStudents = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [studentsData, marksData] = await Promise.all([
        FirebaseService.getStudents(user.uid),
        FirebaseService.getStudentMarks(user.uid)
      ]);
      setStudents(studentsData);
      setStudentMarks(marksData);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Error loading students');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverallPerformance = (studentId: string): { percentage: number; trend: 'up' | 'down' | 'stable' } => {
    const marks = studentMarks.filter(mark => mark.studentId === studentId);
    if (marks.length === 0) return { percentage: 0, trend: 'stable' };

    const totalPercentage = marks.reduce((sum, mark) => sum + mark.percentage, 0);
    const averagePercentage = Math.round(totalPercentage / marks.length);

    // Calculate trend based on recent vs older marks
    const sortedMarks = marks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentMarks = sortedMarks.slice(0, Math.ceil(sortedMarks.length / 2));
    const olderMarks = sortedMarks.slice(Math.ceil(sortedMarks.length / 2));

    if (recentMarks.length === 0 || olderMarks.length === 0) {
      return { percentage: averagePercentage, trend: 'stable' };
    }

    const recentAvg = recentMarks.reduce((sum, mark) => sum + mark.percentage, 0) / recentMarks.length;
    const olderAvg = olderMarks.reduce((sum, mark) => sum + mark.percentage, 0) / olderMarks.length;

    const trend = recentAvg > olderAvg + 5 ? 'up' : recentAvg < olderAvg - 5 ? 'down' : 'stable';

    return { percentage: averagePercentage, trend };
  };

  const getStudentMarks = (studentId: string) => {
    return studentMarks.filter(mark => mark.studentId === studentId);
  };

  const getSubjectMarks = (studentId: string, subject: string) => {
    return studentMarks.filter(mark => mark.studentId === studentId && mark.subject === subject);
  };

  const handleAddStudent = async () => {
    if (!user || !formData.name.trim() || !formData.grade || !formData.rollNumber.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await FirebaseService.addStudent({
        name: formData.name,
        grade: formData.grade,
        rollNumber: formData.rollNumber,
        class: formData.class,
        section: formData.section,
        gender: formData.gender,
        teacherId: user.uid,
        subjects: formData.subjects,
        createdAt: new Date()
      });

      toast.success('Student added successfully!');
      setShowAddModal(false);
      resetForm();
      loadStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Error adding student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditStudent = async () => {
    if (!selectedStudent || !user) return;

    setIsSaving(true);
    try {
      await FirebaseService.updateStudent(selectedStudent.id, {
        name: formData.name,
        grade: formData.grade,
        rollNumber: formData.rollNumber,
        class: formData.class,
        section: formData.section,
        gender: formData.gender,
        subjects: formData.subjects
      });

      toast.success('Student updated successfully!');
      setShowEditModal(false);
      resetForm();
      loadStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Error updating student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student? This will also delete all their marks.')) return;

    try {
      await FirebaseService.deleteStudent(studentId);
      toast.success('Student deleted successfully!');
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Error deleting student');
    }
  };

  const handleAddMarks = async () => {
    if (!selectedStudent || !user || !marksData.subject || !marksData.testName || !marksData.score || !marksData.maxScore) {
      toast.error('Please fill in all required fields');
      return;
    }

    const score = parseFloat(marksData.score);
    const maxScore = parseFloat(marksData.maxScore);

    if (score > maxScore) {
      toast.error('Score cannot be greater than maximum score');
      return;
    }

    setIsSaving(true);
    try {
      // Check if marks already exist for this subject
      const existingMarks = studentMarks.filter(
        mark => mark.studentId === selectedStudent.id && 
                mark.subject === marksData.subject &&
                mark.testName === marksData.testName
      );

      if (existingMarks.length > 0) {
        // Update existing marks
        await FirebaseService.updateStudentMark(existingMarks[0].id, {
          score,
          maxScore,
          percentage: Math.round((score / maxScore) * 100),
          remarks: marksData.remarks,
          date: new Date()
        });
        toast.success('Marks updated successfully!');
      } else {
        // Add new marks
        await FirebaseService.addStudentMark({
          studentId: selectedStudent.id,
          teacherId: user.uid,
          subject: marksData.subject,
          testName: marksData.testName,
          score,
          maxScore,
          percentage: Math.round((score / maxScore) * 100),
          remarks: marksData.remarks,
          date: new Date()
        });
        toast.success('Marks added successfully!');
      }

      setShowMarksModal(false);
      resetMarksForm();
      loadStudents();
    } catch (error) {
      console.error('Error adding marks:', error);
      toast.error('Error adding marks');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      rollNumber: '',
      class: '',
      section: '',
      gender: '',
      subjects: []
    });
  };

  const resetMarksForm = () => {
    setMarksData({
      subject: '',
      testName: '',
      score: '',
      maxScore: '',
      remarks: ''
    });
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      grade: student.grade,
      rollNumber: student.rollNumber,
      class: student.class || '',
      section: student.section || '',
      gender: student.gender || '',
      subjects: student.subjects || []
    });
    setShowEditModal(true);
  };

  const openDetailModal = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const openMarksModal = (student: Student) => {
    setSelectedStudent(student);
    setShowMarksModal(true);
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center"
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Student Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Manage students and track their academic progress</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Student</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Students Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Students Added</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Start by adding your first student to track their progress</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Student</span>
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map((student, index) => {
            const performance = calculateOverallPerformance(student.id);
            
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => openDetailModal(student)}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 cursor-pointer hover:shadow-2xl transition-all duration-300"
              >
                {/* Student Avatar and Basic Info */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{student.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Grade {student.grade} • Roll #{student.rollNumber}
                    </p>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="space-y-3">
                  <div className={`p-3 rounded-xl border ${getPerformanceColor(performance.percentage)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Performance</span>
                      {getTrendIcon(performance.trend)}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-2xl font-bold">{performance.percentage}%</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-current h-2 rounded-full transition-all duration-300"
                          style={{ width: `${performance.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-center">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{student.subjects?.length || 0}</p>
                      <p className="text-gray-600 dark:text-gray-400">Subjects</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-center">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{getStudentMarks(student.id).length}</p>
                      <p className="text-gray-600 dark:text-gray-400">Tests</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openMarksModal(student);
                    }}
                    className="flex-1 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 flex items-center justify-center space-x-1"
                    title="Add Marks"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-xs">Marks</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(student);
                    }}
                    className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all duration-200"
                    title="Edit Student"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStudent(student.id);
                    }}
                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200"
                    title="Delete Student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Student Modal */}
      <ResponsiveModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Student"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Roll Number *
              </label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter roll number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grade *
              </label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Class
              </label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter class (e.g., A, B, C)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Section
              </label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter section"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Gender</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subjects
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {subjects.map(subject => (
                <motion.button
                  key={subject}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubjectToggle(subject)}
                  className={`p-2 rounded-lg border-2 transition-all duration-200 text-sm ${
                    formData.subjects.includes(subject)
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {subject}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-all duration-200"
            >
              Cancel
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddStudent}
              disabled={isSaving}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Add Student</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Edit Student Modal */}
      <ResponsiveModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
          setSelectedStudent(null);
        }}
        title="Edit Student"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Roll Number *
              </label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter roll number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grade *
              </label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Class
              </label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter class (e.g., A, B, C)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Section
              </label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter section"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Gender</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subjects
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {subjects.map(subject => (
                <motion.button
                  key={subject}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubjectToggle(subject)}
                  className={`p-2 rounded-lg border-2 transition-all duration-200 text-sm ${
                    formData.subjects.includes(subject)
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {subject}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowEditModal(false);
                resetForm();
                setSelectedStudent(null);
              }}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-all duration-200"
            >
              Cancel
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEditStudent}
              disabled={isSaving}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Update Student</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Student Detail Modal */}
      <ResponsiveModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedStudent(null);
        }}
        title={selectedStudent ? `${selectedStudent.name} - Detailed View` : 'Student Details'}
        size="xl"
        showFullscreenToggle={true}
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student Info Header */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 p-6 rounded-xl border border-teal-200/50 dark:border-teal-700/50">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{selectedStudent.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Grade {selectedStudent.grade} • Roll #{selectedStudent.rollNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedStudent.class && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Class</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedStudent.class}</p>
                  </div>
                )}
                {selectedStudent.section && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Section</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedStudent.section}</p>
                  </div>
                )}
                {selectedStudent.gender && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedStudent.gender}</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Subjects</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedStudent.subjects?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 text-teal-600 mr-2" />
                Performance Overview
              </h3>
              
              {(() => {
                const performance = calculateOverallPerformance(selectedStudent.id);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border ${getPerformanceColor(performance.percentage)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Average</span>
                        {getTrendIcon(performance.trend)}
                      </div>
                      <p className="text-3xl font-bold">{performance.percentage}%</p>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Total Tests</p>
                      <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{getStudentMarks(selectedStudent.id).length}</p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Subjects Enrolled</p>
                      <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{selectedStudent.subjects?.length || 0}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Subject-wise Performance */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <BookOpen className="w-5 h-5 text-teal-600 mr-2" />
                  Subject-wise Performance
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openMarksModal(selectedStudent)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Marks</span>
                </motion.button>
              </div>
              
              {selectedStudent.subjects && selectedStudent.subjects.length > 0 ? (
                <div className="space-y-4">
                  {selectedStudent.subjects.map(subject => {
                    const subjectMarks = getSubjectMarks(selectedStudent.id, subject);
                    const avgPercentage = subjectMarks.length > 0 
                      ? Math.round(subjectMarks.reduce((sum, mark) => sum + mark.percentage, 0) / subjectMarks.length)
                      : 0;
                    
                    return (
                      <div key={subject} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">{subject}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(avgPercentage)}`}>
                            {avgPercentage}%
                          </span>
                        </div>
                        
                        {subjectMarks.length > 0 ? (
                          <div className="space-y-2">
                            {subjectMarks.slice(0, 3).map(mark => (
                              <div key={mark.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{mark.testName}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-800 dark:text-gray-200">{mark.score}/{mark.maxScore}</span>
                                  <span className={`px-2 py-1 rounded text-xs ${getPerformanceColor(mark.percentage)}`}>
                                    {mark.percentage}%
                                  </span>
                                </div>
                              </div>
                            ))}
                            {subjectMarks.length > 3 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                +{subjectMarks.length - 3} more tests
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No marks recorded yet</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No subjects assigned</p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <Calendar className="w-5 h-5 text-teal-600 mr-2" />
                Recent Activity
              </h3>
              
              {(() => {
                const recentMarks = getStudentMarks(selectedStudent.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5);
                
                return recentMarks.length > 0 ? (
                  <div className="space-y-3">
                    {recentMarks.map(mark => (
                      <div key={mark.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{mark.subject} - {mark.testName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(mark.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{mark.score}/{mark.maxScore}</p>
                          <span className={`px-2 py-1 rounded text-xs ${getPerformanceColor(mark.percentage)}`}>
                            {mark.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
                );
              })()}
            </div>
          </div>
        )}
      </ResponsiveModal>

      {/* Add Marks Modal */}
      <ResponsiveModal
        isOpen={showMarksModal}
        onClose={() => {
          setShowMarksModal(false);
          resetMarksForm();
          setSelectedStudent(null);
        }}
        title={selectedStudent ? `Add Marks for ${selectedStudent.name}` : 'Add Marks'}
        size="md"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <select
                value={marksData.subject}
                onChange={(e) => setMarksData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Subject</option>
                {selectedStudent?.subjects?.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Name *
              </label>
              <input
                type="text"
                value={marksData.testName}
                onChange={(e) => setMarksData(prev => ({ ...prev, testName: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Unit Test 1, Mid-term"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Score Obtained *
              </label>
              <input
                type="number"
                value={marksData.score}
                onChange={(e) => setMarksData(prev => ({ ...prev, score: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter score"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Score *
              </label>
              <input
                type="number"
                value={marksData.maxScore}
                onChange={(e) => setMarksData(prev => ({ ...prev, maxScore: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter max score"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={marksData.remarks}
              onChange={(e) => setMarksData(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
              placeholder="Add any remarks or feedback..."
            />
          </div>

          {marksData.score && marksData.maxScore && (
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Calculated Percentage:</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {Math.round((parseFloat(marksData.score) / parseFloat(marksData.maxScore)) * 100)}%
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowMarksModal(false);
                resetMarksForm();
                setSelectedStudent(null);
              }}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-all duration-200"
            >
              Cancel
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddMarks}
              disabled={isSaving}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Marks</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default StudentTracker;