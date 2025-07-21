// Font mappings for different languages
export const fontMappings = {
  'en': 'Roboto',
  'hi': 'NotoSansDevanagari', 
  'kn': 'NotoSansKannada',
  'mr': 'NotoSansDevanagari',
  'ta': 'NotoSansTamil',
  'bn': 'NotoSansBengali',
  'gu': 'NotoSansGujarati'
};

// Check if font is available for a language
export const isFontAvailable = (language: string): boolean => {
  return language in fontMappings;
};

// Get font name for a language
export const getFontForLanguage = (language: string): string => {
  return fontMappings[language as keyof typeof fontMappings] || 'Roboto';
};

// Base64 font data (placeholder - in production, these would be actual font data)
export const fontBase64Data = {
  NotoSansDevanagari: 'data:font/truetype;base64,', // Hindi/Marathi font
  NotoSansKannada: 'data:font/truetype;base64,',    // Kannada font
  NotoSansTamil: 'data:font/truetype;base64,',      // Tamil font
  NotoSansBengali: 'data:font/truetype;base64,',    // Bengali font
  NotoSansGujarati: 'data:font/truetype;base64,',   // Gujarati font
};

export default fontMappings;