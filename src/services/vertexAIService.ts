import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export interface VisualAidWithImageRequest {
  topic: string;
  subject: string;
  grade: string;
  language: string;
  includeImage: boolean;
}

export class VertexAIService {
  private static generateVisualAidWithImageFunction = httpsCallable(functions, 'generateVisualAidWithImage');

  static async generateVisualAidWithImage(request: VisualAidWithImageRequest): Promise<{
    instructions: string;
    imageUrl?: string;
    materials: string[];
    timeEstimate: string;
    difficulty: string;
  }> {
    try {
      const result = await this.generateVisualAidWithImageFunction(request);
      return (result.data as any);
    } catch (error) {
      console.error('Error generating visual aid with image:', error);
      throw new Error('Failed to generate visual aid with image. Please check your connection and try again.');
    }
  }
}