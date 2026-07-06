import { capRoute } from "./geo";
import type { CardioSport, RoutePoint, Workout } from "./types";

// Integración con Health Connect (Android), el puente oficial de Google
// donde las apps de relojes y pulseras — Mi Fitness (Xiaomi), Zepp Life,
// Samsung Health, Garmin Connect… — publican los entrenamientos. Leemos
// las sesiones de ejercicio con su distancia, pulsaciones, calorías y ruta.
//
// El módulo nativo solo existe en la APK / dev build (no en Expo Go), así
// que se carga en tiempo de ejecución y la pantalla degrada con un aviso.

// Tipos de ejercicio de Health Connect → deporte de la app
// (constantes de androidx.health.connect ExerciseSessionRecord)
const HC_TYPE_TO_SPORT: Record<number, CardioSport> = {
  56: "correr", // RUNNING
  57: "correr", // RUNNING_TREADMILL
  8: "bici", // BIKING
  9: "bici", // BIKING_STATIONARY
  79: "caminar", // WALKING
  37: "senderismo", // HIKING
  53: "remo", // ROWING
  54: "remo", // ROWING_MACHINE
  73: "natacion", // SWIMMING_POOL
  74: "natacion", // SWIMMING_OPEN_WATER
  25: "eliptica", // ELLIPTICAL
};

interface HCExerciseSession {
  startTime: string;
  endTime: string;
  exerciseType: number;
  title?: string;
  notes?: string;
  metadata?: { id?: string; dataOrigin?: string };
  exerciseRoute?: {
    route?: { latitude: number; longitude: number; time?: string }[];
  };
}

interface HCModule {
  initialize: () => Promise<boolean>;
  getSdkStatus: () => Promise<number>;
  requestPermission: (
    perms: { accessType: "read"; recordType: string }[]
  ) => Promise<unknown>;
  readRecords: (
    recordType: string,
    options: {
      timeRangeFilter: { operator: "between"; startTime: string; endTime: string };
      pageSize?: number;
    }
  ) => Promise<{ records: unknown[] }>;
  SdkAvailabilityStatus?: { SDK_AVAILABLE?: number };
}

function loadModule(): HCModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("react-native-health-connect") as HCModule;
  } catch {
    return null;
  }
}

export function healthConnectModuleAvailable(): boolean {
  return loadModule() !== null;
}

// Inicializa y pide permisos de lectura. Devuelve true si quedó conectado.
export async function connectHealthConnect(): Promise<
  "ok" | "unavailable" | "no-module"
> {
  const hc = loadModule();
  if (!hc) return "no-module";
  try {
    const status = await hc.getSdkStatus();
    const AVAILABLE = hc.SdkAvailabilityStatus?.SDK_AVAILABLE ?? 3;
    if (status !== AVAILABLE) return "unavailable";
    await hc.initialize();
    const base = [
      { accessType: "read" as const, recordType: "ExerciseSession" },
      { accessType: "read" as const, recordType: "Distance" },
      { accessType: "read" as const, recordType: "HeartRate" },
      { accessType: "read" as const, recordType: "TotalCaloriesBurned" },
    ];
    try {
      // La ruta del recorrido tiene un permiso propio; si esta versión de la
      // librería no lo soporta, seguimos sin ruta.
      await hc.requestPermission([
        ...base,
        { accessType: "read", recordType: "ExerciseRoute" },
      ]);
    } catch {
      await hc.requestPermission(base);
    }
    return "ok";
  } catch (e) {
    console.error("Health Connect:", e);
    return "unavailable";
  }
}

async function sumDistanceM(hc: HCModule, start: string, end: string): Promise<number> {
  try {
    const { records } = await hc.readRecords("Distance", {
      timeRangeFilter: { operator: "between", startTime: start, endTime: end },
    });
    return (records as { distance?: { inMeters?: number } }[]).reduce(
      (a, r) => a + (r.distance?.inMeters ?? 0),
      0
    );
  } catch {
    return 0;
  }
}

async function avgHeartRate(hc: HCModule, start: string, end: string): Promise<number | null> {
  try {
    const { records } = await hc.readRecords("HeartRate", {
      timeRangeFilter: { operator: "between", startTime: start, endTime: end },
    });
    let sum = 0;
    let n = 0;
    for (const r of records as { samples?: { beatsPerMinute?: number }[] }[]) {
      for (const s of r.samples ?? []) {
        if (s.beatsPerMinute) {
          sum += s.beatsPerMinute;
          n++;
        }
      }
    }
    return n > 0 ? Math.round(sum / n) : null;
  } catch {
    return null;
  }
}

async function sumCalories(hc: HCModule, start: string, end: string): Promise<number | null> {
  try {
    const { records } = await hc.readRecords("TotalCaloriesBurned", {
      timeRangeFilter: { operator: "between", startTime: start, endTime: end },
    });
    const kcal = (records as { energy?: { inKilocalories?: number } }[]).reduce(
      (a, r) => a + (r.energy?.inKilocalories ?? 0),
      0
    );
    return kcal > 0 ? Math.round(kcal) : null;
  } catch {
    return null;
  }
}

export interface HCImportResult {
  imported: Omit<Workout, "id">[];
  skippedExisting: number;
  skippedUnsupported: number;
}

// Lee las sesiones de los últimos `days` días y las convierte a nuestro
// modelo, saltando las ya importadas (por ID de Health Connect).
export async function readWorkoutsFromHealthConnect(
  existingIds: Set<string>,
  days = 90,
  maxSessions = 60
): Promise<HCImportResult> {
  const hc = loadModule();
  if (!hc) throw new Error("Health Connect no disponible");

  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const { records } = await hc.readRecords("ExerciseSession", {
    timeRangeFilter: {
      operator: "between",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    },
    pageSize: 200,
  });

  const sessions = (records as HCExerciseSession[])
    .sort((a, b) => b.startTime.localeCompare(a.startTime))
    .slice(0, maxSessions);

  const result: HCImportResult = {
    imported: [],
    skippedExisting: 0,
    skippedUnsupported: 0,
  };

  for (const s of sessions) {
    const hcId = s.metadata?.id;
    if (hcId && existingIds.has(hcId)) {
      result.skippedExisting++;
      continue;
    }

    const startMs = Date.parse(s.startTime);
    const endMs = Date.parse(s.endTime);
    const durationMin = Math.max(1, Math.round((endMs - startMs) / 60000));

    const distanceM = await sumDistanceM(hc, s.startTime, s.endTime);
    const sport = HC_TYPE_TO_SPORT[s.exerciseType];
    // Sin deporte reconocible y sin distancia no hay nada útil que importar
    if (!sport && distanceM <= 0) {
      result.skippedUnsupported++;
      continue;
    }

    const [avgHr, calories] = await Promise.all([
      avgHeartRate(hc, s.startTime, s.endTime),
      sumCalories(hc, s.startTime, s.endTime),
    ]);

    let route: RoutePoint[] | undefined;
    const rawRoute = s.exerciseRoute?.route;
    if (rawRoute && rawRoute.length > 1) {
      route = capRoute(rawRoute.map((p) => ({ lat: p.latitude, lng: p.longitude })));
    }

    const startDate = new Date(startMs);
    const workout: Omit<Workout, "id"> = {
      type: "cardio",
      name: s.title?.trim() || "Entrenamiento del reloj",
      date: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`,
      durationMin,
      cardio: {
        sport: sport ?? "otro",
        distanceKm: Math.round((distanceM / 1000) * 100) / 100,
        avgHr,
        calories,
        elevationM: null,
        ...(route ? { route } : {}),
      },
      ...(hcId ? { healthConnectId: hcId } : {}),
      createdAt: Date.now(),
    };
    result.imported.push(workout);
  }

  return result;
}
