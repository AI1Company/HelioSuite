// Firebase v10 SDK
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Use emulator in development if no real credentials
if (import.meta.env.DEV && (!import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'demo-api-key')) {
  console.log('🔧 Using Firebase emulators for development');
  
  // Connect to Auth emulator (only if not already connected)
  try {
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('✅ Connected to Auth emulator on localhost:9099');
    }
  } catch (error) {
    console.warn('⚠️ Failed to connect to Auth emulator:', error);
  }
  
  // Connect to Firestore emulator (only if not already connected)
  try {
    if (!db._delegate._databaseId.projectId.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('✅ Connected to Firestore emulator on localhost:8080');
    }
  } catch (error) {
    console.warn('⚠️ Failed to connect to Firestore emulator:', error);
  }
  
  // Add connection verification
  setTimeout(() => {
    console.log('🔍 Verifying emulator connections...');
    console.log('Auth emulator config:', auth.emulatorConfig);
    console.log('Firestore settings:', db._delegate._settings);
  }, 1000);
}
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;

// Demo user credentials (for reference)
export const DEMO_USER = {
  email: 'demo@ai1company.com',
  password: 'demo123'
};

// User roles constants
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SALES_REP: 'sales_rep',
  TECHNICIAN: 'technician',
  GUEST: 'guest'
};

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients',
  JOBS: 'jobs',
  PRODUCTS: 'products',
  PROPOSALS: 'proposals',
  LEADS: 'leads'
};