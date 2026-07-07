import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

// Configuración del proyecto Firebase "rcv-tracker". Estos valores son
// identificadores públicos (van dentro de cualquier app de Firebase); la
// seguridad real la imponen las reglas de Firestore y los dominios
// autorizados de Authentication. Se pueden sobrescribir con variables
// de entorno para apuntar a otro proyecto.
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyBzmzFKuLpA_MTDwS4fYWzzSUft-tNTaHg",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "rcv-tracker.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "rcv-tracker",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "rcv-tracker.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "998609267174",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:998609267174:web:600a0d6f867d05d164ce27",
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function ensureApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(ensureApp());
  }
  return authInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) {
    // Caché local persistente: la app funciona sin conexión y sincroniza
    // automáticamente entre pestañas y dispositivos al volver la red.
    dbInstance = initializeFirestore(ensureApp(), {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  }
  return dbInstance;
}

export const googleProvider = new GoogleAuthProvider();
