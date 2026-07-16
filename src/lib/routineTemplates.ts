import type { PlanDay } from "./types";

// Plantillas de rutinas listas para usar. El usuario las añade a "Planes" con
// un toque y luego puede editarlas o iniciar cada día como sesión.
// Los ejercicios usan los nombres de la biblioteca en español, así que el
// autocompletado y la búsqueda los reconocen.
export interface RoutineTemplate {
  id: string;
  name: string;
  emoji: string;
  level: "Principiante" | "Intermedio" | "Avanzado";
  daysPerWeek: number;
  description: string;
  days: PlanDay[];
}

const REST_COMPOUND = 120;
const REST_ISOLATION = 75;

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: "fullbody-3",
    name: "Cuerpo completo · 3 días",
    emoji: "🌱",
    level: "Principiante",
    daysPerWeek: 3,
    description:
      "Tres sesiones de cuerpo completo a la semana (lunes, miércoles, viernes). Ideal para empezar: trabaja todos los grupos con los básicos.",
    days: [
      {
        name: "Día 1 · Cuerpo completo A",
        focus: "empuje + pierna",
        type: "gym",
        exercises: [
          { name: "Sentadilla", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Press banca", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Remo con barra", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Press militar", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Plancha", sets: 3, reps: "30-45s", restSec: 60 },
        ],
      },
      { name: "Día 2 · Descanso", type: "descanso", exercises: [] },
      {
        name: "Día 3 · Cuerpo completo B",
        focus: "tracción + pierna",
        type: "gym",
        exercises: [
          { name: "Peso muerto", sets: 3, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Jalón al pecho", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Press con mancuernas", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Zancadas", sets: 3, reps: "10 por pierna", restSec: REST_ISOLATION },
          { name: "Crunch abdominal", sets: 3, reps: "15-20", restSec: 60 },
        ],
      },
      { name: "Día 4 · Descanso", type: "descanso", exercises: [] },
      {
        name: "Día 5 · Cuerpo completo C",
        focus: "general",
        type: "gym",
        exercises: [
          { name: "Prensa de piernas", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Press banca inclinado", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Remo en polea baja", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Elevaciones laterales", sets: 3, reps: "12-15", restSec: 60 },
          { name: "Curl con mancuernas", sets: 2, reps: "12-15", restSec: 60 },
        ],
      },
    ],
  },
  {
    id: "upper-lower-4",
    name: "Torso / Pierna · 4 días",
    emoji: "⚖️",
    level: "Intermedio",
    daysPerWeek: 4,
    description:
      "Cuatro días alternando torso y pierna (2 de cada). Buen equilibrio entre volumen y recuperación para progresar.",
    days: [
      {
        name: "Día 1 · Torso A",
        focus: "empuje dominante",
        type: "gym",
        exercises: [
          { name: "Press banca", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Remo con barra", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Press militar", sets: 3, reps: "8-10", restSec: REST_ISOLATION },
          { name: "Jalón al pecho", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Elevaciones laterales", sets: 3, reps: "12-15", restSec: 60 },
        ],
      },
      {
        name: "Día 2 · Pierna A",
        focus: "cuádriceps dominante",
        type: "gym",
        exercises: [
          { name: "Sentadilla", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Prensa de piernas", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Curl femoral", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Elevación de gemelos", sets: 4, reps: "15-20", restSec: 60 },
          { name: "Plancha", sets: 3, reps: "45s", restSec: 60 },
        ],
      },
      { name: "Día 3 · Descanso", type: "descanso", exercises: [] },
      {
        name: "Día 4 · Torso B",
        focus: "tracción dominante",
        type: "gym",
        exercises: [
          { name: "Dominadas", sets: 4, reps: "máx", restSec: REST_COMPOUND },
          { name: "Press con mancuernas", sets: 4, reps: "8-10", restSec: REST_ISOLATION },
          { name: "Remo con mancuerna", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Face pull", sets: 3, reps: "15-20", restSec: 60 },
          { name: "Curl con barra", sets: 3, reps: "10-12", restSec: 60 },
          { name: "Extensión de tríceps en polea", sets: 3, reps: "12-15", restSec: 60 },
        ],
      },
      {
        name: "Día 5 · Pierna B",
        focus: "glúteo/femoral dominante",
        type: "gym",
        exercises: [
          { name: "Peso muerto rumano", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Hip thrust", sets: 4, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Zancadas", sets: 3, reps: "12 por pierna", restSec: REST_ISOLATION },
          { name: "Extensión de cuádriceps", sets: 3, reps: "15", restSec: 60 },
          { name: "Elevación de gemelos", sets: 4, reps: "15-20", restSec: 60 },
        ],
      },
    ],
  },
  {
    id: "ppl-6",
    name: "Push Pull Legs · 6 días",
    emoji: "🔥",
    level: "Avanzado",
    daysPerWeek: 6,
    description:
      "Empuje, tracción y pierna repetidos dos veces por semana. Máximo volumen para quien ya tiene experiencia y buena recuperación.",
    days: [
      {
        name: "Día 1 · Empuje",
        focus: "pecho · hombro · tríceps",
        type: "gym",
        exercises: [
          { name: "Press banca", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Press militar", sets: 3, reps: "8-10", restSec: REST_ISOLATION },
          { name: "Press banca inclinado", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Elevaciones laterales", sets: 4, reps: "12-15", restSec: 60 },
          { name: "Extensión de tríceps en polea", sets: 3, reps: "12-15", restSec: 60 },
        ],
      },
      {
        name: "Día 2 · Tracción",
        focus: "espalda · bíceps",
        type: "gym",
        exercises: [
          { name: "Dominadas", sets: 4, reps: "máx", restSec: REST_COMPOUND },
          { name: "Remo con barra", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Jalón al pecho", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Face pull", sets: 3, reps: "15-20", restSec: 60 },
          { name: "Curl con barra", sets: 3, reps: "10-12", restSec: 60 },
          { name: "Curl martillo", sets: 3, reps: "12-15", restSec: 60 },
        ],
      },
      {
        name: "Día 3 · Pierna",
        focus: "cuádriceps · femoral · glúteo",
        type: "gym",
        exercises: [
          { name: "Sentadilla", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Peso muerto rumano", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Prensa de piernas", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Curl femoral", sets: 3, reps: "12-15", restSec: 60 },
          { name: "Elevación de gemelos", sets: 4, reps: "15-20", restSec: 60 },
        ],
      },
      {
        name: "Día 4 · Empuje",
        focus: "pecho · hombro · tríceps",
        type: "gym",
        exercises: [
          { name: "Press con mancuernas", sets: 4, reps: "8-10", restSec: REST_ISOLATION },
          { name: "Press de hombro con mancuernas", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Cruce en poleas", sets: 3, reps: "12-15", restSec: 60 },
          { name: "Elevaciones laterales", sets: 4, reps: "15", restSec: 60 },
          { name: "Press francés", sets: 3, reps: "10-12", restSec: 60 },
        ],
      },
      {
        name: "Día 5 · Tracción",
        focus: "espalda · bíceps",
        type: "gym",
        exercises: [
          { name: "Remo con mancuerna", sets: 4, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Remo en polea baja", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Jalón al pecho", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Pájaros (deltoide posterior)", sets: 3, reps: "15-20", restSec: 60 },
          { name: "Curl con mancuernas", sets: 3, reps: "12-15", restSec: 60 },
        ],
      },
      {
        name: "Día 6 · Pierna",
        focus: "cuádriceps · glúteo",
        type: "gym",
        exercises: [
          { name: "Peso muerto", sets: 4, reps: "5-6", restSec: REST_COMPOUND },
          { name: "Hip thrust", sets: 4, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Zancadas", sets: 3, reps: "12 por pierna", restSec: REST_ISOLATION },
          { name: "Extensión de cuádriceps", sets: 3, reps: "15", restSec: 60 },
          { name: "Rueda abdominal", sets: 3, reps: "10-12", restSec: 60 },
        ],
      },
    ],
  },
  {
    id: "gym-cardio-5",
    name: "Fuerza + cardio · 5 días",
    emoji: "🏃",
    level: "Intermedio",
    daysPerWeek: 5,
    description:
      "Combina tres sesiones de fuerza con dos de cardio. Pensada para mejorar la salud cardiovascular sin perder músculo.",
    days: [
      {
        name: "Día 1 · Fuerza torso",
        focus: "empuje + tracción",
        type: "gym",
        exercises: [
          { name: "Press banca", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Remo con barra", sets: 4, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Press militar", sets: 3, reps: "8-10", restSec: REST_ISOLATION },
          { name: "Jalón al pecho", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
        ],
      },
      {
        name: "Día 2 · Cardio",
        type: "cardio",
        exercises: [],
        cardioNote: "30-40 min a ritmo suave (zona 2) o 5-6 km trotando.",
      },
      {
        name: "Día 3 · Fuerza pierna",
        focus: "tren inferior",
        type: "gym",
        exercises: [
          { name: "Sentadilla", sets: 4, reps: "6-8", restSec: REST_COMPOUND },
          { name: "Peso muerto rumano", sets: 3, reps: "8-10", restSec: REST_COMPOUND },
          { name: "Prensa de piernas", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Elevación de gemelos", sets: 4, reps: "15-20", restSec: 60 },
        ],
      },
      {
        name: "Día 4 · Cardio (series)",
        type: "cardio",
        exercises: [],
        cardioNote: "Interválico: 6-8 × 400 m fuerte con 90 s de recuperación.",
      },
      {
        name: "Día 5 · Fuerza cuerpo completo",
        focus: "general + core",
        type: "gym",
        exercises: [
          { name: "Dominadas", sets: 3, reps: "máx", restSec: REST_COMPOUND },
          { name: "Press con mancuernas", sets: 3, reps: "10-12", restSec: REST_ISOLATION },
          { name: "Hip thrust", sets: 3, reps: "12-15", restSec: REST_ISOLATION },
          { name: "Plancha", sets: 3, reps: "45-60s", restSec: 60 },
          { name: "Russian twist", sets: 3, reps: "20", restSec: 60 },
        ],
      },
    ],
  },
];
