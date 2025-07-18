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