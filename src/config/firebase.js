// Firebase v9 Modular SDK
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'helio-suite.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'helio-suite',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'helio-suite.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || 'demo-app-id',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
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