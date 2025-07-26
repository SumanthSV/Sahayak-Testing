import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
// import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  User,
  BookOpen,
 
  Calendar,
  X,
  Save,
  Upload,
  BarChart3,
  
  Filter,
  
  FileSpreadsheet,
  Search,
  AlertTriangle,
  Star,
  Clock,

} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { FirebaseService, Student, StudentMark } from '../services/firebaseService';
// import { Modal } from '../components/UI/Modal';
import { ResponsiveModal } from '../components/UI/ResponsiveModal';
import toast from 'react-hot-toast';

interface FilterState {
  grade: string;
  class: string;
  section: string;
  gender: string;
  subject: string;
  search: string;
}

interface ClassStats {
  totalStudents: number;
  averageScore: number;
  topPerformers: Student[];
  atRiskStudents: Student[];
  subjectAverages: Record<string, number>;
}

const StudentTracker: React.FC = () => {
  // const { t } = useTranslation();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    grade: '',
    class: '',
    section: '',
    gender: '',
    subject: '',
    search: ''
  });

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

  // Calculate performance for a student
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

  // Filter students based on current filters
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (filters.grade && student.grade !== filters.grade) return false;
      if (filters.class && student.class !== filters.class) return false;
      if (filters.section && student.section !== filters.section) return false;
      if (filters.gender && student.gender !== filters.gender) return false;
      if (filters.subject && !student.subjects?.includes(filters.subject)) return false;
      if (filters.search && !student.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [students, filters]);

  // Calculate class statistics
  const classStats = useMemo((): ClassStats => {
    const studentsToAnalyze = filteredStudents;
    
    if (studentsToAnalyze.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        topPerformers: [],
        atRiskStudents: [],
        subjectAverages: {}
      };
    }

    const performances = studentsToAnalyze.map(student => ({
      student,
      performance: calculateOverallPerformance(student.id)
    }));

    const totalScore = performances.reduce((sum, p) => sum + p.performance.percentage, 0);
    const averageScore = Math.round(totalScore / performances.length);

    const topPerformers = performances
      .filter(p => p.performance.percentage >= 85)
      .sort((a, b) => b.performance.percentage - a.performance.percentage)
      .slice(0, 3)
      .map(p => p.student);

    const atRiskStudents = performances
      .filter(p => p.performance.percentage < 60)
      .sort((a, b) => a.performance.percentage - b.performance.percentage)
      .slice(0, 3)
      .map(p => p.student);

    // Calculate subject averages
    const subjectAverages: Record<string, number> = {};
    subjects.forEach(subject => {
      const subjectMarks = studentMarks.filter(mark => 
        mark.subject === subject && 
        studentsToAnalyze.some(s => s.id === mark.studentId)
      );
      if (subjectMarks.length > 0) {
        const avg = subjectMarks.reduce((sum, mark) => sum + mark.percentage, 0) / subjectMarks.length;
        subjectAverages[subject] = Math.round(avg);
      }
    });

    return {
      totalStudents: studentsToAnalyze.length,
      averageScore,
      topPerformers,
      atRiskStudents,
      subjectAverages
    };
  }, [filteredStudents, studentMarks]);

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
      // Check if marks already exist for this subject and test
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
        toast.success(`Marks updated for ${marksData.subject}`);
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

        // Check if this is a new subject for the student
        const studentSubjects = selectedStudent.subjects || [];
        if (!studentSubjects.includes(marksData.subject)) {
          await FirebaseService.updateStudent(selectedStudent.id, {
            subjects: [...studentSubjects, marksData.subject]
          });
          toast.success('New subject added');
        } else {
          toast.success(`Marks added for ${marksData.subject}`);
        }
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

  const handleRemoveSubject = async (studentId: string, subject: string) => {
    if (!confirm(`Are you sure you want to remove ${subject} from this student? This will delete all marks for this subject.`)) return;

    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const updatedSubjects = (student.subjects || []).filter(s => s !== subject);
      await FirebaseService.updateStudent(studentId, { subjects: updatedSubjects });

      // Delete all marks for this subject
      const subjectMarks = studentMarks.filter(mark => mark.studentId === studentId && mark.subject === subject);
      for (const mark of subjectMarks) {
        await FirebaseService.deleteStudentMark(mark.id);
      }

      toast.success(`${subject} removed successfully`);
      loadStudents();
    } catch (error) {
      console.error('Error removing subject:', error);
      toast.error('Error removing subject');
    }
  };

  const exportToCSV = () => {
    const studentsToExport = filteredStudents;
    if (studentsToExport.length === 0) {
      toast.error('No students to export');
      return;
    }

    // Get all unique subjects
    const allSubjects = Array.from(new Set(studentMarks.map(mark => mark.subject)));
    
    // Create CSV headers
    const headers = ['Name', 'Grade', 'Class', 'Section', 'Gender', 'Roll Number', ...allSubjects];
    
    // Create CSV rows
    const rows = studentsToExport.map(student => {
      const row = [
        student.name,
        student.grade,
        student.class || '',
        student.section || '',
        student.gender || '',
        student.rollNumber
      ];
      
      // Add subject marks
      allSubjects.forEach(subject => {
        const subjectMarks = getSubjectMarks(student.id, subject);
        if (subjectMarks.length > 0) {
          const latestMark = subjectMarks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          row.push(`${latestMark.score}/${latestMark.maxScore} (${latestMark.percentage}%)`);
        } else {
          row.push('');
        }
      });
      
      return row;
    });

    // Create CSV content
    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Student data exported successfully!');
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
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/50';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50';
  };

  const getAIInsightBadge = (percentage: number, trend: 'up' | 'down' | 'stable') => {
    if (percentage >= 90 && trend === 'up') return { text: 'Top Performer', color: 'bg-green-500' };
    if (percentage < 50 || (percentage < 70 && trend === 'down')) return { text: 'At Risk', color: 'bg-red-500' };
    if (trend === 'up') return { text: 'Improving', color: 'bg-blue-500' };
    return null;
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (field: keyof Student) => {
    return Array.from(new Set(students.map(student => student[field]).filter(Boolean)));
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen dark:bg-gradient-to-br dark:from-gray-950 via-60%  dark:via-purple-950/10  dark:to-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-14">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center"
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold dark:text-zinc-200 text-zinc-800">
                Student Tracker
              </h1>
              <p className=" dark:text-zinc-400 text-sm text-zinc-700">Manage students and track their academic progress</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className=" text-gray-700 text-sm dark:text-gray-300 font-medium py-2 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 border border-zinc-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              disabled={filteredStudents.length === 0}
              className=" text-green-700 text-sm  dark:text-green-400 border border-zinc-600 font-medium py-2 px-4 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="dark:text-zinc-200 text-zinc-800  text-sm d font-semibold py-2 px-4 rounded-xl  border border-zinc-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters Panel */}
      {/* <AnimatePresence> */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      placeholder="Search students..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade</label>
                  <select
                    value={filters.grade}
                    onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-gray-900 dark:text-gray-100"
                  >
                    <option  className="dark:bg-zinc-800" value="">All Grades</option>
                    {grades.map(grade => (
                      <option  className="dark:bg-zinc-800" key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Class</label>
                  <select
                    value={filters.class}
                    onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-gray-900 dark:text-gray-100"
                  >
                    <option  className="dark:bg-zinc-800" value="">All Classes</option>
                    {getUniqueValues('class').map(cls => (
                      <option  className="dark:bg-zinc-800" key={cls} value={cls as string}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Section</label>
                  <select
                    value={filters.section}
                    onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-gray-900 dark:text-gray-100"
                  >
                    <option  className="dark:bg-zinc-800" value="">All Sections</option>
                    {getUniqueValues('section').map(section => (
                      <option  className="dark:bg-zinc-800" key={section} value={section as string}>{section}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-gray-900 dark:text-gray-100"
                  >
                    <option  className="dark:bg-zinc-800" value="">All Genders</option>
                    {genders.map(gender => (
                      <option  className="dark:bg-zinc-800" key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <select
                    value={filters.subject}
                    onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-gray-900 dark:text-gray-100"
                  >
                    <option  className="dark:bg-zinc-800" value="">All Subjects</option>
                    {subjects.map(subject => (
                      <option  className="dark:bg-zinc-800" key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilters({ grade: '', class: '', section: '', gender: '', subject: '', search: '' })}
                  className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                >
                  Clear All Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      {/* </AnimatePresence> */}

      {/* Class Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-teal-600 mr-2" />
            Class Statistics
            {Object.values(filters).some(f => f) && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">(Filtered)</span>
            )}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{classStats.totalStudents}</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl border border-green-200/50 dark:border-green-700/50">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Average Score</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{classStats.averageScore}%</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Top Performers</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{classStats.topPerformers.length}</p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">At Risk</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{classStats.atRiskStudents.length}</p>
            </div>
          </div>

          {Object.keys(classStats.subjectAverages).length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Subject Averages</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(classStats.subjectAverages).map(([subject, average]) => (
                  <div key={subject} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{subject}</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{average}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Students Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {students.length === 0 ? 'No Students Added' : 'No Students Match Filters'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {students.length === 0 
              ? 'Start by adding your first student to track their progress'
              : 'Try adjusting your filters or clear them to see all students'
            }
          </p>
          {students.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className=" dark:text-white text-zinc-800 font-semibold py-3 px-6 rounded-xl text-sm border dark:border-zinc-200 border-zinc-800 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add First Student</span>
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student, index) => {
            const performance = calculateOverallPerformance(student.id);
            const aiInsight = getAIInsightBadge(performance.percentage, performance.trend);
            
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => openDetailModal(student)}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 relative"
              >
                {/* AI Insight Badge */}
                {aiInsight && (
                  <div className={`absolute -top-2 -right-2 ${aiInsight.color} text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1`}>
                    {aiInsight.text === 'Top Performer' && <Star className="w-3 h-3" />}
                    {aiInsight.text === 'At Risk' && <AlertTriangle className="w-3 h-3" />}
                    {aiInsight.text === 'Improving' && <TrendingUp className="w-3 h-3" />}
                    <span>{aiInsight.text}</span>
                  </div>
                )}

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
                    {(student.class || student.section) && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {student.class && `Class ${student.class}`}
                        {student.class && student.section && ' • '}
                        {student.section && `Section ${student.section}`}
                      </p>
                    )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
              >
                <option  className="dark:bg-zinc-800" value="">Select Grade</option>
                {grades.map(grade => (
                  <option  className="dark:bg-zinc-800" key={grade} value={grade}>{grade}</option>
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
              >
                <option  className="dark:bg-zinc-800" value="">Select Gender</option>
                {genders.map(gender => (
                  <option  className="dark:bg-zinc-800" key={gender} value={gender}>{gender}</option>
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
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-transparent text-sm text-gray-700 dark:text-gray-300'
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
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-transparent border border-zinc-600 hover:bg-gray-200 dark:hover:bg-transparent text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-all duration-200"
            >
              Cancel
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddStudent}
              disabled={isSaving}
              className="flex-1 py-3 px-4 dark:bg-zinc-200 text-zinc-800 border border-zinc-800 dark:border-zinc-200 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
              >
                <option  className="dark:bg-zinc-800" value="">Select Grade</option>
                {grades.map(grade => (
                  <option  className="dark:bg-zinc-800" key={grade} value={grade}>{grade}</option>
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl  bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
              >
                <option  className="dark:bg-zinc-800" value="">Select Gender</option>
                {genders.map(gender => (
                  <option  className="dark:bg-zinc-800" key={gender} value={gender}>{gender}</option>
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
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-transparent text-sm text-gray-700 dark:text-gray-300'
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
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(avgPercentage)}`}>
                              {avgPercentage}%
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveSubject(selectedStudent.id, subject)}
                              className="p-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200"
                              title="Remove Subject"
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                          </div>
                        </div>
                        
                        {subjectMarks.length > 0 ? (
                          <div className="space-y-2">
                            {subjectMarks.slice(0, 3).map(mark => (
                              <div key={mark.id} className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">{mark.testName}</span>
                                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(mark.date).toLocaleDateString()}</span>
                                  </div>
                                </div>
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
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(mark.date).toLocaleDateString()}</span>
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
              >
                <option  className="dark:bg-zinc-800" value="">Select Subject</option>
                {subjects.map(subject => (
                  <option  className="dark:bg-zinc-800" key={subject} value={subject}>{subject}</option>
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100"
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