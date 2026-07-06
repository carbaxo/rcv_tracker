// Modelo de datos compartido con la web (src/lib/types.ts del proyecto raíz).
// Ambas apps leen y escriben las mismas colecciones de Firestore.

export interface SetEntry {
  weight: number;
  reps: number;
  done?: boolean;
}

export interface WorkoutExercise {
  name: string;
  muscleGroup?: string;
  sets: SetEntry[];
}

export type CardioSport =
  | "correr"
  | "bici"
  | "natacion"
  | "caminar"
  | "senderismo"
  | "remo"
  | "eliptica"
  | "otro";

export const CARDIO_SPORTS: { value: CardioSport; label: string; emoji: string }[] = [
  { value: "correr", label: "Correr", emoji: "🏃" },
  { value: "bici", label: "Bicicleta", emoji: "🚴" },
  { value: "natacion", label: "Natación", emoji: "🏊" },
  { value: "caminar", label: "Caminar", emoji: "🚶" },
  { value: "senderismo", label: "Senderismo", emoji: "🥾" },
  { value: "remo", label: "Remo", emoji: "🚣" },
  { value: "eliptica", label: "Elíptica", emoji: "⚙️" },
  { value: "otro", label: "Otro", emoji: "💪" },
];

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface CardioData {
  sport: CardioSport;
  distanceKm: number;
  avgHr?: number | null;
  elevationM?: number | null;
  calories?: number | null;
  route?: RoutePoint[];
}

export interface Workout {
  id?: string;
  type: "gym" | "cardio";
  name: string;
  date: string; // ISO yyyy-mm-dd
  durationMin: number;
  notes?: string;
  exercises?: WorkoutExercise[];
  cardio?: CardioData;
  volumeKg?: number;
  stravaId?: number; // presente si la actividad se importó de Strava
  healthConnectId?: string; // presente si vino del reloj vía Health Connect
  createdAt: number;
}
