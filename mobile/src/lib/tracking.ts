import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { haversineM } from "./geo";
import type { CardioSport, RoutePoint } from "./types";

// Grabación GPS con soporte de segundo plano.
//
// En lugar de un watcher ligado a la pantalla, usamos un servicio en primer
// plano de Android (notificación persistente) que sigue recibiendo posiciones
// con la pantalla apagada o la app minimizada. La tarea escribe la sesión en
// AsyncStorage y la interfaz la lee periódicamente, de modo que la grabación
// sobrevive incluso si Android mata el proceso de la app.

export const GPS_TASK = "rcv-gps-tracking";
const SESSION_KEY = "gps_session_v1";

// Lecturas con precisión peor que esto (metros) se descartan
const MAX_ACCURACY_M = 35;
// Saltos imposibles entre lecturas consecutivas se ignoran (GPS perdido)
const MAX_JUMP_M = 200;
// Movimientos menores que esto se consideran ruido estando parado
const MIN_STEP_M = 2;

export interface TrackingSession {
  sport: CardioSport;
  startedAt: number; // epoch ms
  pausedAccumMs: number; // tiempo total en pausa acumulado
  pauseStartedAt: number | null; // null = grabando
  distanceM: number;
  points: RoutePoint[];
  lastPoint: RoutePoint | null;
  gotFix: boolean; // ya hay señal GPS válida
}

export async function getSession(): Promise<TrackingSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as TrackingSession) : null;
}

async function setSession(s: TrackingSession) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export function elapsedSec(s: TrackingSession): number {
  const pausedMs =
    s.pausedAccumMs + (s.pauseStartedAt ? Date.now() - s.pauseStartedAt : 0);
  return Math.max(0, Math.floor((Date.now() - s.startedAt - pausedMs) / 1000));
}

// La tarea debe definirse en el ámbito global del bundle: se importa desde
// index.ts para que quede registrada también si Android relanza la app.
TaskManager.defineTask(GPS_TASK, async ({ data, error }) => {
  if (error || !data) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  const session = await getSession();
  if (!session || session.pauseStartedAt !== null) return;

  let { distanceM, lastPoint, gotFix } = session;
  const points = session.points;

  for (const loc of locations) {
    const acc = loc.coords.accuracy ?? 999;
    if (acc > MAX_ACCURACY_M) continue;
    gotFix = true;
    const p: RoutePoint = { lat: loc.coords.latitude, lng: loc.coords.longitude };
    if (lastPoint) {
      const d = haversineM(lastPoint, p);
      if (d > MAX_JUMP_M) continue;
      if (d < MIN_STEP_M) continue;
      distanceM += d;
    }
    lastPoint = p;
    points.push(p);
  }

  await setSession({ ...session, distanceM, points, lastPoint, gotFix });
});

export async function isTracking(): Promise<boolean> {
  try {
    return await Location.hasStartedLocationUpdatesAsync(GPS_TASK);
  } catch {
    return false;
  }
}

// Pide permisos y arranca el servicio. Devuelve el modo conseguido:
// - "background": permiso "todo el tiempo" → graba con pantalla apagada
// - "foreground": solo "mientras se usa" → graba con la app abierta
// - null: sin permiso de ubicación
export async function startTracking(
  sport: CardioSport
): Promise<"background" | "foreground" | null> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") return null;

  // En Android 11+ este diálogo lleva a los ajustes ("Permitir siempre")
  const bg = await Location.requestBackgroundPermissionsAsync();
  const mode = bg.status === "granted" ? "background" : "foreground";

  await setSession({
    sport,
    startedAt: Date.now(),
    pausedAccumMs: 0,
    pauseStartedAt: null,
    distanceM: 0,
    points: [],
    lastPoint: null,
    gotFix: false,
  });

  await Location.startLocationUpdatesAsync(GPS_TASK, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 3000,
    distanceInterval: 5,
    // Servicio en primer plano: mantiene el GPS vivo con la pantalla apagada
    foregroundService: {
      notificationTitle: "RCV Tracker — grabando ruta",
      notificationBody: "Tu actividad sigue grabándose. Toca para volver a la app.",
      notificationColor: "#34d399",
      killServiceOnDestroy: false,
    },
    pausesUpdatesAutomatically: false,
  });

  return mode;
}

export async function pauseTracking() {
  const s = await getSession();
  if (!s || s.pauseStartedAt !== null) return;
  await setSession({ ...s, pauseStartedAt: Date.now() });
}

export async function resumeTracking() {
  const s = await getSession();
  if (!s || s.pauseStartedAt === null) return;
  await setSession({
    ...s,
    pausedAccumMs: s.pausedAccumMs + (Date.now() - s.pauseStartedAt),
    pauseStartedAt: null,
    // No unimos el hueco de la pausa: la distancia continúa desde el
    // siguiente punto válido
    lastPoint: null,
  });
}

// Detiene el servicio y devuelve la sesión final (sin borrarla todavía:
// se borra al guardar o descartar).
export async function stopTracking(): Promise<TrackingSession | null> {
  if (await isTracking()) {
    await Location.stopLocationUpdatesAsync(GPS_TASK);
  }
  const s = await getSession();
  if (s && s.pauseStartedAt !== null) {
    const finished = {
      ...s,
      pausedAccumMs: s.pausedAccumMs + (Date.now() - s.pauseStartedAt),
      pauseStartedAt: null,
    };
    await setSession(finished);
    return finished;
  }
  return s;
}
