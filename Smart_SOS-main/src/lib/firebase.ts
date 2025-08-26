// Firebase initialization
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyBFHNG2FhV53eyizdm9P106qXQQ-6q0JXU',
  authDomain: 'emergency-response-579ab.firebaseapp.com',
  projectId: 'emergency-response-579ab',
  storageBucket: 'emergency-response-579ab.firebasestorage.app',
  messagingSenderId: '244680356799',
  appId: '1:244680356799:web:57aefd63b39a976999a70a',
  measurementId: 'G-5ZGTMCV44F'
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

// Initialize Analytics only if supported (avoids issues in some environments)
export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(firebaseApp) : null
)


