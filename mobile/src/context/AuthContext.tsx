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
import { firebaseConfigured, getFirebaseAuth } from "../lib/firebase";

// Inicio de sesión con el SDK nativo de Google Sign-In: selector de cuenta
// nativo de Android (sin pasar por el navegador) y compatible con las APKs
// firmadas. Google identifica la app por su paquete + huella SHA-1 (el
// cliente OAuth Android del proyecto) y el webClientId da el idToken con el
// que se entra en Firebase — la misma cuenta que en la web.
//
// El módulo es nativo (existe en la APK / dev build, no en Expo Go), así
// que se carga en tiempo de ejecución.

// ID de cliente OAuth de tipo Web del proyecto rcv-tracker (identificador
// público; sobrescribible por variable de entorno para otro proyecto).
const WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
  "998609267174-e53ps481lgiglsb48oni5kno01ael4fr.apps.googleusercontent.com";

interface GoogleSigninModule {
  GoogleSignin: {
    configure: (options: { webClientId: string }) => void;
    hasPlayServices: (options?: {
      showPlayServicesUpdateDialog?: boolean;
    }) => Promise<boolean>;
    signIn: () => Promise<{ idToken?: string | null; data?: { idToken?: string | null } }>;
    signOut: () => Promise<null>;
  };
}

function loadGoogleSignin(): GoogleSigninModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("@react-native-google-signin/google-signin") as GoogleSigninModule;
  } catch {
    return null;
  }
}

interface AuthState {
  user: User | null;
  loading: boolean;
  configured: boolean;
  canSignIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  configured: false,
  canSignIn: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const signInWithGoogle = async () => {
    const mod = loadGoogleSignin();
    if (!mod) {
      throw new Error(
        "Google Sign-In no está disponible en Expo Go: usa la APK compilada."
      );
    }
    const { GoogleSignin } = mod;
    GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();
    // v12 devuelve { idToken }; v13 lo anida en { data: { idToken } }
    const idToken = result.idToken ?? result.data?.idToken;
    if (!idToken) {
      throw new Error("Google no devolvió el token de identidad.");
    }
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(getFirebaseAuth(), credential);
  };

  const signOut = async () => {
    try {
      loadGoogleSignin()?.GoogleSignin.signOut();
    } catch {
      // sin sesión nativa que cerrar
    }
    await fbSignOut(getFirebaseAuth());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: firebaseConfigured,
        canSignIn: firebaseConfigured,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
