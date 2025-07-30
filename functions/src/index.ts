import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
initializeApp();

// Export authentication functions
export {
  setUserRole,
  initializeUserRole,
  getUserRole,
  deactivateUser
} from './auth';

// Export database functions (to be created)
// export {
//   createClient,
//   updateJob,
//   generateProposal
// } from './database';

// Export notification functions (to be created)
// export {
//   sendEmailNotification,
//   sendSMSNotification
// } from './notifications';

// Export file processing functions (to be created)
// export {
//   processImageUpload,
//   generatePDFProposal
// } from './files';