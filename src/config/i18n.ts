import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      storyGenerator: 'Story Generator',
      worksheetGenerator: 'Worksheet Generator',
      conceptExplainer: 'Concept Explainer',
      visualAids: 'Visual Aids',
      voiceAssessment: 'Voice Assessment',
      lessonPlanner: 'Lesson Planner',
      studentTracker: 'Student Tracker',
      settings: 'Settings',
      logout: 'Logout',
      
      // Common
      generate: 'Generate',
      save: 'Save',
      download: 'Download',
      copy: 'Copy',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      loading: 'Loading...',
      
      // Story Generator
      storyTitle: 'Hyper-Local Story Generator',
      storySubtitle: 'Create culturally relevant stories for your students',
      enterPrompt: 'Enter your story prompt...',
      generateStory: 'Generate Story',
      
      // Subjects
      mathematics: 'Mathematics',
      science: 'Science',
      english: 'English',
      hindi: 'Hindi',
      socialStudies: 'Social Studies',
      environmentalStudies: 'Environmental Studies',
      
      // Grades
      grade1: 'Grade 1',
      grade2: 'Grade 2',
      grade3: 'Grade 3',
      grade4: 'Grade 4',
      grade5: 'Grade 5',
      
      // Games
      games: 'Educational Games',
      mathChallenge: 'Math Challenge',
      brainPuzzles: 'Brain Puzzles',
      wordMaster: 'Word Master',
    }
  },
  hi: {
    translation: {
      // Navigation
      dashboard: 'डैशबोर्ड',
      storyGenerator: 'कहानी जेनरेटर',
      worksheetGenerator: 'वर्कशीट जेनरेटर',
      conceptExplainer: 'अवधारणा व्याख्याकार',
      visualAids: 'दृश्य सहायक',
      voiceAssessment: 'आवाज मूल्यांकन',
      lessonPlanner: 'पाठ योजनाकार',
      studentTracker: 'छात्र ट्रैकर',
      settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
      
      // Common
      generate: 'जेनरेट करें',
      save: 'सेव करें',
      download: 'डाउनलोड करें',
      copy: 'कॉपी करें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      cancel: 'रद्द करें',
      loading: 'लोड हो रहा है...',
      
      // Story Generator
      storyTitle: 'हाइपर-लोकल कहानी जेनरेटर',
      storySubtitle: 'अपने छात्रों के लिए सांस्कृतिक रूप से प्रासंगिक कहानियां बनाएं',
      enterPrompt: 'अपना कहानी प्रॉम्प्ट दर्ज करें...',
      generateStory: 'कहानी जेनरेट करें',
      
      // Subjects
      mathematics: 'गणित',
      science: 'विज्ञान',
      english: 'अंग्रेजी',
      hindi: 'हिंदी',
      socialStudies: 'सामाजिक अध्ययन',
      environmentalStudies: 'पर्यावरण अध्ययन',
      
      // Grades
      grade1: 'कक्षा 1',
      grade2: 'कक्षा 2',
      grade3: 'कक्षा 3',
      grade4: 'कक्षा 4',
      grade5: 'कक्षा 5',
      
      // Games
      games: 'शैक्षिक खेल',
      mathChallenge: 'गणित चुनौती',
      brainPuzzles: 'दिमागी पहेलियाँ',
      wordMaster: 'शब्द मास्टर',
    }
  },
  kn: {
    translation: {
      // Navigation
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      storyGenerator: 'ಕಥೆ ಜನರೇಟರ್',
      worksheetGenerator: 'ವರ್ಕ್‌ಶೀಟ್ ಜನರೇಟರ್',
      conceptExplainer: 'ಪರಿಕಲ್ಪನೆ ವಿವರಣೆಗಾರ',
      visualAids: 'ದೃಶ್ಯ ಸಹಾಯಕಗಳು',
      voiceAssessment: 'ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನ',
      lessonPlanner: 'ಪಾಠ ಯೋಜಕ',
      studentTracker: 'ವಿದ್ಯಾರ್ಥಿ ಟ್ರ್ಯಾಕರ್',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      logout: 'ಲಾಗ್‌ಔಟ್',
      
      // Common
      generate: 'ಜನರೇಟ್ ಮಾಡಿ',
      save: 'ಉಳಿಸಿ',
      download: 'ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
      copy: 'ಕಾಪಿ ಮಾಡಿ',
      edit: 'ಸಂಪಾದಿಸಿ',
      delete: 'ಅಳಿಸಿ',
      cancel: 'ರದ್ದುಗೊಳಿಸಿ',
      loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      
      // Story Generator
      storyTitle: 'ಹೈಪರ್-ಲೋಕಲ್ ಕಥೆ ಜನರೇಟರ್',
      storySubtitle: 'ನಿಮ್ಮ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸಾಂಸ್ಕೃತಿಕವಾಗಿ ಸಂಬಂಧಿತ ಕಥೆಗಳನ್ನು ರಚಿಸಿ',
      enterPrompt: 'ನಿಮ್ಮ ಕಥೆಯ ಪ್ರಾಂಪ್ಟ್ ನಮೂದಿಸಿ...',
      generateStory: 'ಕಥೆ ಜನರೇಟ್ ಮಾಡಿ',
      
      // Subjects
      mathematics: 'ಗಣಿತ',
      science: 'ವಿಜ್ಞಾನ',
      english: 'ಇಂಗ್ಲಿಷ್',
      hindi: 'ಹಿಂದಿ',
      socialStudies: 'ಸಾಮಾಜಿಕ ಅಧ್ಯಯನ',
      environmentalStudies: 'ಪರಿಸರ ಅಧ್ಯಯನ',
      
      // Grades
      grade1: 'ತರಗತಿ 1',
      grade2: 'ತರಗತಿ 2',
      grade3: 'ತರಗತಿ 3',
      grade4: 'ತರಗತಿ 4',
      grade5: 'ತರಗತಿ 5',
      
      // Games
      games: 'ಶೈಕ್ಷಣಿಕ ಆಟಗಳು',
      mathChallenge: 'ಗಣಿತ ಸವಾಲು',
      brainPuzzles: 'ಮೆದುಳಿನ ಒಗಟುಗಳು',
      wordMaster: 'ಪದ ಮಾಸ್ಟರ್',
    }
  },
  mr: {
    translation: {
      // Navigation
      dashboard: 'डॅशबोर्ड',
      storyGenerator: 'कथा जनरेटर',
      worksheetGenerator: 'वर्कशीट जनरेटर',
      conceptExplainer: 'संकल्पना स्पष्टीकरण',
      visualAids: 'दृश्य साधने',
      voiceAssessment: 'आवाज मूल्यमापन',
      lessonPlanner: 'धडा नियोजक',
      studentTracker: 'विद्यार्थी ट्रॅकर',
      settings: 'सेटिंग्ज',
      logout: 'लॉगआउट',
      
      // Common
      generate: 'जनरेट करा',
      save: 'सेव्ह करा',
      download: 'डाउनलोड करा',
      copy: 'कॉपी करा',
      edit: 'संपादित करा',
      delete: 'हटवा',
      cancel: 'रद्द करा',
      loading: 'लोड होत आहे...',
      
      // Story Generator
      storyTitle: 'हायपर-लोकल कथा जनरेटर',
      storySubtitle: 'तुमच्या विद्यार्थ्यांसाठी सांस्कृतिकदृष्ट्या संबंधित कथा तयार करा',
      enterPrompt: 'तुमचा कथा प्रॉम्प्ट टाका...',
      generateStory: 'कथा जनरेट करा',
      
      // Subjects
      mathematics: 'गणित',
      science: 'विज्ञान',
      english: 'इंग्रजी',
      hindi: 'हिंदी',
      socialStudies: 'सामाजिक अभ्यास',
      environmentalStudies: 'पर्यावरण अभ्यास',
      
      // Grades
      grade1: 'इयत्ता 1',
      grade2: 'इयत्ता 2',
      grade3: 'इयत्ता 3',
      grade4: 'इयत्ता 4',
      grade5: 'इयत्ता 5',
      
      // Games
      games: 'शैक्षणिक खेळ',
      mathChallenge: 'गणित आव्हान',
      brainPuzzles: 'मेंदूची कोडी',
      wordMaster: 'शब्द मास्टर',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;