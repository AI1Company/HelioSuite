// Firebase v8 SDK
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/functions';

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const functions = firebase.functions();

export default firebase;

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