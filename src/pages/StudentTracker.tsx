import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  BookOpen, 
  TrendingUp, 
  Award,
  Filter,
  Download,
  BarChart3,
  User,
  GraduationCap,
  X,
  Save,
  Target,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Calculator,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { FirebaseService, Student, StudentMark } from '../services/firebaseService';
import toast from 'react-hot-toast';

interface StudentProgress {
  subject: string;
  score: number;
  lastAssessment: string;
  trend: 'up' | 'down' | 'stable';
  assignments: number;
  attendance: number;
}

interface ClassStats {
  totalStudents: number;
  averageScore: number;
  attendanceRate: number;
  topPerformers: Student[];
  needsAttention: Student[];
  subjectAverages: Record<string, number>;
  gradeDistribution: Record<string, number>;
  strongestSubject: string;
  weakestSubject: string;
}

interface SubjectMark {
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

const StudentTracker: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [allMarks, setAllMarks] = useState<StudentMark[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [selectedStudentForMarks, setSelectedStudentForMarks] = useState<Student | null>(null);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [isAddingMark, setIsAddingMark] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  
  const [markForm, setMarkForm] = useState({
    subject: 'Mathematics',
    testName: '',
    score: '',
    maxScore: '100',
    remarks: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    grade: '3',
    rollNumber: '',
    subjects: [] as string[],
    class: 'A',
    parentContact: '',
    address: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other'
  });

  const grades = [
    { value: 'all', label: 'All Grades' },
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

  const classes = [
    { value: 'all', label: 'All Classes' },
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' },
    { value: 'D', label: 'Section D' },
  ];

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'Hindi',
    'Social Studies',
    'Environmental Studies',
    'Art & Craft',
    'Physical Education',
    'Computer Science',
    'Music'
  ];

  useEffect(() => {
    loadStudents();
    loadAllMarks();
  }, [user]);

  useEffect(() => {
    filterStudents();
  }, [students, allMarks, searchTerm, selectedGrade, selectedClass, selectedSubject]);

  useEffect(() => {
    calculateClassStats();
  }, [filteredStudents, allMarks]);

  const loadStudents = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const studentList = await FirebaseService.getStudents(user.uid);
      setStudents(studentList);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Error loading students');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllMarks = async () => {
    if (!user) return;
    
    try {
      const marks = await FirebaseService.getStudentMarks(user.uid);
      setAllMarks(marks);
    } catch (error) {
      console.error('Error loading marks:', error);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(student => student.grade === selectedGrade);
    }

    if (selectedClass !== 'all') {
      filtered = filtered.filter(student => (student as any).class === selectedClass);
    }

    setFilteredStudents(filtered);
  };

  const calculateClassStats = () => {
    if (filteredStudents.length === 0) {
      setClassStats(null);
      return;
    }

    const totalStudents = filteredStudents.length;
    
    // Calculate subject averages and overall performance
    const subjectAverages: Record<string, number> = {};
    const subjectCounts: Record<string, number> = {};
    const studentPerformances: number[] = [];
    
    filteredStudents.forEach(student => {
      const studentMarks = allMarks.filter(mark => mark.studentId === student.id);
      
      if (studentMarks.length > 0) {
        const studentAverage = studentMarks.reduce((sum, mark) => sum + mark.percentage, 0) / studentMarks.length;
        studentPerformances.push(studentAverage);
        
        studentMarks.forEach(mark => {
          if (!subjectAverages[mark.subject]) {
            subjectAverages[mark.subject] = 0;
            subjectCounts[mark.subject] = 0;
          }
          subjectAverages[mark.subject] += mark.percentage;
          subjectCounts[mark.subject]++;
        });
      }
    });

    // Calculate final subject averages
    Object.keys(subjectAverages).forEach(subject => {
      subjectAverages[subject] = Math.round(subjectAverages[subject] / subjectCounts[subject]);
    });

    const averageScore = studentPerformances.length > 0 
      ? Math.round(studentPerformances.reduce((sum, score) => sum + score, 0) / studentPerformances.length)
      : 0;

    // Grade distribution
    const gradeDistribution = {
      'A+ (90-100%)': studentPerformances.filter(score => score >= 90).length,
      'A (80-89%)': studentPerformances.filter(score => score >= 80 && score < 90).length,
      'B (70-79%)': studentPerformances.filter(score => score >= 70 && score < 80).length,
      'C (60-69%)': studentPerformances.filter(score => score >= 60 && score < 70).length,
      'D (Below 60%)': studentPerformances.filter(score => score < 60).length,
    };

    // Find strongest and weakest subjects
    const subjectEntries = Object.entries(subjectAverages);
    const strongestSubject = subjectEntries.length > 0 
      ? subjectEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : 'N/A';
    const weakestSubject = subjectEntries.length > 0 
      ? subjectEntries.reduce((a, b) => a[1] < b[1] ? a : b)[0]
      : 'N/A';

    // Top performers and students needing attention
    const studentsWithScores = filteredStudents.map(student => {
      const studentMarks = allMarks.filter(mark => mark.studentId === student.id);
      const average = studentMarks.length > 0 
        ? studentMarks.reduce((sum, mark) => sum + mark.percentage, 0) / studentMarks.length
        : 0;
      return { student, average };
    }).filter(item => item.average > 0);

    const topPerformers = studentsWithScores
      .sort((a, b) => b.average - a.average)
      .slice(0, 3)
      .map(item => item.student);

    const needsAttention = studentsWithScores
      .filter(item => item.average < 60)
      .sort((a, b) => a.average - b.average)
      .slice(0, 3)
      .map(item => item.student);

    setClassStats({
      totalStudents,
      averageScore,
      attendanceRate: Math.floor(Math.random() * 20) + 80, // Mock attendance
      topPerformers,
      needsAttention,
      subjectAverages,
      gradeDistribution,
      strongestSubject,
      weakestSubject
    });
  };

  const getStudentSubjectMarks = (studentId: string): SubjectMark[] => {
    const studentMarks = allMarks.filter(mark => mark.studentId === studentId);
    const subjectMap: Record<string, StudentMark[]> = {};
    
    studentMarks.forEach(mark => {
      if (!subjectMap[mark.subject]) {
        subjectMap[mark.subject] = [];
      }
      subjectMap[mark.subject].push(mark);
    });

    return Object.entries(subjectMap).map(([subject, marks]) => {
      const latestMark = marks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const trend = marks.length > 1 ? 
        (marks[0].percentage > marks[1].percentage ? 'up' : 
         marks[0].percentage < marks[1].percentage ? 'down' : 'stable') : 'stable';
      
      return {
        subject,
        score: latestMark.score,
        maxScore: latestMark.maxScore,
        percentage: latestMark.percentage,
        trend
      };
    });
  };

  const getStudentOverallPerformance = (studentId: string): number => {
    const studentMarks = allMarks.filter(mark => mark.studentId === studentId);
    if (studentMarks.length === 0) return 0;
    
    const average = studentMarks.reduce((sum, mark) => sum + mark.percentage, 0) / studentMarks.length;
    return Math.round(average);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSaveStudent = async () => {
    if (!user || !formData.name.trim() || !formData.rollNumber.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSaving(true);
    try {
      const studentData = {
        ...formData,
        teacherId: user.uid
      };

      if (editingStudent) {
        await FirebaseService.updateStudent(editingStudent.id, studentData);
        toast.success('Student updated successfully!');
      } else {
        await FirebaseService.addStudent(studentData);
        toast.success('Student added successfully!');
      }

      await loadStudents();
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Error saving student. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMarks = async (student: Student) => {
    setSelectedStudentForMarks(student);
    setShowMarksModal(true);
    
    try {
      const marks = await FirebaseService.getStudentMarks(user!.uid, student.id);
      setStudentMarks(marks);
    } catch (error) {
      console.error('Error loading student marks:', error);
      toast.error('Error loading student marks');
    }
  };

  const handleSaveMark = async () => {
    if (!selectedStudentForMarks || !user || !markForm.testName || !markForm.score) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await FirebaseService.addStudentMark({
        studentId: selectedStudentForMarks.id,
        teacherId: user.uid,
        subject: markForm.subject,
        testName: markForm.testName,
        score: parseInt(markForm.score),
        maxScore: parseInt(markForm.maxScore),
        percentage: Math.round((parseInt(markForm.score) / parseInt(markForm.maxScore)) * 100),
        date: new Date(),
        remarks: markForm.remarks || undefined
      });

      const marks = await FirebaseService.getStudentMarks(user.uid, selectedStudentForMarks.id);
      setStudentMarks(marks);
      await loadAllMarks();
      
      setMarkForm({
        subject: 'Mathematics',
        testName: '',
        score: '',
        maxScore: '100',
        remarks: ''
      });
      setIsAddingMark(false);
      
      toast.success('Mark added successfully!');
    } catch (error) {
      console.error('Error saving mark:', error);
      toast.error('Error saving mark. Please try again.');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await FirebaseService.deleteStudent(studentId);
      await loadStudents();
      await loadAllMarks();
      toast.success('Student deleted successfully!');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Error deleting student. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '3',
      rollNumber: '',
      subjects: [],
      class: 'A',
      parentContact: '',
      address: '',
      dateOfBirth: '',
      gender: 'male'
    });
    setIsAddingStudent(false);
    setEditingStudent(null);
  };

  const startEditing = (student: Student) => {
    setFormData({
      name: student.name,
      grade: student.grade,
      rollNumber: student.rollNumber,
      subjects: student.subjects,
      class: (student as any).class || 'A',
      parentContact: (student as any).parentContact || '',
      address: (student as any).address || '',
      dateOfBirth: (student as any).dateOfBirth || '',
      gender: (student as any).gender || 'male'
    });
    setEditingStudent(student);
    setIsAddingStudent(true);
  };

  const exportStudentData = () => {
    const csvHeaders = ['Name', 'Grade', 'Class', 'Roll Number', ...subjects, 'Overall Average'];
    
    const csvData = filteredStudents.map(student => {
      const studentSubjectMarks = getStudentSubjectMarks(student.id);
      const overallPerformance = getStudentOverallPerformance(student.id);
      
      const row = [
        student.name,
        student.grade,
        (student as any).class || 'A',
        student.rollNumber,
        ...subjects.map(subject => {
          const mark = studentSubjectMarks.find(m => m.subject === subject);
          return mark ? `${mark.score}/${mark.maxScore} (${mark.percentage}%)` : '';
        }),
        overallPerformance > 0 ? `${overallPerformance}%` : ''
      ];
      
      return row;
    });

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const filterInfo = [
      selectedGrade !== 'all' ? `Grade-${selectedGrade}` : '',
      selectedClass !== 'all' ? `Class-${selectedClass}` : '',
      selectedSubject !== 'all' ? `Subject-${selectedSubject}` : '',
      searchTerm ? `Search-${searchTerm}` : ''
    ].filter(Boolean).join('_');
    
    link.download = `students_data${filterInfo ? '_' + filterInfo : ''}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Student data exported successfully!');
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
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center"
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Smart Student Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor student progress across all grades and subjects</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'cards' 
                    ? 'bg-teal-500 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-teal-500 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Table
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportStudentData}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Data</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingStudent(true)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-2 px-4 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Class Statistics */}
      {classStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{classStats.totalStudents}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {filteredStudents.length !== students.length ? `Filtered from ${students.length}` : 'All students'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Class Average</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{classStats.averageScore}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {classStats.averageScore >= 80 ? 'Excellent' : classStats.averageScore >= 70 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Strongest Subject</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{classStats.strongestSubject}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {classStats.subjectAverages[classStats.strongestSubject] || 0}% average
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Needs Attention</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{classStats.needsAttention.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Students below 60%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm w-64 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {grades.map((grade) => (
                <option key={grade.value} value={grade.value}>
                  {grade.label}
                </option>
              ))}
            </select>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {classes.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredStudents.length} of {students.length} students
            </p>
            {(searchTerm || selectedGrade !== 'all' || selectedClass !== 'all' || selectedSubject !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGrade('all');
                  setSelectedClass('all');
                  setSelectedSubject('all');
                }}
                className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Student Form */}
      <AnimatePresence>
        {isAddingStudent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter student name..."
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Grade *
                    </label>
                    <select
                      value={formData.grade}
                      onChange={(e) => handleInputChange('grade', e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {grades.slice(1).map((grade) => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Class/Section
                    </label>
                    <select
                      value={formData.class}
                      onChange={(e) => handleInputChange('class', e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {classes.slice(1).map((cls) => (
                        <option key={cls.value} value={cls.value}>
                          {cls.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                      placeholder="Roll number..."
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parent Contact
                  </label>
                  <input
                    type="tel"
                    value={formData.parentContact}
                    onChange={(e) => handleInputChange('parentContact', e.target.value)}
                    placeholder="Parent phone number..."
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Student address..."
                    className="w-full h-20 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm resize-none bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subjects
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                  {subjects.map((subject) => (
                    <label key={subject} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveStudent}
                disabled={!formData.name.trim() || !formData.rollNumber.trim() || isSaving}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{editingStudent ? 'Update Student' : 'Add Student'}</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Students Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Students Performance</h2>
          {classStats && Object.keys(classStats.subjectAverages).length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Subject Averages: {Object.entries(classStats.subjectAverages).map(([subject, avg]) => 
                `${subject}: ${avg}%`
              ).join(' | ')}
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-600 dark:text-gray-400">
              {students.length === 0 ? 'No students added yet' : 'No students match your search'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {students.length === 0 ? 'Click "Add Student" to get started' : 'Try adjusting your search criteria'}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map((student) => {
              const studentSubjectMarks = getStudentSubjectMarks(student.id);
              const overallPerformance = getStudentOverallPerformance(student.id);
              const isExpanded = expandedStudent === student.id;

              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{student.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Grade {student.grade} • Section {(student as any).class || 'A'} • Roll #{student.rollNumber}
                      </p>
                      {(student as any).parentContact && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Contact: {(student as any).parentContact}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startEditing(student)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                        title="Edit Student"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddMarks(student)}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all duration-200"
                        title="Manage Marks"
                      >
                        <Calculator className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {student.subjects.length > 0 ? (
                    <div>
                      {/* Overall Performance */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Performance</span>
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className={`font-semibold ${getPerformanceColor(overallPerformance)} px-2 py-1 rounded-full text-xs`}>
                              {overallPerformance}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${overallPerformance}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Subject Performance Preview */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Top 3 Subjects:
                        </p>
                        {studentSubjectMarks.slice(0, 3).map((mark, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{mark.subject}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${getPerformanceColor(mark.percentage)} px-2 py-1 rounded-full text-xs`}>
                                {mark.percentage}%
                              </span>
                              {getTrendIcon(mark.trend)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expanded View */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                          >
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">All Subjects:</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {subjects.map((subject) => {
                                const mark = studentSubjectMarks.find(m => m.subject === subject);
                                return (
                                  <div key={subject} className="text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-600 dark:text-gray-400 truncate">{subject}</span>
                                      {mark ? (
                                        <div className="flex items-center space-x-1">
                                          <span className={`font-medium ${getPerformanceColor(mark.percentage)} px-1 py-0.5 rounded text-xs`}>
                                            {mark.percentage}%
                                          </span>
                                          {getTrendIcon(mark.trend)}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 dark:text-gray-500 text-xs">No marks</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Subjects: {student.subjects.length}</span>
                          <span>Marks: {studentSubjectMarks.length}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No subjects selected</p>
                      <button
                        onClick={() => startEditing(student)}
                        className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mt-1"
                      >
                        Add subjects
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Grade</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Class</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Overall</th>
                  {subjects.map((subject) => (
                    <th key={subject} className="text-center py-3 px-2 font-medium text-gray-700 dark:text-gray-300 text-xs">
                      {subject.split(' ')[0]}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const studentSubjectMarks = getStudentSubjectMarks(student.id);
                  const overallPerformance = getStudentOverallPerformance(student.id);

                  return (
                    <tr key={student.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">{student.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Roll #{student.rollNumber}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{student.grade}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{(student as any).class || 'A'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${getPerformanceColor(overallPerformance)} px-2 py-1 rounded-full text-xs`}>
                          {overallPerformance}%
                        </span>
                      </td>
                      {subjects.map((subject) => {
                        const mark = studentSubjectMarks.find(m => m.subject === subject);
                        return (
                          <td key={subject} className="py-3 px-2 text-center">
                            {mark ? (
                              <div className="flex items-center justify-center space-x-1">
                                <span className={`text-xs font-medium ${getPerformanceColor(mark.percentage)} px-1 py-0.5 rounded`}>
                                  {mark.percentage}%
                                </span>
                                {getTrendIcon(mark.trend)}
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => startEditing(student)}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAddMarks(student)}
                            className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                            title="Marks"
                          >
                            <Calculator className="w-3 h-3" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Marks Modal */}
      <AnimatePresence>
        {showMarksModal && selectedStudentForMarks && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Marks for {selectedStudentForMarks.name}
                </h2>
                <button
                  onClick={() => {
                    setShowMarksModal(false);
                    setSelectedStudentForMarks(null);
                    setIsAddingMark(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {/* Add Mark Form */}
                {isAddingMark ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Add New Mark</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subject
                        </label>
                        <select
                          value={markForm.subject}
                          onChange={(e) => setMarkForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          {subjects.map((subject) => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Test/Assignment Name *
                        </label>
                        <input
                          type="text"
                          value={markForm.testName}
                          onChange={(e) => setMarkForm(prev => ({ ...prev, testName: e.target.value }))}
                          placeholder="e.g., Unit Test 1, Quiz 2"
                          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Score Obtained *
                        </label>
                        <input
                          type="number"
                          value={markForm.score}
                          onChange={(e) => setMarkForm(prev => ({ ...prev, score: e.target.value }))}
                          placeholder="85"
                          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Maximum Score
                        </label>
                        <input
                          type="number"
                          value={markForm.maxScore}
                          onChange={(e) => setMarkForm(prev => ({ ...prev, maxScore: e.target.value }))}
                          placeholder="100"
                          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Remarks (Optional)
                        </label>
                        <textarea
                          value={markForm.remarks}
                          onChange={(e) => setMarkForm(prev => ({ ...prev, remarks: e.target.value }))}
                          placeholder="Good performance, needs improvement in..."
                          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl h-20 resize-none bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => setIsAddingMark(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveMark}
                        className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 text-sm transition-all duration-200"
                      >
                        Save Mark
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsAddingMark(true)}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Mark</span>
                    </motion.button>
                  </div>
                )}

                {/* Marks List */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Previous Marks</h3>
                  {studentMarks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Award className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>No marks recorded yet</p>
                      <p className="text-sm mt-2">Click "Add New Mark" to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {studentMarks.map((mark) => (
                        <div key={mark.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-800 dark:text-gray-200">{mark.testName}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{mark.subject}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                                {mark.score}/{mark.maxScore}
                              </div>
                              <div className={`text-sm font-medium ${getPerformanceColor(mark.percentage)} px-2 py-1 rounded-full`}>
                                {mark.percentage}%
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>{new Date(mark.date).toLocaleDateString()}</span>
                            {mark.remarks && (
                              <span className="italic">"{mark.remarks}"</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${mark.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentTracker;