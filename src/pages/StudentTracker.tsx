import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  X
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
}

const StudentTracker: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [selectedStudentForMarks, setSelectedStudentForMarks] = useState<Student | null>(null);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [isAddingMark, setIsAddingMark] = useState(false);
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

  // Mock progress data generator
  const getStudentProgress = (studentId: string): StudentProgress[] => {
    const baseSubjects = ['Math', 'Science', 'English', 'Hindi'];
    return baseSubjects.map(subject => ({
      subject,
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      lastAssessment: `${Math.floor(Math.random() * 7) + 1} days ago`,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      assignments: Math.floor(Math.random() * 10) + 5,
      attendance: Math.floor(Math.random() * 20) + 80 // 80-100%
    }));
  };

  useEffect(() => {
    loadStudents();
  }, [user]);

  useEffect(() => {
    filterStudents();
    calculateClassStats();
  }, [students, searchTerm, selectedGrade, selectedClass]);

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
    const scores = filteredStudents.map(() => Math.floor(Math.random() * 40) + 60);
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const attendanceRate = Math.floor(Math.random() * 20) + 80;

    const topPerformers = filteredStudents
      .slice(0, 3)
      .sort(() => Math.random() - 0.5);

    const needsAttention = filteredStudents
      .slice(-2)
      .sort(() => Math.random() - 0.5);

    setClassStats({
      totalStudents,
      averageScore,
      attendanceRate,
      topPerformers,
      needsAttention
    });
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
    
    // Load student marks
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

      // Reload marks
      const marks = await FirebaseService.getStudentMarks(user.uid, selectedStudentForMarks.id);
      setStudentMarks(marks);
      
      // Reset form
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
    const csvContent = [
      ['Name', 'Grade', 'Class', 'Roll Number', 'Subjects', 'Parent Contact'],
      ...filteredStudents.map(student => [
        student.name,
        student.grade,
        (student as any).class || 'A',
        student.rollNumber,
        student.subjects.join('; '),
        (student as any).parentContact || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students_data.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Student data exported successfully!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto dark:bg-black">
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
              className="w-12 h-12  rounded-xl flex items-center justify-center"
            >
              <Users className="w-6 h-6 dark:text-white text-black" />
            </motion.div>
            <div>
              <h1 className="text-2xl dark:text-zinc-200 font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Multi-Grade Student Tracker
              </h1>
              <p className="text-gray-600 dark:text-zinc-200 text-sm">Monitor student progress across all grades and classes</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportStudentData}
              className=" text-zinc-800 dark:text-white border border-none dark:border-zinc-600 font-semibold py-2 px-4 rounded-xl  transition-all duration-200 flex items-center space-x-2"
            >
              <Download className="w-3 h-3" />
              <span className='text-sm'>Export Data</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingStudent(true)}
              className=" dark:text-white border dark:border-zinc-600  font-semibold py-2 px-4 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-3 h-3" />
              <span className='text-sm'>Add Student</span>
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
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/80 dark:bg-black dark:border-zinc-500  backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-zinc-200 text-xs font-medium">Total Students</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-zinc-200">{classStats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-black dark:border-zinc-500  backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-zinc-200 text-xs font-medium">Average Score</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-zinc-200">{classStats.averageScore}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-black dark:border-zinc-500  backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-zinc-200 text-xs font-medium">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-zinc-200">{classStats.attendanceRate}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-black dark:border-zinc-500  backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-zinc-200 text-xs font-medium">Top Performers</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-zinc-200">{classStats.topPerformers.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
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
        className="bg-white/80 dark:bg-black backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl  w-64 bg-white/50 dark:bg-zinc-950 dark:bg-zinc-950 backdrop-blur-sm"
              />
            </div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="p-3 border border-gray-200 dark:text-zinc-200 rounded-xl bg-white/50 dark:bg-zinc-950 dark:bg-zinc-950 backdrop-blur-sm"
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
              className="p-3 border border-gray-200 rounded-xl  bg-white/50 dark:border-zinc-800 dark:bg-zinc-950 dark:bg-zinc-950 backdrop-blur-sm"
            >
              {classes.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-600 dark:text-zinc-200">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </div>
      </motion.div>

      {/* Add/Edit Student Form */}
      {isAddingStudent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-black backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-200">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter student name..."
                  className="w-full p-3 border border-gray-200 rounded-xl  bg-white/50 dark:border-zinc-800 dark:bg-zinc-950 backdrop-blur-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                    Grade *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl  bg-white/50 dark:border-zinc-800 dark:bg-zinc-950 backdrop-blur-sm"
                  >
                    {grades.slice(1).map((grade) => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                    Class/Section
                  </label>
                  <select
                    value={formData.class}
                    onChange={(e) => handleInputChange('class', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl  bg-white/50 dark:border-zinc-800 dark:bg-zinc-950 backdrop-blur-sm"
                  >
                    {classes.slice(1).map((cls) => (
                      <option key={cls.value} value={cls.value}>
                        {cls.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                    placeholder="Roll number..."
                    className="w-full p-3 border border-gray-200 rounded-xl  bg-white/50 dark:border-zinc-800 dark:bg-zinc-950 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl  bg-white/50 dark:border-zinc-800 dark:bg-zinc-950 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl  bg-white/50 dark:border-zinc-800 dark:bg-zinc-950 backdrop-blur-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                  Parent Contact
                </label>
                <input
                  type="tel"
                  value={formData.parentContact}
                  onChange={(e) => handleInputChange('parentContact', e.target.value)}
                  placeholder="Parent phone number..."
                  className="w-full p-3 border border-gray-200 rounded-xl  bg-white/50 dark:border-zinc-800 dark:bg-zinc-950 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Student address..."
                  className="w-full h-20 p-3 border border-gray-200 rounded-xl  resize-none bg-white/50 dark:bg-zinc-950 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                Subjects
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-white/50 dark:bg-zinc-950 backdrop-blur-sm">
                {subjects.map((subject) => (
                  <label key={subject} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 hover:dark:bg-zinc-900">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-zinc-200">{subject}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={resetForm}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-zinc-500 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveStudent}
              disabled={!formData.name.trim() || !formData.rollNumber.trim() || isSaving}
              className="bg-gray-100 dark:bg-black border dark:border-zinc-500 text-white  text-sm font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span>{editingStudent ? 'Update Student' : 'Add Student'}</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Students List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/80 dark:bg-black dark:border-zinc-500  backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:bg-black p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-zinc-200 mb-6">Students</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">
              {students.length === 0 ? 'No students added yet' : 'No students match your search'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {students.length === 0 ? 'Click "Add Student" to get started' : 'Try adjusting your search criteria'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map((student) => {
              const progress = getStudentProgress(student.id);
              const averageScore = Math.round(progress.reduce((sum, p) => sum + p.score, 0) / progress.length);
              
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  className="border border-zinc-800 rounded-xl p-6 hover:shadow-md transition-all duration-200 bg-white/50 dark:bg-black backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-zinc-200 text-lg">{student.name}</h3>
                      <p className="text-gray-600 dark:text-zinc-200 text-sm">
                        Grade {student.grade} • Section {(student as any).class || 'A'} • Roll #{student.rollNumber}
                      </p>
                      {(student as any).parentContact && (
                        <p className="text-sm text-gray-500 dark:text-zinc-200 mt-1">
                          Contact: {(student as any).parentContact}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startEditing(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Edit Student"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddMarks(student)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Add Marks"
                      >
                        <Award className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-zinc-200">Overall Performance</span>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-gray-800 dark:text-zinc-300">{averageScore}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${averageScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">Subject Progress:</p>
                    {progress.slice(0, 3).map((prog, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-zinc-200">{prog.subject}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{prog.score}%</span>
                          <div className="flex items-center">
                            {prog.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {prog.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />}
                            {prog.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full"></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-300">
                      <span>Subjects: {student.subjects.length}</span>
                      <span>Attendance: {progress[0]?.attendance || 85}%</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Marks Modal */}
      {showMarksModal && selectedStudentForMarks && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800  dark:text-zinc-200">
                Marks for {selectedStudentForMarks.name}
              </h2>
              <button
                onClick={() => {
                  setShowMarksModal(false);
                  setSelectedStudentForMarks(null);
                  setIsAddingMark(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Add Mark Form */}
              {isAddingMark ? (
                <div className="bg-gray-50 dark:bg-zinc-950 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-4 dark:text-zinc-200">Add New Mark</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                        Subject
                      </label>
                      <select
                        value={markForm.subject}
                        onChange={(e) => setMarkForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-xl dark:bg-zinc-950 "
                      >
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                        Test/Assignment Name *
                      </label>
                      <input
                        type="text"
                        value={markForm.testName}
                        onChange={(e) => setMarkForm(prev => ({ ...prev, testName: e.target.value }))}
                        placeholder="e.g., Unit Test 1, Quiz 2"
                        className="w-full p-3 border border-gray-200 rounded-xl  dark:bg-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                        Score Obtained *
                      </label>
                      <input
                        type="number"
                        value={markForm.score}
                        onChange={(e) => setMarkForm(prev => ({ ...prev, score: e.target.value }))}
                        placeholder="85"
                        className="w-full p-3 border border-gray-200 rounded-xl  dark:bg-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                        Maximum Score
                      </label>
                      <input
                        type="number"
                        value={markForm.maxScore}
                        onChange={(e) => setMarkForm(prev => ({ ...prev, maxScore: e.target.value }))}
                        placeholder="100"
                        className="w-full p-3 border border-gray-200 rounded-xl  dark:bg-zinc-950"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">
                        Remarks (Optional)
                      </label>
                      <textarea
                        value={markForm.remarks}
                        onChange={(e) => setMarkForm(prev => ({ ...prev, remarks: e.target.value }))}
                        placeholder="Good performance, needs improvement in..."
                        className="w-full p-3 border border-gray-200 rounded-xl  h-20 resize-none  dark:bg-zinc-950"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setIsAddingMark(false)}
                      className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 hover:dark:bg-zinc-900 text-sm transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveMark}
                      className="px-6 py-2  text-white rounded-xl border border-zinc-400 text-sm transition-all duration-200"
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
                    className="bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Mark</span>
                  </motion.button>
                </div>
              )}

              {/* Marks List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-zinc-200">Previous Marks</h3>
                {studentMarks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No marks recorded yet</p>
                    <p className="text-sm mt-2">Click "Add New Mark" to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {studentMarks.map((mark) => (
                      <div key={mark.id} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-800">{mark.testName}</h4>
                            <p className="text-sm text-gray-600">{mark.subject}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-teal-600">
                              {mark.score}/{mark.maxScore}
                            </div>
                            <div className="text-sm text-gray-500">
                              {mark.percentage}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{mark.date.toLocaleDateString()}</span>
                          {mark.remarks && (
                            <span className="italic">"{mark.remarks}"</span>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
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
    </div>
  );
};

export default StudentTracker;