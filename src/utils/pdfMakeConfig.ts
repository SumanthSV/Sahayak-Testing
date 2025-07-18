// pdfMake configuration with multilingual font support
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  NotoSansRegular,
  NotoSansDevanagariRegular,
  NotoSansKannadaRegular,
  NotoSansTamilRegular,
  NotoSansBengaliRegular,
  NotoSansGujaratiRegular,
  fontFileNames,
  isFontAvailable
} from './fonts/fontBase64';

// Initialize pdfMake's virtual file system with default fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Add custom multilingual fonts to the virtual file system
// Only add fonts that have actual Base64 data (not placeholders)
if (isFontAvailable('en')) {
  pdfMake.vfs[fontFileNames.NotoSans] = NotoSansRegular;
}
if (isFontAvailable('hi')) {
  pdfMake.vfs[fontFileNames.NotoSansDevanagari] = NotoSansDevanagariRegular;
}
if (isFontAvailable('kn')) {
  pdfMake.vfs[fontFileNames.NotoSansKannada] = NotoSansKannadaRegular;
}
if (isFontAvailable('ta')) {
  pdfMake.vfs[fontFileNames.NotoSansTamil] = NotoSansTamilRegular;
}
if (isFontAvailable('bn')) {
  pdfMake.vfs[fontFileNames.NotoSansBengali] = NotoSansBengaliRegular;
}
if (isFontAvailable('gu')) {
  pdfMake.vfs[fontFileNames.NotoSansGujarati] = NotoSansGujaratiRegular;
}

// Define font families for pdfMake
const fontDefinitions: any = {
  // Default Roboto font (fallback)
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

// Add custom fonts only if they're available
if (isFontAvailable('en')) {
  fontDefinitions.NotoSans = {
    normal: fontFileNames.NotoSans,
    bold: fontFileNames.NotoSans,
    italics: fontFileNames.NotoSans,
    bolditalics: fontFileNames.NotoSans,
  };
}

if (isFontAvailable('hi')) {
  fontDefinitions.NotoSansDevanagari = {
    normal: fontFileNames.NotoSansDevanagari,
    bold: fontFileNames.NotoSansDevanagari,
    italics: fontFileNames.NotoSansDevanagari,
    bolditalics: fontFileNames.NotoSansDevanagari,
  };
}

if (isFontAvailable('kn')) {
  fontDefinitions.NotoSansKannada = {
    normal: fontFileNames.NotoSansKannada,
    bold: fontFileNames.NotoSansKannada,
    italics: fontFileNames.NotoSansKannada,
    bolditalics: fontFileNames.NotoSansKannada,
  };
}

if (isFontAvailable('ta')) {
  fontDefinitions.NotoSansTamil = {
    normal: fontFileNames.NotoSansTamil,
    bold: fontFileNames.NotoSansTamil,
    italics: fontFileNames.NotoSansTamil,
    bolditalics: fontFileNames.NotoSansTamil,
  };
}

if (isFontAvailable('bn')) {
  fontDefinitions.NotoSansBengali = {
    normal: fontFileNames.NotoSansBengali,
    bold: fontFileNames.NotoSansBengali,
    italics: fontFileNames.NotoSansBengali,
    bolditalics: fontFileNames.NotoSansBengali,
  };
}

if (isFontAvailable('gu')) {
  fontDefinitions.NotoSansGujarati = {
    normal: fontFileNames.NotoSansGujarati,
    bold: fontFileNames.NotoSansGujarati,
    italics: fontFileNames.NotoSansGujarati,
    bolditalics: fontFileNames.NotoSansGujarati,
  };
}

// Set the fonts in pdfMake
pdfMake.fonts = fontDefinitions;

export default pdfMake;