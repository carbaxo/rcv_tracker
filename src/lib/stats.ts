import type { Goal, PersonalRecord, Workout } from "./types";

export function workoutVolumeKg(w: Workout): number {
  if (w.type !== "gym" || !w.exercises) return 0;
  return w.exercises.reduce(
    (acc, ex) => acc + ex.sets.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0),
    0
  );
}

// Fórmula de Epley para estimar la repetición máxima (1RM)
export function epley1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // lunes = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

// Ritmo medio en min/km para cardio
export function pace(durationMin: number, distanceKm: number): string {
  if (!distanceKm || !durationMin) return "—";
  const p = durationMin / distanceKm;
  const min = Math.floor(p);
  const sec = Math.round((p - min) * 60);
  return `${min}:${String(sec).padStart(2, "0")} /km`;
}

export function weekWorkouts(workouts: Workout[], ref = new Date()): Workout[] {
  const start = isoDate(startOfWeek(ref));
  const end = isoDate(new Date(startOfWeek(ref).getTime() + 6 * 86400000));
  return workouts.filter((w) => w.date >= start && w.date <= end);
}

export function monthCardioKm(workouts: Workout[], ref = new Date()): number {
  const prefix = isoDate(ref).slice(0, 7);
  return workouts
    .filter((w) => w.type === "cardio" && w.date.startsWith(prefix))
    .reduce((a, w) => a + (w.cardio?.distanceKm || 0), 0);
}

// Racha: número de días consecutivos (hacia atrás desde hoy o ayer) con entrenamiento
export function streakDays(workouts: Workout[]): number {
  const days = new Set(workouts.map((w) => w.date));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(isoDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(isoDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Récords personales por ejercicio: mejor serie por peso (con su 1RM estimado)
export function personalRecords(workouts: Workout[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();
  for (const w of workouts) {
    if (w.type !== "gym" || !w.exercises) continue;
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        if (!s.weight || !s.reps) continue;
        const current = best.get(ex.name);
        const est = epley1RM(s.weight, s.reps);
        if (!current || est > current.est1RM) {
          best.set(ex.name, {
            exerciseName: ex.name,
            maxWeight: s.weight,
            reps: s.reps,
            est1RM: est,
            date: w.date,
          });
        }
      }
    }
  }
  return [...best.values()].sort((a, b) => b.est1RM - a.est1RM);
}

// Serie temporal de volumen semanal (últimas n semanas) para gráficas
export function weeklyVolumeSeries(workouts: Workout[], weeks = 8) {
  const out: { week: string; volumen: number; sesiones: number; km: number }[] = [];
  const now = startOfWeek(new Date());
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = new Date(now.getTime() - i * 7 * 86400000);
    const inWeek = weekWorkouts(workouts, ws);
    out.push({
      week: ws.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      volumen: Math.round(inWeek.reduce((a, w) => a + (w.volumeKg || 0), 0)),
      sesiones: inWeek.length,
      km: Math.round(
        inWeek.reduce((a, w) => a + (w.cardio?.distanceKm || 0), 0) * 10
      ) / 10,
    });
  }
  return out;
}

// Evolución del mejor peso levantado en un ejercicio concreto
export function exerciseProgress(workouts: Workout[], exerciseName: string) {
  const points: { date: string; label: string; peso: number; rm: number }[] = [];
  const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
  for (const w of sorted) {
    if (w.type !== "gym" || !w.exercises) continue;
    for (const ex of w.exercises) {
      if (ex.name !== exerciseName) continue;
      let maxW = 0;
      let maxRM = 0;
      for (const s of ex.sets) {
        if (s.weight > maxW) maxW = s.weight;
        const rm = epley1RM(s.weight, s.reps);
        if (rm > maxRM) maxRM = rm;
      }
      if (maxW > 0) {
        points.push({
          date: w.date,
          label: formatDateShort(w.date),
          peso: maxW,
          rm: Math.round(maxRM * 10) / 10,
        });
      }
    }
  }
  return points;
}

export function goalProgress(goal: Goal, workouts: Workout[], bodyWeightKg?: number): number {
  switch (goal.type) {
    case "distancia_mes":
      return monthCardioKm(workouts);
    case "sesiones_semana":
      return weekWorkouts(workouts).length;
    case "peso_ejercicio": {
      const pr = personalRecords(workouts).find(
        (p) => p.exerciseName === goal.exerciseName
      );
      return pr?.maxWeight ?? 0;
    }
    case "peso_corporal":
      return bodyWeightKg ?? 0;
  }
}

export const GOAL_TYPE_LABELS: Record<Goal["type"], { label: string; unit: string }> = {
  distancia_mes: { label: "Distancia mensual", unit: "km" },
  sesiones_semana: { label: "Sesiones por semana", unit: "sesiones" },
  peso_ejercicio: { label: "Peso en ejercicio", unit: "kg" },
  peso_corporal: { label: "Peso corporal", unit: "kg" },
};
