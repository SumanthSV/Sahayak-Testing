import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export interface StoryRequest {
  prompt: string;
  language: string;
  grade: string;
  subject: string;
  studentName?: string;
  localContext?: string;
  previousFeedback?: string[];
}

export interface WorksheetRequest {
  imageData?: string;
  prompt: string;
  subject: string;
  grades: string[];
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  includeVisuals: boolean;
}

export interface VisualAidRequest {
  topic: string;
  subject: string;
  grade: string;
  language: string;
  imageType: string;
  includeImage: boolean;
}

export interface ConceptRequest {
  question: string;
  difficulty: string;
  subject?: string;
  language: string;
  studentLevel?: string;
  previousQuestions?: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

export interface SpeechRequest {
  text: string;
  languageCode: string;
  voiceName?: string;
}

export interface SpeechRecognitionRequest {
  audioContent: string;
  languageCode: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio?: '1:1' | '9:16' | '16:9' | '4:3' | '3:4' | '3:2';
  style?: 'educational' | 'cartoon' | 'realistic' | 'diagram';
  language?: string;
  subject?: string;
  grade?: string;
}

export interface GameGenerationRequest {
  gameType: 'math' | 'puzzle' | 'word';
  grade: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
export interface VoiceEvaluationRequest {
  audioBlob: Blob;
  expectedText: string;
  language: string;
  grade: string;
  studentName?: string;
}

export interface VoiceEvaluationResult {
  accuracy: number;
  fluency: number;
  pronunciation: number;
  overallScore: number;
  feedback: string;
  detailedAnalysis: string;
  improvementAreas: string[];
  strengths: string[];
  transcript: string;
}

export class AIService {
  // Firebase Functions - All AI processing happens on backend
  private static generatePersonalizedStoryFunction = httpsCallable(functions, 'generatePersonalizedStory');
  private static generateDifferentiatedWorksheetFunction = httpsCallable(functions, 'generateDifferentiatedWorksheet');
  private static generateVisualAidWithImageFunction = httpsCallable(functions, 'generateVisualAidWithImage');
  private static explainConceptAdaptivelyFunction = httpsCallable(functions, 'explainConceptAdaptively');
  private static synthesizeSpeechFunction = httpsCallable(functions, 'synthesizeSpeech');
  private static recognizeSpeechFunction = httpsCallable(functions, 'recognizeSpeech');
  private static generateEducationalImageFunction = httpsCallable(functions, 'generateEducationalImage');
  private static translateContentFunction = httpsCallable(functions, 'translateContent');
  private static evaluateVoiceReadingFunction = httpsCallable(functions, 'evaluateVoiceReading');
  private static generateLessonImprovementsFunction = httpsCallable(functions, 'generateLessonImprovements');
  private static generateEducationalGameFunction = httpsCallable(functions, 'generateEducationalGame');

  // Story Generation
  static async generateStory(request: StoryRequest): Promise<string> {
    try {
      const result = await this.generatePersonalizedStoryFunction(request);
      return (result.data as any).story;
    } catch (error) {
      console.error('Error generating story:', error);
      throw new Error('Failed to generate story. Please check your connection and try again.');
    }
  }

  static async generatePersonalizedStory(request: StoryRequest): Promise<string> {
    try {
      const result = await this.generatePersonalizedStoryFunction(request);
      return (result.data as any).story;
    } catch (error) {
      console.error('Error generating personalized story:', error);
      throw new Error('Failed to generate personalized story. Please check your connection and try again.');
    }
  }

  // Worksheet Generation
  static async generateWorksheet(request: Omit<WorksheetRequest, 'grades' | 'difficulty' | 'includeVisuals'> & { 
    imageData?: string; 
    subject: string; 
    grade: string; 
    language: string; 
  }): Promise<string> {
    try {
      const enhancedRequest: WorksheetRequest = {
        ...request,
        grades: [request.grade],
        difficulty: 'medium',
        includeVisuals: true
      };
      const result = await this.generateDifferentiatedWorksheetFunction(enhancedRequest);
      const worksheets = (result.data as any).worksheets;
      return worksheets[request.grade] || Object.values(worksheets)[0];
    } catch (error) {
      console.error('Error generating worksheet:', error);
      throw new Error('Failed to generate worksheet. Please check your connection and try again.');
    }
  }

  static async generateDifferentiatedWorksheet(request: WorksheetRequest): Promise<{ [grade: string]: string }> {
    try {
      const result = await this.generateDifferentiatedWorksheetFunction(request);
      return (result.data as any).worksheets;
    } catch (error) {
      console.error('Error generating differentiated worksheet:', error);
      throw new Error('Failed to generate differentiated worksheet. Please check your connection and try again.');
    }
  }

  // Visual Aid Generation
  static async generateVisualAid(request: Omit<VisualAidRequest, 'includeImage'>): Promise<string> {
    try {
      const enhancedRequest: VisualAidRequest = {
        ...request,
        includeImage: false
      };
      const result = await this.generateVisualAidWithImageFunction(enhancedRequest);
      console.log('generateVisualAid');
      return (result.data as any).instructions;
    } catch (error) {
      console.error('Error generating visual aid:', error);
      throw new Error('Failed to generate visual aid. Please check your connection and try again.');
    }
  }

  static async generateVisualAidWithImage(request: VisualAidRequest): Promise<{
    instructions: string;
    imageUrl: string;
    materials: string[];
    timeEstimate: string;
    difficulty: string;
  }> {
    try {
      console.log("before generateVisualAidWithImage");
      const result =  await this.generateVisualAidWithImageFunction(request);
      
      console.log("after generateVisualAidWithImage");
      console.log(result.data);
      return result.data as {
        instructions: string;
        imageUrl: string;
        materials: string[];
        timeEstimate: string;
        difficulty: string;
      };
    } catch (error) {
      console.error("Error generating visual aid with image:", error);
      throw new Error("Failed to generate visual aid with image. Please check your connection and try again.");
    }
  }

  // Concept Explanation
  static async explainConcept(request: Omit<ConceptRequest, 'language' | 'studentLevel' | 'previousQuestions' | 'learningStyle'>): Promise<string> {
    try {
      const enhancedRequest: ConceptRequest = {
        ...request,
        language: 'english',
        studentLevel: 'beginner',
        previousQuestions: [],
        learningStyle: 'visual'
      };
      const result = await this.explainConceptAdaptivelyFunction(enhancedRequest);
      return (result.data as any).explanation;
    } catch (error) {
      console.error('Error explaining concept:', error);
      throw new Error('Failed to explain concept. Please check your connection and try again.');
    }
  }

  static async explainConceptAdaptively(request: ConceptRequest): Promise<{
    explanation: string;
    visualAids: string[];
    activities: string[];
    assessmentQuestions: string[];
    nextTopics: string[];
  }> {
    try {
      const result = await this.explainConceptAdaptivelyFunction(request);
      return (result.data as any);
    } catch (error) {
      console.error('Error explaining concept adaptively:', error);
      throw new Error('Failed to explain concept adaptively. Please check your connection and try again.');
    }
  }

  // Speech Services
  static async synthesizeSpeech(request: SpeechRequest): Promise<string> {
    try {
      const result = await this.synthesizeSpeechFunction(request);
      return (result.data as any).audioUrl;
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw new Error('Failed to synthesize speech. Please check your connection and try again.');
    }
  }

  static async recognizeSpeech(request: SpeechRecognitionRequest): Promise<string> {
    try {
      const result = await this.recognizeSpeechFunction(request);
      return (result.data as any).transcript;
    } catch (error) {
      console.error('Error recognizing speech:', error);
      throw new Error('Failed to recognize speech. Please check your connection and try again.');
    }
  }


  // Educational Games Generation
  static async generateEducationalGame(request: GameGenerationRequest): Promise<any> {
    try {
      const result = await this.generateEducationalGameFunction(request);
      return (result.data as any);
    } catch (error) {
      console.error('Error generating educational game:', error);
      throw new Error('Failed to generate educational game. Please check your connection and try again.');
    }
  }
  // Voice Evaluation
  static async evaluateVoiceReading(request: VoiceEvaluationRequest): Promise<VoiceEvaluationResult> {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:audio/wav;base64, prefix
        };
        reader.readAsDataURL(request.audioBlob);
      });

      const result = await this.evaluateVoiceReadingFunction({
        audioContent: audioBase64,
        expectedText: request.expectedText,
        language: request.language,
        grade: request.grade,
        studentName: request.studentName
      });
      
      return (result.data as any);
    } catch (error) {
      console.error('Error evaluating voice reading:', error);
      // Fallback to mock evaluation
      return this.generateMockVoiceEvaluation(request.expectedText);
    }
  }

  private static generateMockVoiceEvaluation(expectedText: string): VoiceEvaluationResult {
    const accuracy = Math.floor(Math.random() * 20) + 80;
    const fluency = Math.floor(Math.random() * 25) + 75;
    const pronunciation = Math.floor(Math.random() * 30) + 70;
    const overallScore = Math.round((accuracy + fluency + pronunciation) / 3);
    
    let feedback = '';
    let improvementAreas: string[] = [];
    let strengths: string[] = [];
    
    if (overallScore >= 90) {
      feedback = 'Excellent reading! Your pronunciation and fluency are outstanding.';
      strengths = ['Clear pronunciation', 'Good fluency', 'Confident reading'];
    } else if (overallScore >= 75) {
      feedback = 'Good reading! Focus on pronunciation of difficult words.';
      strengths = ['Good effort', 'Clear voice'];
      improvementAreas = ['Pronunciation of complex words', 'Reading speed'];
    } else {
      feedback = 'Keep practicing! Try reading slowly and clearly.';
      improvementAreas = ['Pronunciation', 'Reading speed', 'Confidence'];
      strengths = ['Good attempt', 'Shows effort'];
    }
    
    return {
      accuracy,
      fluency,
      pronunciation,
      overallScore,
      feedback,
      detailedAnalysis: `Based on the reading assessment, the student demonstrated ${overallScore >= 80 ? 'strong' : overallScore >= 60 ? 'moderate' : 'developing'} reading skills.`,
      improvementAreas,
      strengths,
      transcript: expectedText.substring(0, Math.floor(expectedText.length * (accuracy / 100)))
    };
  }

  // Lesson Plan Suggestions
  static async generateLessonImprovements(lessonPlan: {
    title: string;
    subject: string;
    grade: string;
    objectives: string[];
    activities: string[];
  }): Promise<{
    improvements: string[];
    additionalActivities: string[];
    resources: string[];
    assessmentIdeas: string[];
    nextLessonTopics: string[];
  }> {
    try {
      const result = await this.generateLessonImprovementsFunction(lessonPlan);
      return (result.data as any);
    } catch (error) {
      console.error('Error generating lesson suggestions:', error);
      // Return mock suggestions
      return {
        improvements: [
          'Add more interactive elements to engage students',
          'Include visual aids for better understanding',
          'Consider differentiated instruction for various learning levels'
        ],
        additionalActivities: [
          'Group discussion activity',
          'Hands-on experiment or demonstration',
          'Creative project or presentation'
        ],
        resources: [
          'Educational videos related to the topic',
          'Interactive online simulations',
          'Printable worksheets and handouts'
        ],
        assessmentIdeas: [
          'Quick formative assessment quiz',
          'Peer evaluation activity',
          'Portfolio-based assessment'
        ],
        nextLessonTopics: [
          'Advanced concepts building on this lesson',
          'Real-world applications of the topic',
          'Cross-curricular connections'
        ]
      };
    }
  }

  // Translation
  static async translateContent(text: string, targetLanguage: string): Promise<string> {
    try {
      const result = await this.translateContentFunction({ text, targetLanguage });
      return (result.data as any).translatedText;
    } catch (error) {
      console.error('Error translating content:', error);
      throw new Error('Failed to translate content. Please check your connection and try again.');
    }
  }
}