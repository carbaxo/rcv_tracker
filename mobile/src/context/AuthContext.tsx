import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { firebaseConfigured, getFirebaseAuth } from "../lib/firebase";

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: User | null;
  loading: boolean;
  configured: boolean;
  canSignIn: boolean;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  configured: false,
  canSignIn: false,
  signInWithGoogle: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // IDs de cliente OAuth del proyecto rcv-tracker. Son identificadores
  // públicos (van dentro de la app y en las URLs de login); se pueden
  // sobrescribir con variables de entorno para otro proyecto.
  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
    "998609267174-e53ps481lgiglsb48oni5kno01ael4fr.apps.googleusercontent.com";
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId,
    androidClientId: androidClientId,
  });

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Cuando Google devuelve el id_token, iniciamos sesión en Firebase con él:
  // así el usuario es EL MISMO que en la web y comparte todos sus datos.
  useEffect(() => {
    if (response?.type === "success" && response.params.id_token) {
      const credential = GoogleAuthProvider.credential(response.params.id_token);
      signInWithCredential(getFirebaseAuth(), credential).catch((e) =>
        console.error("Error iniciando sesión en Firebase:", e)
      );
    }
  }, [response]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: firebaseConfigured,
        canSignIn: Boolean(request && webClientId),
        signInWithGoogle: () => promptAsync(),
        signOut: async () => {
          await fbSignOut(getFirebaseAuth());
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
