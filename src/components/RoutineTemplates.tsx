"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addPlan } from "@/lib/db";
import { ROUTINE_TEMPLATES, type RoutineTemplate } from "@/lib/routineTemplates";

const LEVEL_COLOR: Record<RoutineTemplate["level"], string> = {
  Principiante: "bg-emerald-500/15 text-emerald-400",
  Intermedio: "bg-amber-500/15 text-amber-400",
  Avanzado: "bg-red-500/15 text-red-400",
};

export default function RoutineTemplates({ onAdded }: { onAdded?: () => void }) {
  const { user } = useAuth();
  const [preview, setPreview] = useState<RoutineTemplate | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const add = async (tpl: RoutineTemplate) => {
    if (!user) return;
    setAddingId(tpl.id);
    try {
      await addPlan(user.uid, {
        name: tpl.name,
        description: tpl.description,
        days: tpl.days,
        active: false,
        createdAt: Date.now(),
      });
      setPreview(null);
      onAdded?.();
    } catch (e) {
      alert("No se pudo añadir la rutina.");
      console.error(e);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {ROUTINE_TEMPLATES.map((tpl) => (
          <div key={tpl.id} className="card space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{tpl.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{tpl.name}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className={`chip ${LEVEL_COLOR[tpl.level]}`}>{tpl.level}</span>
                  <span className="chip bg-base-800 text-slate-300">
                    {tpl.daysPerWeek} días/sem
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400">{tpl.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPreview(tpl)}
                className="btn-secondary flex-1 !py-1.5 !text-xs"
              >
                Ver rutina
              </button>
              <button
                onClick={() => add(tpl)}
                disabled={addingId === tpl.id}
                className="btn-primary flex-1 !py-1.5 !text-xs"
              >
                {addingId === tpl.id ? "Añadiendo…" : "Añadir a mis planes"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-base-900 p-5 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {preview.emoji} {preview.name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">{preview.description}</p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-base-800 text-lg"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {preview.days.map((day, di) => (
                <div
                  key={di}
                  className="rounded-xl border border-base-700/60 bg-base-800/50 p-3"
                >
                  <p className="text-sm font-semibold">
                    {day.type === "descanso" ? "😴" : day.type === "cardio" ? "🏃" : "🏋️"}{" "}
                    {day.name}
                  </p>
                  {day.focus && <p className="text-xs text-slate-400">{day.focus}</p>}
                  {day.type === "gym" && (
                    <ul className="mt-2 space-y-0.5 text-xs text-slate-400">
                      {day.exercises.map((e, i) => (
                        <li key={i}>
                          {e.name} — {e.sets}×{e.reps}
                        </li>
                      ))}
                    </ul>
                  )}
                  {day.type === "cardio" && day.cardioNote && (
                    <p className="mt-2 text-xs text-slate-400">{day.cardioNote}</p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => add(preview)}
              disabled={addingId === preview.id}
              className="btn-primary mt-4 w-full py-3"
            >
              {addingId === preview.id ? "Añadiendo…" : "Añadir a mis planes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
