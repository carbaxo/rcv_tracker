// Dataset propio de ejercicios de tecnificación de fútbol (en español).
// No hay una base de datos abierta con media reutilizable, así que los drills
// y sus diagramas (SVG por código, ver DrillPitch) son originales de la app.

export type DrillCategory =
  | "conduccion"
  | "regate"
  | "pase"
  | "control"
  | "tiro"
  | "aereo"
  | "coordinacion";

export const DRILL_CATEGORIES: { value: DrillCategory; label: string; emoji: string }[] = [
  { value: "conduccion", label: "Conducción", emoji: "🏃" },
  { value: "regate", label: "Regate / 1v1", emoji: "🌀" },
  { value: "pase", label: "Pase", emoji: "🎯" },
  { value: "control", label: "Control", emoji: "🦶" },
  { value: "tiro", label: "Finalización", emoji: "⚽" },
  { value: "aereo", label: "Juego aéreo", emoji: "🙆" },
  { value: "coordinacion", label: "Coordinación", emoji: "🪜" },
];

export const CATEGORY_LABEL = Object.fromEntries(
  DRILL_CATEGORIES.map((c) => [c.value, c.label])
) as Record<DrillCategory, string>;

// Elementos del diagrama. Coordenadas en 0..100 (x) × 0..64 (y).
export type DrillEl =
  | { t: "cone"; x: number; y: number }
  | { t: "player"; x: number; y: number; label?: string; color?: "a" | "b" }
  | { t: "ball"; x: number; y: number }
  | { t: "goal"; x: number; y: number; w?: number }
  | { t: "arrow"; x1: number; y1: number; x2: number; y2: number } // pase
  | { t: "run"; x1: number; y1: number; x2: number; y2: number } // carrera sin balón
  | { t: "dribble"; x1: number; y1: number; x2: number; y2: number } // conducción/regate
  | { t: "zone"; x: number; y: number; w: number; h: number };

export interface FootballDrill {
  id: string;
  name: string;
  category: DrillCategory;
  level: "Base" | "Intermedio" | "Avanzado";
  players: string;
  durationMin: number;
  equipment: string[];
  solo?: boolean; // se puede practicar en solitario
  steps: string[];
  keys: string[]; // claves técnicas / puntos de entrenador
  diagram: DrillEl[];
}

export const FOOTBALL_DRILLS: FootballDrill[] = [
  {
    id: "cond-slalom",
    name: "Slalom de conducción",
    category: "conduccion",
    level: "Base",
    players: "1",
    durationMin: 10,
    equipment: ["5-6 conos", "1 balón"],
    solo: true,
    steps: [
      "Coloca 5-6 conos en línea separados 1,5-2 m.",
      "Conduce el balón en zig-zag entre los conos usando el interior y el exterior del pie.",
      "Al llegar al final, gira y vuelve conduciendo con la otra pierna.",
      "Haz 4-6 pasadas alternando pie.",
    ],
    keys: [
      "Toques cortos y suaves, el balón pegado al pie.",
      "Mira arriba entre toque y toque, no solo al balón.",
      "Usa interior y exterior para cambiar de dirección.",
    ],
    diagram: [
      { t: "player", x: 8, y: 32, color: "a", label: "1" },
      { t: "ball", x: 12, y: 32 },
      { t: "cone", x: 25, y: 22 },
      { t: "cone", x: 40, y: 42 },
      { t: "cone", x: 55, y: 22 },
      { t: "cone", x: 70, y: 42 },
      { t: "cone", x: 85, y: 22 },
      { t: "dribble", x1: 13, y1: 32, x2: 88, y2: 30 },
    ],
  },
  {
    id: "cond-ritmo",
    name: "Conducción con cambio de ritmo",
    category: "conduccion",
    level: "Intermedio",
    players: "1",
    durationMin: 8,
    equipment: ["4 conos", "1 balón"],
    solo: true,
    steps: [
      "Marca un pasillo de 20 m con conos: dos zonas lentas y una rápida en el centro.",
      "Conduce lento en las zonas exteriores y acelera al máximo en la central.",
      "Frena controlando el balón antes del último cono.",
      "Repite 6-8 veces.",
    ],
    keys: [
      "Cambio de ritmo real: explota en la zona rápida.",
      "El balón no se escapa al acelerar: empújalo, no lo pierdas.",
      "Frena con la planta o el interior de forma controlada.",
    ],
    diagram: [
      { t: "player", x: 8, y: 32, color: "a", label: "1" },
      { t: "ball", x: 12, y: 32 },
      { t: "zone", x: 38, y: 20, w: 24, h: 24 },
      { t: "cone", x: 38, y: 20 },
      { t: "cone", x: 62, y: 20 },
      { t: "cone", x: 38, y: 44 },
      { t: "cone", x: 62, y: 44 },
      { t: "dribble", x1: 13, y1: 32, x2: 90, y2: 32 },
    ],
  },
  {
    id: "reg-1v1cono",
    name: "1v1 al cono",
    category: "regate",
    level: "Intermedio",
    players: "1",
    durationMin: 8,
    equipment: ["1 cono grande", "1 balón"],
    solo: true,
    steps: [
      "Coloca un cono como si fuera el rival, a 10-12 m.",
      "Conduce hacia él y ejecuta un regate (bicicleta, amago, recorte) justo antes de llegar.",
      "Acelera 3-4 m tras superar el cono.",
      "Alterna el tipo de regate cada repetición.",
    ],
    keys: [
      "Ataca al rival a velocidad para obligarle a decidir.",
      "El regate se hace CERCA del cono, no lejos.",
      "Sal siempre con un cambio de ritmo tras el regate.",
    ],
    diagram: [
      { t: "player", x: 12, y: 32, color: "a", label: "1" },
      { t: "ball", x: 16, y: 32 },
      { t: "cone", x: 55, y: 32 },
      { t: "dribble", x1: 17, y1: 32, x2: 48, y2: 32 },
      { t: "dribble", x1: 60, y1: 30, x2: 88, y2: 26 },
    ],
  },
  {
    id: "reg-zigzag",
    name: "Recortes en zig-zag",
    category: "regate",
    level: "Base",
    players: "1",
    durationMin: 8,
    equipment: ["4 conos", "1 balón"],
    solo: true,
    steps: [
      "Sitúa 4 conos en zig-zag separados 4 m.",
      "En cada cono ejecuta un recorte con el interior o la suela para cambiar de dirección.",
      "Mantén el balón protegido con el cuerpo entre el rival (cono) y tú.",
      "4-6 pasadas.",
    ],
    keys: [
      "Recorte seco y salida rápida.",
      "Protege el balón con el cuerpo tras el recorte.",
      "Baja el centro de gravedad al cambiar de dirección.",
    ],
    diagram: [
      { t: "player", x: 8, y: 50, color: "a", label: "1" },
      { t: "ball", x: 12, y: 50 },
      { t: "cone", x: 30, y: 44 },
      { t: "cone", x: 50, y: 20 },
      { t: "cone", x: 70, y: 44 },
      { t: "cone", x: 88, y: 20 },
      { t: "dribble", x1: 13, y1: 50, x2: 88, y2: 22 },
    ],
  },
  {
    id: "pase-pared",
    name: "Pared contra la valla",
    category: "pase",
    level: "Base",
    players: "1",
    durationMin: 10,
    equipment: ["1 pared o valla", "1 balón"],
    solo: true,
    steps: [
      "Colócate a 4-5 m de una pared.",
      "Pasa con el interior y controla el rebote con el primer toque.",
      "Alterna pierna cada 10 pases.",
      "Sube la intensidad pasando a un toque (sin control).",
    ],
    keys: [
      "Superficie de contacto firme (interior bloqueado).",
      "Golpea el centro del balón para que no se eleve.",
      "Cuerpo orientado a la pared, mirada al balón que vuelve.",
    ],
    diagram: [
      { t: "player", x: 20, y: 32, color: "a", label: "1" },
      { t: "ball", x: 24, y: 32 },
      { t: "zone", x: 90, y: 8, w: 4, h: 48 },
      { t: "arrow", x1: 25, y1: 32, x2: 88, y2: 32 },
      { t: "arrow", x1: 88, y1: 38, x2: 27, y2: 38 },
    ],
  },
  {
    id: "pase-rondo",
    name: "Rondo 4v1",
    category: "pase",
    level: "Intermedio",
    players: "5",
    durationMin: 12,
    equipment: ["4 conos", "1 balón", "petos"],
    steps: [
      "4 jugadores forman un cuadrado de 6-8 m; 1 al medio.",
      "Los de fuera se pasan el balón a uno o dos toques evitando al del medio.",
      "Si el del medio roba o el balón sale, cambia con quien falló.",
      "Prohibido pasar al jugador de al lado sin que el central se mueva.",
    ],
    keys: [
      "Orienta el control al siguiente pase.",
      "Ofrece líneas de pase moviéndote, no estático.",
      "Pase firme y al pie; comunica.",
    ],
    diagram: [
      { t: "player", x: 20, y: 12, color: "a", label: "1" },
      { t: "player", x: 80, y: 12, color: "a", label: "2" },
      { t: "player", x: 80, y: 52, color: "a", label: "3" },
      { t: "player", x: 20, y: 52, color: "a", label: "4" },
      { t: "player", x: 50, y: 32, color: "b", label: "X" },
      { t: "ball", x: 24, y: 15 },
      { t: "arrow", x1: 24, y1: 13, x2: 76, y2: 13 },
      { t: "arrow", x1: 80, y1: 16, x2: 80, y2: 48 },
    ],
  },
  {
    id: "pase-triangulo",
    name: "Pase y sigue (triángulo)",
    category: "pase",
    level: "Intermedio",
    players: "3",
    durationMin: 10,
    equipment: ["3 conos", "1 balón"],
    steps: [
      "Tres conos en triángulo de 8-10 m, un jugador en cada uno.",
      "Pasa y corre a ocupar el cono al que has pasado.",
      "El que recibe controla orientado y repite.",
      "Cambia el sentido a los 2 minutos.",
    ],
    keys: [
      "Pase y desmarque inmediato (pase y sigue).",
      "Control orientado hacia el siguiente cono.",
      "Ritmo alto y constante.",
    ],
    diagram: [
      { t: "player", x: 18, y: 48, color: "a", label: "1" },
      { t: "player", x: 82, y: 48, color: "a", label: "2" },
      { t: "player", x: 50, y: 12, color: "a", label: "3" },
      { t: "ball", x: 22, y: 48 },
      { t: "arrow", x1: 23, y1: 47, x2: 48, y2: 15 },
      { t: "run", x1: 22, y1: 51, x2: 46, y2: 16 },
    ],
  },
  {
    id: "ctrl-orientado",
    name: "Control orientado en rombo",
    category: "control",
    level: "Intermedio",
    players: "2",
    durationMin: 10,
    equipment: ["4 conos", "1 balón"],
    steps: [
      "Rombo de conos de 8 m; recibes en el centro.",
      "Un compañero te pasa; controla con el primer toque hacia un cono libre.",
      "Sal conduciendo 2 m y devuelve el balón.",
      "Alterna el lado del control cada repetición.",
    ],
    keys: [
      "Primer toque hacia el espacio, no hacia los pies.",
      "Abre el cuerpo antes de recibir (perfil).",
      "Controla con la superficie más lejana al rival imaginario.",
    ],
    diagram: [
      { t: "player", x: 50, y: 32, color: "a", label: "1" },
      { t: "player", x: 12, y: 32, color: "a", label: "2" },
      { t: "ball", x: 16, y: 32 },
      { t: "cone", x: 50, y: 12 },
      { t: "cone", x: 78, y: 32 },
      { t: "cone", x: 50, y: 52 },
      { t: "cone", x: 32, y: 32 },
      { t: "arrow", x1: 17, y1: 32, x2: 46, y2: 32 },
      { t: "dribble", x1: 53, y1: 30, x2: 74, y2: 20 },
    ],
  },
  {
    id: "ctrl-primer-toque",
    name: "Primer toque contra pared",
    category: "control",
    level: "Base",
    players: "1",
    durationMin: 8,
    equipment: ["1 pared", "1 balón"],
    solo: true,
    steps: [
      "Lanza o pasa fuerte contra la pared.",
      "Controla el rebote con un solo toque dejándolo listo para el segundo.",
      "Alterna interior, exterior y planta.",
      "Añade un giro de 180° tras el control.",
    ],
    keys: [
      "Amortigua: cede con la superficie en el impacto.",
      "Deja el balón en zona de juego, no pegado al cuerpo.",
      "Segundo toque siempre disponible.",
    ],
    diagram: [
      { t: "player", x: 24, y: 32, color: "a", label: "1" },
      { t: "ball", x: 28, y: 32 },
      { t: "zone", x: 90, y: 8, w: 4, h: 48 },
      { t: "arrow", x1: 29, y1: 30, x2: 88, y2: 26 },
      { t: "arrow", x1: 88, y1: 36, x2: 31, y2: 38 },
    ],
  },
  {
    id: "tiro-conduccion",
    name: "Finalización tras conducción",
    category: "tiro",
    level: "Intermedio",
    players: "1",
    durationMin: 12,
    equipment: ["3 conos", "portería", "varios balones"],
    solo: true,
    steps: [
      "Conduce en línea sorteando 2-3 conos desde el centro del campo.",
      "Tras el último cono, define a portería con el interior o empeine.",
      "Alterna palo largo y palo corto.",
      "8-10 disparos por pierna.",
    ],
    keys: [
      "Último toque para armar la pierna, no pegado.",
      "Cabeza firme y mirada a la portería al golpear.",
      "Coloca antes que potencia: elige el palo.",
    ],
    diagram: [
      { t: "goal", x: 92, y: 32, w: 22 },
      { t: "player", x: 10, y: 40, color: "a", label: "1" },
      { t: "ball", x: 14, y: 40 },
      { t: "cone", x: 35, y: 36 },
      { t: "cone", x: 52, y: 42 },
      { t: "cone", x: 68, y: 34 },
      { t: "dribble", x1: 15, y1: 40, x2: 74, y2: 36 },
      { t: "arrow", x1: 76, y1: 35, x2: 90, y2: 30 },
    ],
  },
  {
    id: "tiro-1v1-portero",
    name: "Definición 1v1 con portero",
    category: "tiro",
    level: "Avanzado",
    players: "2",
    durationMin: 12,
    equipment: ["portería", "portero", "varios balones"],
    steps: [
      "Arranca desde 25 m conduciendo hacia el portero que sale.",
      "Decide: definición cruzada, vaselina o recorte y tiro.",
      "Ejecuta a máxima velocidad de partido.",
      "6-8 repeticiones con descanso.",
    ],
    keys: [
      "Levanta la cabeza para leer la salida del portero.",
      "Si sale rápido: vaselina o recorte; si espera: cruzado abajo.",
      "Golpe seco y decidido, sin dudar.",
    ],
    diagram: [
      { t: "goal", x: 92, y: 32, w: 22 },
      { t: "player", x: 12, y: 34, color: "a", label: "1" },
      { t: "ball", x: 16, y: 34 },
      { t: "player", x: 78, y: 32, color: "b", label: "P" },
      { t: "dribble", x1: 17, y1: 34, x2: 66, y2: 33 },
      { t: "arrow", x1: 68, y1: 33, x2: 90, y2: 40 },
    ],
  },
  {
    id: "aereo-remate",
    name: "Remate de cabeza tras centro",
    category: "aereo",
    level: "Intermedio",
    players: "2",
    durationMin: 10,
    equipment: ["portería", "varios balones"],
    steps: [
      "Un compañero centra desde la banda.",
      "Atacas el balón saltando y rematas de cabeza hacia abajo.",
      "Trabaja el timing del salto y el ataque al balón.",
      "Alterna primer y segundo palo.",
    ],
    keys: [
      "Ataca el balón, no lo esperes: salto hacia él.",
      "Golpea con la frente y dirige hacia abajo.",
      "Cuello firme y ojos abiertos en el impacto.",
    ],
    diagram: [
      { t: "goal", x: 92, y: 32, w: 22 },
      { t: "player", x: 30, y: 56, color: "a", label: "2" },
      { t: "ball", x: 34, y: 56 },
      { t: "player", x: 72, y: 30, color: "a", label: "1" },
      { t: "arrow", x1: 35, y1: 55, x2: 72, y2: 30 },
      { t: "run", x1: 60, y1: 40, x2: 72, y2: 28 },
      { t: "arrow", x1: 74, y1: 31, x2: 90, y2: 36 },
    ],
  },
  {
    id: "coord-escalera",
    name: "Escalera + control",
    category: "coordinacion",
    level: "Base",
    players: "1",
    durationMin: 8,
    equipment: ["escalera de agilidad", "1 balón", "1 pared"],
    solo: true,
    steps: [
      "Haz una serie de pies rápidos en la escalera de coordinación.",
      "Al salir, recibe un pase de la pared y contrólalo.",
      "Vuelve al inicio y repite con distinto patrón de pies.",
      "6-8 series.",
    ],
    keys: [
      "Pies rápidos y activos, apoyos cortos.",
      "Transición inmediata de la escalera al control.",
      "Mantén la postura erguida y los brazos activos.",
    ],
    diagram: [
      { t: "zone", x: 10, y: 26, w: 34, h: 12 },
      { t: "player", x: 14, y: 32, color: "a", label: "1" },
      { t: "run", x1: 18, y1: 32, x2: 46, y2: 32 },
      { t: "zone", x: 90, y: 14, w: 4, h: 36 },
      { t: "arrow", x1: 88, y1: 32, x2: 50, y2: 32 },
      { t: "ball", x: 52, y: 32 },
    ],
  },
];
