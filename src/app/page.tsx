"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import WorkoutCard from "@/components/WorkoutCard";
import WeeklyChart from "@/components/WeeklyChart";
import { useAuth } from "@/context/AuthContext";
import { useGoals, useWorkouts, useBodyMetrics } from "@/lib/db";
import {
  GOAL_TYPE_LABELS,
  formatDuration,
  goalProgress,
  monthCardioKm,
  streakDays,
  weekWorkouts,
  weeklyVolumeSeries,
} from "@/lib/stats";

export default function DashboardPage() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { data: workouts, loading } = useWorkouts();
  const { data: goals } = useGoals();
  const { data: metrics } = useBodyMetrics();

  const thisWeek = weekWorkouts(workouts);
  const weekMinutes = thisWeek.reduce((a, w) => a + w.durationMin, 0);
  const weekVolume = thisWeek.reduce((a, w) => a + (w.volumeKg || 0), 0);
  const series = weeklyVolumeSeries(workouts);
  const streak = streakDays(workouts);
  const latestWeight = metrics[0]?.weightKg;

  const firstName = user?.displayName?.split(" ")[0] ?? "atleta";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hola, {firstName} 👋</h1>
          <p className="text-sm text-slate-400">
            {thisWeek.length > 0
              ? `Llevas ${thisWeek.length} ${thisWeek.length === 1 ? "sesión" : "sesiones"} esta semana. ¡Sigue así!`
              : "Aún no has entrenado esta semana. ¡Hoy es un buen día!"}
          </p>
        </div>
        <Link href="/entrenar" className="btn-primary shrink-0">
          + Entrenar
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Racha"
          value={`${streak} ${streak === 1 ? "día" : "días"}`}
          sub="días seguidos entrenando"
        />
        <StatCard
          label="Esta semana"
          value={`${thisWeek.length} sesiones`}
          sub={formatDuration(weekMinutes)}
          accent="blue"
        />
        <StatCard
          label="Cardio este mes"
          value={`${monthCardioKm(workouts).toFixed(1)} km`}
          accent="orange"
        />
        <StatCard
          label="Volumen semanal"
          value={`${Math.round(weekVolume).toLocaleString("es-ES")} kg`}
          sub={latestWeight ? `peso corporal: ${latestWeight} kg` : undefined}
        />
      </div>

      {workouts.length > 0 && (
        <div className="card">
          <h2 className="mb-3 font-semibold">Actividad de las últimas 8 semanas</h2>
          <WeeklyChart data={series} />
        </div>
      )}

      {goals.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">🎯 Objetivos</h2>
            <Link href="/progreso" className="text-xs text-accent hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {goals.slice(0, 4).map((g) => {
              const current = goalProgress(g, workouts, metrics[0]?.weightKg);
              const pct = Math.min(100, (current / g.target) * 100);
              const unit = GOAL_TYPE_LABELS[g.type].unit;
              return (
                <div key={g.id} className="card">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{g.title}</span>
                    <span className="text-slate-400">
                      {Math.round(current * 10) / 10} / {g.target} {unit}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-base-700">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Últimos entrenamientos</h2>
          {workouts.length > 6 && (
            <Link href="/historial" className="text-xs text-accent hover:underline">
              Ver historial completo
            </Link>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">Cargando…</p>
        ) : workouts.length === 0 ? (
          <div className="card text-center">
            <p className="text-4xl">🌱</p>
            <p className="mt-2 font-medium">Todavía no hay entrenamientos</p>
            <p className="mt-1 text-sm text-slate-400">
              Registra tu primera sesión de cardio o gimnasio y empieza a ver tu
              progreso.
            </p>
            <Link href="/entrenar" className="btn-primary mt-4">
              Registrar entrenamiento
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.slice(0, 6).map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
