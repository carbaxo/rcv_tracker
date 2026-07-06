import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
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
    // getReactNativePersistence existe en el bundle React Native del SDK
    // (Metro lo resuelve por la condición "react-native"), pero no está en
    // los tipos del entry web — de ahí el require dinámico.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getReactNativePersistence } = require("firebase/auth");
    try {
      authInstance = initializeAuth(ensureApp(), {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      // initializeAuth lanza si ya se inicializó (recarga en desarrollo)
      authInstance = getAuth(ensureApp());
    }
  }
  return authInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) {
    // Long polling automático: evita problemas de streaming de gRPC en
    // algunas redes/emuladores Android.
    dbInstance = initializeFirestore(ensureApp(), {
      experimentalAutoDetectLongPolling: true,
    });
  }
  return dbInstance;
}
