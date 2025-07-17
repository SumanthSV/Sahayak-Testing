# Sahayak AI Teaching Assistant

A comprehensive AI-powered teaching assistant designed for Indian educators, featuring hyper-local story generation, worksheet creation, and classroom management tools.

## 🚀 Features

### Core AI-Powered Modules
- **📚 Hyper-Local Story Generator**: Create culturally relevant stories in regional languages
- **📝 Worksheet Generator**: Generate worksheets from textbook images using AI
- **🧠 Concept Explainer**: Simplify complex topics with age-appropriate explanations
- **🎨 Visual Aid Generator**: Create blackboard teaching aids with step-by-step guides
- **🎤 Voice Assessment**: AI-powered reading skill assessment with feedback
- **📅 Lesson Planner**: Weekly lesson planning and organization
- **👥 Student Tracker**: Monitor student progress and classroom data

### Technical Features
- **🔄 Offline Support**: Works without internet with automatic sync
- **🌐 Multi-language Support**: Hindi, Kannada, Marathi, Tamil, Bengali, Gujarati, English
- **🔥 Firebase Integration**: Real-time database, authentication, and cloud functions
- **🤖 AI-Powered**: Gemini 1.5 Pro for content generation
- **📄 PDF Export**: Download generated content as PDF
- **📱 Responsive Design**: Works on tablets and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Firebase Authentication** for user management
- **Cloud Firestore** for database with offline persistence
- **Firebase Functions** for serverless API
- **Firebase Hosting** for deployment

### AI Integration
- **Google Gemini 1.5 Pro API** for content generation
- **Speech Recognition API** for voice features
- **Text-to-Speech API** for audio playback

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase CLI
- Google Cloud Project with Gemini API access

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd sahayak-ai
npm install
```

### 2. Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
# - Authentication
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials:
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Firebase Configuration

#### Enable Authentication
1. Go to Firebase Console → Authentication
2. Enable Email/Password sign-in method
3. Add test user: teacher@sahayak.ai / demo123

#### Setup Firestore
1. Create Firestore database in production mode
2. Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

#### Deploy Functions
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 5. Gemini API Setup
1. Go to Google AI Studio (https://makersuite.google.com/)
2. Create API key
3. Add to environment variables and Firebase Functions config

### 6. Development
```bash
# Start development server
npm run dev

# Start Firebase emulators (optional)
firebase emulators:start
```

### 7. Production Deployment
```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 👥 Account Creation

### For Teachers
Teachers can create accounts by:

1. **Visit the Login Page**: Go to the application login page
2. **Click "Create Teacher Account"**: Green button below the login form
3. **Fill Registration Form**:
   - **Personal Information**: Name, email, phone (optional), password
   - **Professional Information**: School name, teaching experience, subjects taught
4. **Submit**: Account is created and automatically logged in

### Registration Requirements
- **Email**: Must be valid and unique
- **Password**: Minimum 6 characters
- **School Name**: Required
- **Teaching Experience**: Select from dropdown (0-1 years to 15+ years)
- **Subjects**: Select at least one subject you teach

### Demo Account
For testing purposes, use:
- **Email**: teacher@sahayak.ai
- **Password**: demo123

## 📖 Usage Guide

### Story Generation
1. Select language and subject
2. Choose grade level
3. Enter story prompt in your preferred language
4. Click "Generate Story"
5. Edit, save, or export as PDF

### Worksheet Creation
1. Upload textbook page image
2. Select subject and grade
3. Choose language
4. Generate worksheet with AI
5. Download as PDF

### Concept Explanation
1. Enter your question
2. Select difficulty level
3. Choose subject (optional)
4. Get simple, age-appropriate explanation
5. Save or export for later use

### Student Management
1. Add students with subjects
2. Track progress across subjects
3. View performance analytics
4. Export student data

### Voice Assessment
1. Set up reading text
2. Record student reading
3. Get AI-powered feedback
4. Track reading progress over time

### Lesson Planning
1. Create weekly lesson plans
2. Set objectives and activities
3. Plan resources and assessments
4. Track lesson completion

### Offline Mode
- App works offline with limited functionality
- Data syncs automatically when online
- Offline indicator shows connection status

## 🏗️ Project Structure

```
sahayak-ai/
├── src/
│   ├── components/          # React components
│   │   ├── Auth/           # Authentication (Login/Signup)
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── StoryGenerator/ # Story generation
│   │   ├── Worksheets/     # Worksheet creation
│   │   ├── Assessment/     # Voice assessment
│   │   ├── LessonPlanner/  # Lesson planning
│   │   ├── StudentTracker/ # Student management
│   │   ├── Features/       # Concept explainer
│   │   ├── VisualAids/     # Visual aid generator
│   │   └── Layout/         # Layout components
│   ├── services/           # API services
│   │   ├── aiService.ts    # AI/Gemini integration
│   │   └── firebaseService.ts # Firebase operations
│   ├── hooks/              # React hooks
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
├── functions/              # Firebase Functions
│   └── src/
│       └── index.ts        # Cloud functions
├── firestore.rules         # Database security rules
├── firestore.indexes.json  # Database indexes
├── firebase.json           # Firebase configuration
└── README.md
```

## 🔌 API Endpoints

### Firebase Functions
- `generateStory`: Create educational stories
- `generateWorksheet`: Generate worksheets from images
- `generateVisualAid`: Create visual teaching aids
- `explainConcept`: Explain complex concepts simply
- `healthCheck`: Service health monitoring

### Firestore Collections
- `teachers`: Teacher profiles and account information
- `students`: Student data linked to teachers
- `generated_content`: AI-generated content (stories, worksheets, etc.)
- `lesson_plans`: Weekly lesson plans
- `assessments`: Student assessment records

## 🔒 Security

### Firestore Rules
- Teachers can only access their own data
- Students are linked to specific teachers
- Content is teacher-specific
- Offline data is encrypted locally

### Authentication
- Email/password authentication with Firebase Auth
- Account creation with profile validation
- Session management and secure token handling

## 🌟 Key Features Explained

### AI-Powered Content Generation
- **Stories**: Culturally relevant narratives in regional languages
- **Worksheets**: Auto-generated from textbook images
- **Visual Aids**: Step-by-step blackboard drawing guides
- **Explanations**: Age-appropriate concept explanations

### Offline-First Design
- Works without internet connectivity
- Local data storage with IndexedDB
- Automatic sync when connection restored
- Offline indicator for user awareness

### Multi-Language Support
- Interface in multiple Indian languages
- Content generation in regional languages
- Voice recognition for local languages
- Cultural context in generated content

### Teacher-Centric Design
- Designed specifically for Indian classroom needs
- Minimal resource requirements
- Easy-to-use interface
- Time-saving automation

## 🚀 Deployment

### Firebase Hosting
```bash
# Build and deploy
npm run build
firebase deploy --only hosting
```

### Environment Variables
Set these in Firebase Functions config:
```bash
firebase functions:config:set gemini.api_key="your-gemini-api-key"
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 📞 Support

For support and questions:
- Email: support@sahayak.ai
- Documentation: [docs.sahayak.ai]
- Issues: GitHub Issues

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- ✅ Core story generation
- ✅ Worksheet creation
- ✅ Student tracking
- ✅ Offline support
- ✅ Teacher account creation
- ✅ Concept explanation
- ✅ Visual aid generation
- ✅ Voice assessment
- ✅ Lesson planning

### Phase 2 (Upcoming)
- Advanced analytics and reporting
- Parent communication portal
- Curriculum alignment tools
- Mobile app for Android/iOS
- Bulk content generation
- Advanced voice features

### Phase 3 (Future)
- AR/VR integration for immersive learning
- Advanced AI tutoring capabilities
- Multi-school district support
- Government integration and compliance
- Advanced assessment analytics
- Collaborative teaching tools

## 🎯 Target Users

- **Primary**: Government school teachers in rural/semi-urban India
- **Secondary**: Private school teachers, tutoring centers
- **Tertiary**: Educational NGOs, teacher training institutes

## 💡 Innovation Highlights

- **Hyper-Local Content**: Stories and examples relevant to Indian students
- **Resource-Conscious**: Designed for low-resource environments
- **Language-First**: Native language support for better comprehension
- **Offline-Capable**: Works in areas with poor connectivity
- **Teacher-Empowering**: Saves time and enhances teaching quality

---

**Empowering teachers across India with AI-powered educational tools** 🇮🇳