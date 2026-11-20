/**
 * Firebase web config for the shared DABubble project.
 * These values are public by design; access is protected by
 * Firestore security rules and an HTTP-referrer restricted API key.
 */
export const environment = {
  production: true,
  firebase: {
    apiKey: 'REPLACE_WITH_API_KEY',
    authDomain: 'REPLACE_WITH_PROJECT_ID.firebaseapp.com',
    projectId: 'REPLACE_WITH_PROJECT_ID',
    storageBucket: 'REPLACE_WITH_PROJECT_ID.firebasestorage.app',
    messagingSenderId: 'REPLACE_WITH_SENDER_ID',
    appId: 'REPLACE_WITH_APP_ID'
  }
};
