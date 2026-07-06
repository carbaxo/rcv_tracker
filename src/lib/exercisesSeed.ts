import type { Exercise } from "./types";

// Biblioteca base de ejercicios. El usuario puede añadir los suyos propios
// desde la sección "Ejercicios"; los personalizados se guardan en Firestore.
export const EXERCISE_LIBRARY: Exercise[] = [
  // Pecho
  { name: "Press banca", muscleGroup: "pecho", equipment: "Barra", instructions: "Tumbado en banco plano, baja la barra al pecho con control y empuja hasta extender los brazos." },
  { name: "Press banca inclinado", muscleGroup: "pecho", equipment: "Barra", instructions: "En banco inclinado a 30-45°, enfatiza la parte superior del pectoral." },
  { name: "Press con mancuernas", muscleGroup: "pecho", equipment: "Mancuernas", instructions: "Mayor rango de movimiento que la barra; controla la bajada." },
  { name: "Aperturas con mancuernas", muscleGroup: "pecho", equipment: "Mancuernas", instructions: "Brazos semiflexionados, abre en arco hasta sentir estiramiento en el pecho." },
  { name: "Fondos en paralelas", muscleGroup: "pecho", equipment: "Peso corporal", instructions: "Inclina el torso hacia delante para enfatizar el pecho." },
  { name: "Cruce en poleas", muscleGroup: "pecho", equipment: "Polea", instructions: "Junta las manos delante del pecho manteniendo tensión constante." },
  // Espalda
  { name: "Dominadas", muscleGroup: "espalda", equipment: "Peso corporal", instructions: "Agarre prono, sube hasta que la barbilla supere la barra." },
  { name: "Remo con barra", muscleGroup: "espalda", equipment: "Barra", instructions: "Torso inclinado, lleva la barra hacia el abdomen apretando las escápulas." },
  { name: "Remo con mancuerna", muscleGroup: "espalda", equipment: "Mancuerna", instructions: "Apoya rodilla y mano en el banco, rema con el otro brazo." },
  { name: "Jalón al pecho", muscleGroup: "espalda", equipment: "Polea", instructions: "Tira de la barra hacia la clavícula manteniendo el pecho alto." },
  { name: "Remo en polea baja", muscleGroup: "espalda", equipment: "Polea", instructions: "Espalda recta, tira hacia el abdomen y aprieta las escápulas." },
  { name: "Peso muerto", muscleGroup: "espalda", equipment: "Barra", instructions: "Cadera atrás, espalda neutra; empuja el suelo con las piernas." },
  // Pierna
  { name: "Sentadilla", muscleGroup: "pierna", equipment: "Barra", instructions: "Baja hasta que el muslo quede paralelo al suelo, rodillas alineadas con los pies." },
  { name: "Prensa de piernas", muscleGroup: "pierna", equipment: "Máquina", instructions: "No bloquees las rodillas al extender." },
  { name: "Zancadas", muscleGroup: "pierna", equipment: "Mancuernas", instructions: "Paso largo, rodilla trasera casi toca el suelo." },
  { name: "Extensión de cuádriceps", muscleGroup: "pierna", equipment: "Máquina", instructions: "Extiende con control y aguanta un segundo arriba." },
  { name: "Curl femoral", muscleGroup: "pierna", equipment: "Máquina", instructions: "Flexiona las rodillas llevando el talón al glúteo." },
  { name: "Elevación de gemelos", muscleGroup: "pierna", equipment: "Máquina", instructions: "Sube sobre las puntas de los pies con pausa arriba." },
  // Glúteo
  { name: "Hip thrust", muscleGroup: "gluteo", equipment: "Barra", instructions: "Espalda apoyada en banco, empuja la cadera hacia arriba y aprieta el glúteo." },
  { name: "Peso muerto rumano", muscleGroup: "gluteo", equipment: "Barra", instructions: "Piernas semirrígidas, baja la barra pegada a las piernas." },
  { name: "Patada de glúteo en polea", muscleGroup: "gluteo", equipment: "Polea", instructions: "Extiende la pierna hacia atrás con control." },
  // Hombro
  { name: "Press militar", muscleGroup: "hombro", equipment: "Barra", instructions: "De pie, empuja la barra por encima de la cabeza sin arquear la zona lumbar." },
  { name: "Press de hombro con mancuernas", muscleGroup: "hombro", equipment: "Mancuernas", instructions: "Sentado con respaldo, empuja las mancuernas hasta juntarlas arriba." },
  { name: "Elevaciones laterales", muscleGroup: "hombro", equipment: "Mancuernas", instructions: "Eleva los brazos hasta la altura de los hombros con codos semiflexionados." },
  { name: "Pájaros (deltoide posterior)", muscleGroup: "hombro", equipment: "Mancuernas", instructions: "Torso inclinado, abre los brazos hacia los lados." },
  { name: "Face pull", muscleGroup: "hombro", equipment: "Polea", instructions: "Tira de la cuerda hacia la cara separando las manos." },
  // Bíceps
  { name: "Curl con barra", muscleGroup: "biceps", equipment: "Barra", instructions: "Codos pegados al cuerpo, sube la barra sin balancearte." },
  { name: "Curl con mancuernas", muscleGroup: "biceps", equipment: "Mancuernas", instructions: "Alterna brazos, gira la muñeca al subir (supinación)." },
  { name: "Curl martillo", muscleGroup: "biceps", equipment: "Mancuernas", instructions: "Agarre neutro, trabaja también el antebrazo." },
  // Tríceps
  { name: "Press francés", muscleGroup: "triceps", equipment: "Barra Z", instructions: "Tumbado, baja la barra hacia la frente flexionando solo los codos." },
  { name: "Extensión de tríceps en polea", muscleGroup: "triceps", equipment: "Polea", instructions: "Codos fijos, extiende los brazos hacia abajo." },
  { name: "Fondos en banco", muscleGroup: "triceps", equipment: "Peso corporal", instructions: "Manos en el banco detrás de ti, baja flexionando los codos." },
  // Core
  { name: "Plancha", muscleGroup: "core", equipment: "Peso corporal", instructions: "Cuerpo recto de cabeza a talones, aprieta el abdomen. Registra segundos como repeticiones." },
  { name: "Crunch abdominal", muscleGroup: "core", equipment: "Peso corporal", instructions: "Eleva los hombros del suelo contrayendo el abdomen." },
  { name: "Elevación de piernas", muscleGroup: "core", equipment: "Peso corporal", instructions: "Colgado o tumbado, eleva las piernas rectas." },
  { name: "Rueda abdominal", muscleGroup: "core", equipment: "Rueda", instructions: "Rueda hacia delante manteniendo la cadera estable." },
  { name: "Russian twist", muscleGroup: "core", equipment: "Disco", instructions: "Sentado con torso inclinado, gira el tronco de lado a lado." },
  // Cuerpo completo
  { name: "Burpees", muscleGroup: "cuerpo completo", equipment: "Peso corporal", instructions: "Flexión + salto. Registra repeticiones." },
  { name: "Clean and press", muscleGroup: "cuerpo completo", equipment: "Barra", instructions: "Cargada al hombro y press por encima de la cabeza." },
  { name: "Kettlebell swing", muscleGroup: "cuerpo completo", equipment: "Kettlebell", instructions: "Impulso de cadera, no de brazos." },
];
