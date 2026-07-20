// Sesiones de tecnificación prediseñadas: bloques de drills con su duración.
// Cada bloque referencia un drill por id (ver footballDrills.ts).

export interface SessionBlock {
  label: string; // Calentamiento · Principal · Finalización…
  drillId: string;
  minutes: number;
}

export interface FootballSession {
  id: string;
  name: string;
  emoji: string;
  level: "Base" | "Intermedio" | "Avanzado";
  focus: string;
  description: string;
  blocks: SessionBlock[];
}

export const sessionMinutes = (s: FootballSession) =>
  s.blocks.reduce((a, b) => a + b.minutes, 0);

export const FOOTBALL_SESSIONS: FootballSession[] = [
  {
    id: "ses-regate",
    name: "Regate y 1v1",
    emoji: "🌀",
    level: "Intermedio",
    focus: "Superar rivales con balón",
    description:
      "Sesión centrada en el uno contra uno: conducción, recortes y salida en velocidad tras el regate.",
    blocks: [
      { label: "Calentamiento", drillId: "coord-escalera", minutes: 8 },
      { label: "Calentamiento", drillId: "cond-slalom", minutes: 8 },
      { label: "Principal", drillId: "reg-zigzag", minutes: 8 },
      { label: "Principal", drillId: "reg-1v1cono", minutes: 10 },
      { label: "Finalización", drillId: "tiro-conduccion", minutes: 11 },
    ],
  },
  {
    id: "ses-pase",
    name: "Pase y control",
    emoji: "🎯",
    level: "Intermedio",
    focus: "Circulación y primer toque",
    description:
      "Trabajo de pase preciso, control orientado y toma de decisiones bajo presión ligera.",
    blocks: [
      { label: "Calentamiento", drillId: "cond-slalom", minutes: 8 },
      { label: "Principal", drillId: "pase-triangulo", minutes: 10 },
      { label: "Principal", drillId: "pase-rondo", minutes: 12 },
      { label: "Principal", drillId: "ctrl-orientado", minutes: 10 },
      { label: "Finalización", drillId: "pase-pared", minutes: 10 },
    ],
  },
  {
    id: "ses-finalizacion",
    name: "Finalización",
    emoji: "⚽",
    level: "Avanzado",
    focus: "Definición y remate",
    description:
      "Sesión de gol: disparo tras conducción, uno contra uno con portero y remate de cabeza.",
    blocks: [
      { label: "Calentamiento", drillId: "cond-ritmo", minutes: 8 },
      { label: "Principal", drillId: "tiro-conduccion", minutes: 12 },
      { label: "Principal", drillId: "tiro-1v1-portero", minutes: 12 },
      { label: "Extra", drillId: "aereo-remate", minutes: 10 },
    ],
  },
  {
    id: "ses-completa",
    name: "Sesión completa",
    emoji: "🔥",
    level: "Intermedio",
    focus: "Tecnificación global",
    description:
      "Una sesión equilibrada que toca todas las áreas: conducción, pase, control, regate y finalización.",
    blocks: [
      { label: "Calentamiento", drillId: "coord-escalera", minutes: 8 },
      { label: "Calentamiento", drillId: "cond-slalom", minutes: 8 },
      { label: "Pase y control", drillId: "pase-triangulo", minutes: 10 },
      { label: "Pase y control", drillId: "ctrl-orientado", minutes: 10 },
      { label: "Regate", drillId: "reg-1v1cono", minutes: 8 },
      { label: "Finalización", drillId: "tiro-conduccion", minutes: 12 },
    ],
  },
  {
    id: "ses-solo",
    name: "Tecnificación en solitario",
    emoji: "🧍",
    level: "Base",
    focus: "Entrenar solo, en casa o el parque",
    description:
      "Solo necesitas un balón, unos conos y una pared. Todo el trabajo se puede hacer sin compañeros.",
    blocks: [
      { label: "Conducción", drillId: "cond-slalom", minutes: 8 },
      { label: "Regate", drillId: "reg-zigzag", minutes: 8 },
      { label: "Pase", drillId: "pase-pared", minutes: 8 },
      { label: "Control", drillId: "ctrl-primer-toque", minutes: 6 },
    ],
  },
];
