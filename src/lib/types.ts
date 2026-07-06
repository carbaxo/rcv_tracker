export type MuscleGroup =
  | "pecho"
  | "espalda"
  | "pierna"
  | "gluteo"
  | "hombro"
  | "biceps"
  | "triceps"
  | "core"
  | "cuerpo completo"
  | "otro";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "pecho",
  "espalda",
  "pierna",
  "gluteo",
  "hombro",
  "biceps",
  "triceps",
  "core",
  "cuerpo completo",
  "otro",
];

export interface Exercise {
  id?: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment?: string;
  instructions?: string;
  custom?: boolean;
}

export interface SetEntry {
  weight: number; // kg
  reps: number;
  done?: boolean;
}

export interface WorkoutExercise {
  name: string;
  muscleGroup?: MuscleGroup;
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

export interface CardioData {
  sport: CardioSport;
  distanceKm: number;
  avgHr?: number | null;
  elevationM?: number | null;
  calories?: number | null;
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
  createdAt: number;
}

export interface PlanExercise {
  name: string;
  sets: number;
  reps: string; // ej. "8-12"
  restSec?: number;
}

export interface PlanDay {
  name: string; // ej. "Día 1 · Empuje"
  focus?: string;
  type: "gym" | "cardio" | "descanso";
  exercises: PlanExercise[];
  cardioNote?: string;
}

export interface Plan {
  id?: string;
  name: string;
  description?: string;
  days: PlanDay[];
  active?: boolean;
  createdAt: number;
}

export type GoalType =
  | "distancia_mes"
  | "sesiones_semana"
  | "peso_ejercicio"
  | "peso_corporal";

export interface Goal {
  id?: string;
  title: string;
  type: GoalType;
  target: number;
  exerciseName?: string;
  createdAt: number;
}

export interface BodyMetric {
  id?: string;
  date: string; // ISO yyyy-mm-dd
  weightKg: number;
  createdAt: number;
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  reps: number;
  est1RM: number;
  date: string;
}
