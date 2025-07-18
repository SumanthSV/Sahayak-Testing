// Base64 encoded fonts for multilingual PDF generation
// IMPORTANT: Replace the placeholder strings below with actual Base64 content from your .txt files
// 
// To generate these Base64 strings, follow these steps:
// 1. Download Noto fonts from https://fonts.google.com/noto
// 2. Place .ttf files in a 'fonts' directory at your project root
// 3. Run these commands in your terminal:
//
// npx ttf2base64 ./fonts/NotoSans-Regular.ttf > ./fonts/NotoSans-Regular.txt
// npx ttf2base64 ./fonts/NotoSansDevanagari-Regular.ttf > ./fonts/NotoSansDevanagari-Regular.txt
// npx ttf2base64 ./fonts/NotoSansKannada-Regular.ttf > ./fonts/NotoSansKannada-Regular.txt
// npx ttf2base64 ./fonts/NotoSansTamil-Regular.ttf > ./fonts/NotoSansTamil-Regular.txt
// npx ttf2base64 ./fonts/NotoSansBengali-Regular.ttf > ./fonts/NotoSansBengali-Regular.txt
// npx ttf2base64 ./fonts/NotoSansGujarati-Regular.ttf > ./fonts/NotoSansGujarati-Regular.txt
//
// 4. Copy the content from each .txt file and paste it into the corresponding variable below

// PLACEHOLDER FONTS - Replace with actual Base64 content from your .txt files
export const NotoSansRegular = 'PASTE_NOTO_SANS_BASE64_HERE';
export const NotoSansDevanagariRegular = 'PASTE_NOTO_SANS_DEVANAGARI_BASE64_HERE';
export const NotoSansKannadaRegular = 'PASTE_NOTO_SANS_KANNADA_BASE64_HERE';
export const NotoSansTamilRegular = 'PASTE_NOTO_SANS_TAMIL_BASE64_HERE';
export const NotoSansBengaliRegular = 'PASTE_NOTO_SANS_BENGALI_BASE64_HERE';
export const NotoSansGujaratiRegular = 'PASTE_NOTO_SANS_GUJARATI_BASE64_HERE';

// Language to Base64 font data mapping
export const fontBase64Data: { [key: string]: string } = {
  en: NotoSansRegular,
  hi: NotoSansDevanagariRegular, // Hindi
  kn: NotoSansKannadaRegular,    // Kannada
  mr: NotoSansDevanagariRegular, // Marathi (uses Devanagari script)
  ta: NotoSansTamilRegular,      // Tamil
  bn: NotoSansBengaliRegular,    // Bengali
  gu: NotoSansGujaratiRegular,   // Gujarati
};

// Language to font family name mapping
export const fontMapping: { [key: string]: string } = {
  en: "NotoSans",
  hi: "NotoSansDevanagari",
  kn: "NotoSansKannada",
  mr: "NotoSansDevanagari", // Marathi uses same font as Hindi
  ta: "NotoSansTamil",
  bn: "NotoSansBengali",
  gu: "NotoSansGujarati"
};

// Font file names for pdfMake VFS
export const fontFileNames: { [key: string]: string } = {
  NotoSans: 'NotoSans-Regular.ttf',
  NotoSansDevanagari: 'NotoSansDevanagari-Regular.ttf',
  NotoSansKannada: 'NotoSansKannada-Regular.ttf',
  NotoSansTamil: 'NotoSansTamil-Regular.ttf',
  NotoSansBengali: 'NotoSansBengali-Regular.ttf',
  NotoSansGujarati: 'NotoSansGujarati-Regular.ttf',
};

// Helper function to get font for a specific language
export const getFontForLanguage = (language: string): string => {
  return fontMapping[language] || 'NotoSans';
};

// Helper function to check if font data is available
export const isFontAvailable = (language: string): boolean => {
  const fontData = fontBase64Data[language];
  return fontData && fontData !== 'PASTE_NOTO_SANS_BASE64_HERE' && fontData.length > 100;
};

// Helper function to get all available languages with fonts
export const getAvailableLanguages = (): string[] => {
  return Object.keys(fontBase64Data).filter(lang => isFontAvailable(lang));
};

// Language display names for UI
export const languageNames: { [key: string]: { native: string; english: string } } = {
  en: { native: 'English', english: 'English' },
  hi: { native: 'हिंदी', english: 'Hindi' },
  kn: { native: 'ಕನ್ನಡ', english: 'Kannada' },
  mr: { native: 'मराठी', english: 'Marathi' },
  ta: { native: 'தமிழ்', english: 'Tamil' },
  bn: { native: 'বাংলা', english: 'Bengali' },
  gu: { native: 'ગુજરાતી', english: 'Gujarati' },
};

// Font loading status for debugging
export const getFontStatus = (): { [key: string]: boolean } => {
  const status: { [key: string]: boolean } = {};
  Object.keys(fontBase64Data).forEach(lang => {
    status[lang] = isFontAvailable(lang);
  });
  return status;
};

// Validate font data integrity
export const validateFonts = (): { valid: boolean; missing: string[]; available: string[] } => {
  const missing: string[] = [];
  const available: string[] = [];
  
  Object.keys(fontBase64Data).forEach(lang => {
    if (isFontAvailable(lang)) {
      available.push(lang);
    } else {
      missing.push(lang);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing,
    available
  };
};

// Default fallback font configuration
export const defaultFontConfig = {
  fontFamily: 'NotoSans',
  fontSize: 12,
  lineHeight: 1.5,
  encoding: 'UTF-8'
};

// Font size recommendations by language (some scripts may need larger sizes)
export const fontSizeRecommendations: { [key: string]: number } = {
  en: 12,
  hi: 13, // Devanagari may need slightly larger size
  kn: 13, // Kannada may need slightly larger size
  mr: 13, // Marathi (Devanagari) may need slightly larger size
  ta: 12, // Tamil works well at standard size
  bn: 13, // Bengali may need slightly larger size
  gu: 13, // Gujarati may need slightly larger size
};

// Text direction for each language (for future RTL support if needed)
export const textDirection: { [key: string]: 'ltr' | 'rtl' } = {
  en: 'ltr',
  hi: 'ltr',
  kn: 'ltr',
  mr: 'ltr',
  ta: 'ltr',
  bn: 'ltr',
  gu: 'ltr',
};

// Export all font constants for easy access
export const fonts = {
  NotoSansRegular,
  NotoSansDevanagariRegular,
  NotoSansKannadaRegular,
  NotoSansTamilRegular,
  NotoSansBengaliRegular,
  NotoSansGujaratiRegular,
};

// Debug function to log font status
export const logFontStatus = (): void => {
  const status = getFontStatus();
  console.log('Font Status:', status);
  
  const validation = validateFonts();
  if (validation.valid) {
    console.log('✅ All fonts are loaded successfully');
  } else {
    console.warn('⚠️ Missing fonts for languages:', validation.missing);
    console.log('✅ Available fonts for languages:', validation.available);
  }
};