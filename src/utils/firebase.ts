import firebase from 'firebase/app';
import 'firebase/auth';

const config = {
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id'
};

firebase.initializeApp(config);

export const auth = firebase.auth();

export default firebase;