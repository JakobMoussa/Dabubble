/**
 * Firebase web config for the shared DABubble project.
 * These values are public by design; access is protected by
 * Firestore security rules and an HTTP-referrer restricted API key.
 */
export const environment = {
  production: true,
  firebase: {
    apiKey: 'AIzaSyBKXM-rsajHZftb8HbXM_7ZT12ccn7Y72o',
    authDomain: 'dabubble-79573.firebaseapp.com',
    projectId: 'dabubble-79573',
    storageBucket: 'dabubble-79573.firebasestorage.app',
    messagingSenderId: '695040057595',
    appId: '1:695040057595:web:bf31634192cf0850fb105e'
  }
};
