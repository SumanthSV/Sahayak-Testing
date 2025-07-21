import { getStorage, uploadString } from "firebase/storage";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  enableNetwork,
  disableNetwork,
  serverTimestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User,
  updateProfile
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../config/firebase';


export interface Teacher {
  email: string;
  name: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  rollNumber: string;
  teacherId: string;
  subjects: string[];
  marks?: Record<string, { score: number; maxScore: number; date: Date; subject: string }[]>;
  attendance?: Record<string, boolean>; // date -> present/absent
  createdAt: Date;
  lastAssessment?: Date;
  performance?: Record<string, number>;
}

export interface StudentMark {
  id: string;
  studentId: string;
  teacherId: string;
  subject: string;
  testName: string;
  score: number;
  maxScore: number;
  percentage: number;
  date: Date;
  remarks?: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageBase64: string;
  style: string;
  aspectRatio: string;
  subject?: string;
  grade?: string;
  teacherId: string;
  createdAt: Date;
  tags?: string[];
}

export interface UserData {
  teacherId: string;
  generatedContent: GeneratedContent[];
  images: GeneratedImage[];
  students: Student[];
  lessonPlans: LessonPlan[];
  assessments: Assessment[];
  marks: StudentMark[];
}

export interface GeneratedContent {
  id: string;
  type: string;
  title: string;
  content: string;
  subject: string;
  grade: string;
  language: string;
  teacherId: string;
  createdAt: Date;
  isOffline?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  week: string;
  objectives: string[];
  activities: string[];
  resources: string[];
  assessment: string;
  teacherId: string;
  createdAt: Date;
  status?: 'draft' | 'active' | 'completed';
}

export interface Assessment {
  id: string;
  studentId: string;
  teacherId: string;
  type: 'reading' | 'comprehension' | 'speaking';
  subject: string;
  score: number;
  feedback: string;
  audioUrl?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export class FirebaseService {

  static uploadImageToStorage = async (base64: string, path: string) => {
    const imageRef = ref(storage, path);
    await uploadString(imageRef, base64, 'base64');
    const url = await getDownloadURL(imageRef);
    return url;
  };

  // Authentication
  static async signIn(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login
    if (result.user) {
      await this.updateLastLogin(result.user.uid);
    }
    
    return result.user;
  }

  static async signUp(email: string, password: string, teacherData: Partial<Teacher>): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const uid = result.user.uid;
    
    await updateProfile(result.user, {
      displayName: teacherData.name 
    });
    
    const userRef = doc(db, "users", uid);
    const name = teacherData.name;
    
    await setDoc(userRef, {
      uid,
      name,
      email,
      createdAt: serverTimestamp()
    });
    
    return result.user;
  }

  static async signOut(): Promise<void> {
    // Clear user-specific localStorage data
    const user = auth.currentUser;
    if (user) {
      this.clearUserLocalStorage(user.uid);
    }
    await firebaseSignOut(auth);
  }

  // Teacher Profile Management
  static async getTeacherProfile(userId: string): Promise<Teacher | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const q = query(collection(db, 'teachers'), where('email', '==', user.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate() || new Date()
        } as Teacher;
      }
      return null;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      return null;
    }
  }

  static async updateTeacherProfile(teacherId: string, updates: Partial<Teacher>): Promise<void> {
    await updateDoc(doc(db, 'teachers', teacherId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  private static async updateLastLogin(userId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'teachers'), where('email', '==', user.email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const teacherDoc = snapshot.docs[0];
        await updateDoc(teacherDoc.ref, {
          lastLogin: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Content Management with User Scoping
  static async saveGeneratedContent(content: Omit<GeneratedContent, 'id'>): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Check if auto-save is enabled
    const settings = JSON.parse(localStorage.getItem(`settings_${user.uid}`) || '{}');
    const autoSaveEnabled = settings.autoSaveContent;
    
    try {
      const docRef = await addDoc(collection(db, 'generated_content'), {
        ...content,
        createdAt: serverTimestamp(),
        tags: content.tags || [],
        metadata: content.metadata || {}
      });
      
      // If auto-save is enabled, also save to user-scoped local storage
      if (autoSaveEnabled) {
        const offlineContent = { 
          ...content, 
          id: docRef.id, 
          isOffline: false,
          createdAt: new Date()
        };
        this.saveToUserLocalStorage(user.uid, 'auto_saved_content', offlineContent);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving content:', error);
      // Save to user-scoped local storage if offline
      const offlineContent = { 
        ...content, 
        id: Date.now().toString(), 
        isOffline: true,
        createdAt: new Date()
      };
      this.saveToUserLocalStorage(user.uid, 'offline_content', offlineContent);
      
      // Also save to auto-save if enabled
      if (autoSaveEnabled) {
        this.saveToUserLocalStorage(user.uid, 'auto_saved_content', offlineContent);
      }
      
      return offlineContent.id;
    }
  }

  static async getGeneratedContent(teacherId: string, type?: string): Promise<GeneratedContent[]> {
    try {
      let q = query(
        collection(db, 'generated_content'),
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      if (type) {
        q = query(
          collection(db, 'generated_content'),
          where('teacherId', '==', teacherId),
          where('type', '==', type),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      }

      const snapshot = await getDocs(q);
      const content = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as GeneratedContent;
      });

      // Merge with user-scoped offline content
      const offlineContent = this.getFromUserLocalStorage(teacherId, 'offline_content') || [];
      const autoSavedContent = this.getFromUserLocalStorage(teacherId, 'auto_saved_content') || [];
      return [...content, ...offlineContent, ...autoSavedContent];
    } catch (error) {
      console.error('Error fetching content:', error);
      // Return user-scoped offline content if network unavailable
      const offlineContent = this.getFromUserLocalStorage(teacherId, 'offline_content') || [];
      const autoSavedContent = this.getFromUserLocalStorage(teacherId, 'auto_saved_content') || [];
      return [...offlineContent, ...autoSavedContent];
    }
  }

  static async deleteGeneratedContent(contentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'generated_content', contentId));
    } catch (error) {
      console.error('Error deleting content:', error);
      const user = auth.currentUser;
      if (user) {
        this.saveToUserLocalStorage(user.uid, 'pending_deletions', { type: 'content', id: contentId });
      }
    }
  }

  // Student Management
  static async addStudent(student: Omit<Student, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'students'), {
        ...student,
        createdAt: serverTimestamp(),
        performance: {}
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding student:', error);
      const user = auth.currentUser;
      if (user) {
        const offlineStudent = { 
          ...student, 
          id: Date.now().toString(),
          createdAt: new Date(),
          performance: {}
        };
        this.saveToUserLocalStorage(user.uid, 'offline_students', offlineStudent);
        return offlineStudent.id;
      }
      throw error;
    }
  }

  static async getStudents(teacherId: string): Promise<Student[]> {
    try {
      const q = query(
        collection(db, 'students'),
        where('teacherId', '==', teacherId),
        orderBy('name')
      );
      const snapshot = await getDocs(q);
      const students = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastAssessment: data.lastAssessment?.toDate()
        } as Student;
      });

      // Merge with user-scoped offline students
      const offlineStudents = this.getFromUserLocalStorage(teacherId, 'offline_students') || [];
      return [...students, ...offlineStudents];
    } catch (error) {
      console.error('Error fetching students:', error);
      return this.getFromUserLocalStorage(teacherId, 'offline_students') || [];
    }
  }

  static async updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating student:', error);
      const user = auth.currentUser;
      if (user) {
        this.saveToUserLocalStorage(user.uid, 'pending_updates', { 
          type: 'student', 
          id: studentId, 
          updates 
        });
      }
    }
  }

  static async deleteStudent(studentId: string): Promise<void> {
    try {
      // Delete student and all related assessments
      const batch = writeBatch(db);
      
      // Delete student
      batch.delete(doc(db, 'students', studentId));
      
      // Delete related assessments
      const assessmentsQuery = query(
        collection(db, 'assessments'),
        where('studentId', '==', studentId)
      );
      const assessmentsSnapshot = await getDocs(assessmentsQuery);
      assessmentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting student:', error);
      const user = auth.currentUser;
      if (user) {
        this.saveToUserLocalStorage(user.uid, 'pending_deletions', { type: 'student', id: studentId });
      }
    }
  }

  // Assessment Management
  static async saveAssessment(assessment: Omit<Assessment, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'assessments'), {
        ...assessment,
        createdAt: serverTimestamp()
      });

      // Update student's last assessment date
      await this.updateStudent(assessment.studentId, {
        lastAssessment: new Date()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error saving assessment:', error);
      const user = auth.currentUser;
      if (user) {
        const offlineAssessment = {
          ...assessment,
          id: Date.now().toString(),
          createdAt: new Date()
        };
        this.saveToUserLocalStorage(user.uid, 'offline_assessments', offlineAssessment);
        return offlineAssessment.id;
      }
      throw error;
    }
  }

  static async getAssessments(teacherId: string, studentId?: string): Promise<Assessment[]> {
    try {
      let q = query(
        collection(db, 'assessments'),
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      if (studentId) {
        q = query(
          collection(db, 'assessments'),
          where('teacherId', '==', teacherId),
          where('studentId', '==', studentId),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const assessments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Assessment;
      });

      // Merge with user-scoped offline assessments
      const offlineAssessments = this.getFromUserLocalStorage(teacherId, 'offline_assessments') || [];
      return [...assessments, ...offlineAssessments];
    } catch (error) {
      console.error('Error fetching assessments:', error);
      return this.getFromUserLocalStorage(teacherId, 'offline_assessments') || [];
    }
  }

  // Lesson Plans
  static async saveLessonPlan(plan: Omit<LessonPlan, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'lesson_plans'), {
        ...plan,
        createdAt: serverTimestamp(),
        status: plan.status || 'draft'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving lesson plan:', error);
      const user = auth.currentUser;
      if (user) {
        const offlinePlan = { 
          ...plan, 
          id: Date.now().toString(),
          createdAt: new Date(),
          status: plan.status || 'draft'
        };
        this.saveToUserLocalStorage(user.uid, 'offline_lesson_plans', offlinePlan);
        return offlinePlan.id;
      }
      throw error;
    }
  }

  static async getLessonPlans(teacherId: string): Promise<LessonPlan[]> {
    try {
      const q = query(
        collection(db, 'lesson_plans'),
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const plans = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as LessonPlan;
      });

      // Merge with user-scoped offline plans
      const offlinePlans = this.getFromUserLocalStorage(teacherId, 'offline_lesson_plans') || [];
      return [...plans, ...offlinePlans];
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      return this.getFromUserLocalStorage(teacherId, 'offline_lesson_plans') || [];
    }
  }

  static async updateLessonPlan(planId: string, updates: Partial<LessonPlan>): Promise<void> {
    try {
      await updateDoc(doc(db, 'lesson_plans', planId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating lesson plan:', error);
      const user = auth.currentUser;
      if (user) {
        this.saveToUserLocalStorage(user.uid, 'pending_updates', {
          type: 'lesson_plan',
          id: planId,
          updates
        });
      }
    }
  }

  // File Upload
  static async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Student Marks Management
  static async addStudentMark(mark: Omit<StudentMark, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'student_marks'), {
        ...mark,
        createdAt: serverTimestamp(),
        percentage: Math.round((mark.score / mark.maxScore) * 100)
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding student mark:', error);
      const user = auth.currentUser;
      if (user) {
        const offlineMark = {
          ...mark,
          id: Date.now().toString(),
          createdAt: new Date(),
          percentage: Math.round((mark.score / mark.maxScore) * 100)
        };
        this.saveToUserLocalStorage(user.uid, 'offline_marks', offlineMark);
        return offlineMark.id;
      }
      throw error;
    }
  }

  static async getStudentMarks(teacherId: string, studentId?: string): Promise<StudentMark[]> {
    try {
      let q = query(
        collection(db, 'student_marks'),
        where('teacherId', '==', teacherId),
        orderBy('date', 'desc')
      );

      if (studentId) {
        q = query(
          collection(db, 'student_marks'),
          where('teacherId', '==', teacherId),
          where('studentId', '==', studentId),
          orderBy('date', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const marks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        } as StudentMark;
      });

      const offlineMarks = this.getFromUserLocalStorage(teacherId, 'offline_marks') || [];
      return [...marks, ...offlineMarks];
    } catch (error) {
      console.error('Error fetching student marks:', error);
      return this.getFromUserLocalStorage(teacherId, 'offline_marks') || [];
    }
  }

  static async updateStudentMark(markId: string, updates: Partial<StudentMark>): Promise<void> {
    try {
      const updateData = { ...updates };
      if (updates.score && updates.maxScore) {
        updateData.percentage = Math.round((updates.score / updates.maxScore) * 100);
      }
      
      await updateDoc(doc(db, 'student_marks', markId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating student mark:', error);
      const user = auth.currentUser;
      if (user) {
        this.saveToUserLocalStorage(user.uid, 'pending_updates', {
          type: 'student_mark',
          id: markId,
          updates
        });
      }
    }
  }

  static async deleteStudentMark(markId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'student_marks', markId));
    } catch (error) {
      console.error('Error deleting student mark:', error);
      const user = auth.currentUser;
      if (user) {
        this.saveToUserLocalStorage(user.uid, 'pending_deletions', { type: 'student_mark', id: markId });
      }
    }
  }

  // Generated Images Management
  static async saveGeneratedImage(image: Omit<GeneratedImage, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'generated_images'), {
        ...image,
        createdAt: serverTimestamp(),
        tags: image.tags || []
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving generated image:', error);
      const user = auth.currentUser;
      if (user) {
        const offlineImage = {
          ...image,
          id: Date.now().toString(),
          createdAt: new Date()
        };
        this.saveToUserLocalStorage(user.uid, 'offline_images', offlineImage);
        return offlineImage.id;
      }
      throw error;
    }
  }

  static async getGeneratedImages(teacherId: string): Promise<GeneratedImage[]> {
    try {
      const q = query(
        collection(db, 'generated_images'),
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const images = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as GeneratedImage;
      });

      const offlineImages = this.getFromUserLocalStorage(teacherId, 'offline_images') || [];
      return [...images, ...offlineImages];
    } catch (error) {
      console.error('Error fetching generated images:', error);
      return this.getFromUserLocalStorage(teacherId, 'offline_images') || [];
    }
  }

  static async deleteGeneratedImage(imageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'generated_images', imageId));
    } catch (error) {
      console.error('Error deleting generated image:', error);
      const user = auth.currentUser;
      if (user) {
        this.saveToUserLocalStorage(user.uid, 'pending_deletions', { type: 'generated_image', id: imageId });
      }
    }
  }

  // Comprehensive User Data
  static async getUserData(teacherId: string): Promise<UserData> {
    try {
      const [content, images, students, lessonPlans, assessments, marks] = await Promise.all([
        this.getGeneratedContent(teacherId),
        this.getGeneratedImages(teacherId),
        this.getStudents(teacherId),
        this.getLessonPlans(teacherId),
        this.getAssessments(teacherId),
        this.getStudentMarks(teacherId)
      ]);

      return {
        teacherId,
        generatedContent: content,
        images,
        students,
        lessonPlans,
        assessments,
        marks
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {
        teacherId,
        generatedContent: [],
        images: [],
        students: [],
        lessonPlans: [],
        assessments: [],
        marks: []
      };
    }
  }

  // Analytics and Statistics
  static async getTeacherStats(teacherId: string): Promise<Record<string, any>> {
    try {
      const [content, students, assessments, plans, marks, images] = await Promise.all([
        this.getGeneratedContent(teacherId),
        this.getStudents(teacherId),
        this.getAssessments(teacherId),
        this.getLessonPlans(teacherId),
        this.getStudentMarks(teacherId),
        this.getGeneratedImages(teacherId)
      ]);

      return {
        totalContent: content.length,
        totalStudents: students.length,
        totalAssessments: assessments.length,
        totalLessonPlans: plans.length,
        totalMarks: marks.length,
        totalImages: images.length,
        contentByType: content.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        studentsByGrade: students.reduce((acc, student) => {
          acc[student.grade] = (acc[student.grade] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        averageMarks: marks.length > 0 ? Math.round(marks.reduce((sum, mark) => sum + mark.percentage, 0) / marks.length) : 0,
        recentActivity: content.slice(0, 5).map(item => ({
          type: item.type,
          title: item.title,
          date: item.createdAt
        }))
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {};
    }
  }

  // Offline Support
  static async enableOfflineMode(): Promise<void> {
    try {
      await disableNetwork(db);
    } catch (error) {
      console.error('Error enabling offline mode:', error);
    }
  }

  static async enableOnlineMode(): Promise<void> {
    try {
      await enableNetwork(db);
      await this.syncOfflineData();
    } catch (error) {
      console.error('Error enabling online mode:', error);
    }
  }

  // User-Scoped Local Storage Helpers
  private static saveToUserLocalStorage(userId: string, key: string, data: any): void {
    try {
      const userKey = `${key}_${userId}`;
      const existing = JSON.parse(localStorage.getItem(userKey) || '[]');
      existing.push(data);
      localStorage.setItem(userKey, JSON.stringify(existing));
    } catch (error) {
      console.error('Error saving to user localStorage:', error);
    }
  }

  private static getFromUserLocalStorage(userId: string, key: string): any[] {
    try {
      const userKey = `${key}_${userId}`;
      return JSON.parse(localStorage.getItem(userKey) || '[]');
    } catch (error) {
      console.error('Error reading from user localStorage:', error);
      return [];
    }
  }

  private static clearUserLocalStorage(userId: string): void {
    try {
      const keysToRemove = Object.keys(localStorage).filter(key => key.endsWith(`_${userId}`));
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing user localStorage:', error);
    }
  }

  // Sync offline data when back online
  static async syncOfflineData(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userId = user.uid;
      const offlineContent = this.getFromUserLocalStorage(userId, 'offline_content');
      const offlineStudents = this.getFromUserLocalStorage(userId, 'offline_students');
      const offlinePlans = this.getFromUserLocalStorage(userId, 'offline_lesson_plans');
      const offlineAssessments = this.getFromUserLocalStorage(userId, 'offline_assessments');
      const offlineMarks = this.getFromUserLocalStorage(userId, 'offline_marks');
      const offlineImages = this.getFromUserLocalStorage(userId, 'offline_images');
      const pendingUpdates = this.getFromUserLocalStorage(userId, 'pending_updates');
      const pendingDeletions = this.getFromUserLocalStorage(userId, 'pending_deletions');

      // Sync content
      for (const content of offlineContent) {
        try {
          const { id, isOffline, ...contentData } = content;
          await addDoc(collection(db, 'generated_content'), {
            ...contentData,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Failed to sync content:', error);
        }
      }

      // Sync students
      for (const student of offlineStudents) {
        try {
          const { id, ...studentData } = student;
          await addDoc(collection(db, 'students'), {
            ...studentData,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Failed to sync student:', error);
        }
      }

      // Sync lesson plans
      for (const plan of offlinePlans) {
        try {
          const { id, ...planData } = plan;
          await addDoc(collection(db, 'lesson_plans'), {
            ...planData,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Failed to sync lesson plan:', error);
        }
      }

      // Sync assessments
      for (const assessment of offlineAssessments) {
        try {
          const { id, ...assessmentData } = assessment;
          await addDoc(collection(db, 'assessments'), {
            ...assessmentData,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Failed to sync assessment:', error);
        }
      }

      // Sync marks
      for (const mark of offlineMarks) {
        try {
          const { id, ...markData } = mark;
          await addDoc(collection(db, 'student_marks'), {
            ...markData,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Failed to sync mark:', error);
        }
      }

      // Sync images
      for (const image of offlineImages) {
        try {
          const { id, ...imageData } = image;
          await addDoc(collection(db, 'generated_images'), {
            ...imageData,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Failed to sync image:', error);
        }
      }

      // Process pending updates
      for (const update of pendingUpdates) {
        try {
          const { type, id, updates } = update;
          let collectionName = 'generated_content';
          if (type === 'student') collectionName = 'students';
          else if (type === 'lesson_plan') collectionName = 'lesson_plans';
          else if (type === 'student_mark') collectionName = 'student_marks';
          
          await updateDoc(doc(db, collectionName, id), {
            ...updates,
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Failed to process pending update:', error);
        }
      }

      // Process pending deletions
      for (const deletion of pendingDeletions) {
        try {
          const { type, id } = deletion;
          let collectionName = 'generated_content';
          if (type === 'student') collectionName = 'students';
          else if (type === 'content') collectionName = 'generated_content';
          else if (type === 'lesson_plan') collectionName = 'lesson_plans';
          else if (type === 'student_mark') collectionName = 'student_marks';
          else if (type === 'generated_image') collectionName = 'generated_images';
          
          await deleteDoc(doc(db, collectionName, id));
        } catch (error) {
          console.error('Failed to process pending deletion:', error);
        }
      }

      // Clear synced data for this user
      const userKeys = [
        'offline_content',
        'offline_students', 
        'offline_lesson_plans',
        'offline_assessments',
        'offline_marks',
        'offline_images',
        'pending_updates',
        'pending_deletions'
      ];
      
      userKeys.forEach(key => {
        localStorage.removeItem(`${key}_${userId}`);
      });

      console.log('Offline data synced successfully');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  // Real-time listeners
  static subscribeToContent(teacherId: string, callback: (content: GeneratedContent[]) => void): () => void {
    const q = query(
      collection(db, 'generated_content'),
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const content = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as GeneratedContent;
      });
      callback(content);
    });
  }

  static subscribeToStudents(teacherId: string, callback: (students: Student[]) => void): () => void {
    const q = query(
      collection(db, 'students'),
      where('teacherId', '==', teacherId),
      orderBy('name')
    );

    return onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastAssessment: data.lastAssessment?.toDate()
        } as Student;
      });
      callback(students);
    });
  }
}