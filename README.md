<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Hedera Certification Dashboard

A comprehensive dashboard for managing Hedera developer certifications, built with React, TypeScript, and Firebase.

## Features

- **Authentication**: Email/password and Google OAuth sign-in
- **Firestore Database**: Real-time data storage for developers, certificates, invoices, and more
- **Cloud Storage**: Upload and manage certificate images and documents
- **Analytics**: Firebase Analytics integration for usage tracking
- **AI Insights**: Gemini AI-powered executive summaries and reports

## Prerequisites

- Node.js 18+ 
- A Firebase project (or use the default v3-certif project)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Firebase Configuration (optional - defaults are provided)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Gemini API Key (for AI features)
GEMINI_API_KEY=your-gemini-api-key
```

> **Note**: The app includes fallback Firebase configuration for the v3-certif project. Environment variables are optional but recommended for production.

### 3. Run the App

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Firebase Setup

### Setting Up Your Own Firebase Project

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard

2. **Enable Authentication**
   - Navigate to Authentication > Sign-in method
   - Enable **Email/Password** provider
   - Enable **Google** provider:
     - Click on Google provider
     - Enable it
     - Add your project's support email
     - Configure OAuth consent screen if prompted

3. **Set Up Firestore Database**
   - Navigate to Firestore Database
   - Click "Create database"
   - Choose production or test mode
   - Select a location

4. **Configure Firestore Rules**

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Admin collections - require authentication
       match /developers/{docId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       
       match /admins/{docId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       
       match /invoices/{docId} {
         allow read, write: if request.auth != null;
       }
       
       match /agreements/{docId} {
         allow read, write: if request.auth != null;
       }
       
       match /events/{docId} {
         allow read, write: if request.auth != null;
       }
       
       match /campaigns/{docId} {
         allow read, write: if request.auth != null;
       }
       
       match /masterRegistry/{docId} {
         allow read, write: if request.auth != null;
       }
       
       match /certificates/{docId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

5. **Set Up Cloud Storage**
   - Navigate to Storage
   - Click "Get started"
   - Choose production or test mode

6. **Configure Storage Rules**

   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Allow authenticated users to upload/download files
       match /uploads/{allPaths=**} {
         allow read, write: if request.auth != null;
       }
       
       match /certificates/{allPaths=**} {
         allow read, write: if request.auth != null;
       }
       
       match /avatars/{userId}/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       match /documents/{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

7. **Get Your Firebase Config**
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click the web app icon (</>) to add a web app
   - Copy the firebaseConfig object
   - Add values to your `.env.local` file

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
├── __tests__/              # Test files
├── .github/workflows/      # GitHub Actions CI
├── components/             # React components
├── contexts/               # React contexts (AuthContext)
├── services/               # Firebase services
│   ├── firestoreService.ts # Firestore CRUD operations
│   ├── storageService.ts   # Cloud Storage operations
│   ├── dataProcessing.ts   # Data processing utilities
│   ├── emailService.ts     # Email service (mock)
│   └── geminiService.ts    # Gemini AI integration
├── firebaseConfig.ts       # Firebase initialization
├── types.ts                # TypeScript type definitions
├── App.tsx                 # Main application component
├── index.tsx               # Application entry point
└── vite.config.ts          # Vite configuration
```

## Firebase Collections

| Collection | Description |
|------------|-------------|
| `users` | User profiles |
| `developers` | Developer certification records |
| `admins` | Admin user records |
| `invoices` | Invoice records |
| `agreements` | Community agreements |
| `events` | Community events |
| `campaigns` | Outreach campaigns |
| `masterRegistry` | Official community codes |
| `certificates` | Certificate metadata |

## Testing

The project uses Jest and React Testing Library for testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Deployment

The app can be deployed to any static hosting service:

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Docker

A Dockerfile is included for containerized deployment:

```bash
docker build -t hedera-certif-dashboard .
docker run -p 80:80 hedera-certif-dashboard
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Build: `npm run build`
5. Submit a pull request

## License

Private - All rights reserved.
