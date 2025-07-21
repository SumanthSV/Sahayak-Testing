import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';
const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
export const geminiVisionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' });

export default genAI;