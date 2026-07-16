"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addPlan } from "@/lib/db";
import { useExerciseLibrary } from "@/lib/exerciseLibrary";
import { ROUTINE_TEMPLATES, type RoutineTemplate } from "@/lib/routineTemplates";
import type { PlanDay } from "@/lib/types";
import ExerciseImage from "./ExerciseImage";

const LEVEL_COLOR: Record<RoutineTemplate["level"], string> = {
  Principiante: "bg-emerald-500/15 text-emerald-400",
  Intermedio: "bg-amber-500/15 text-amber-400",
  Avanzado: "bg-red-500/15 text-red-400",
};

// Copia profunda de los días de una plantilla para poder editarlos sin
// modificar la plantilla original.
const cloneDays = (days: PlanDay[]): PlanDay[] =>
  days.map((d) => ({ ...d, exercises: d.exercises.map((e) => ({ ...e })) }));

type SwapTarget = { di: number; ei: number | null };

export default function RoutineTemplates({ onAdded }: { onAdded?: () => void }) {
  const { user } = useAuth();
  const { library } = useExerciseLibrary();
  const [preview, setPreview] = useState<RoutineTemplate | null>(null);
  const [draft, setDraft] = useState<PlanDay[]>([]);
  const [swap, setSwap] = useState<SwapTarget | null>(null);
  const [swapSearch, setSwapSearch] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const libByName = useMemo(() => {
    const m = new Map<string, (typeof library)[number]>();
    for (const e of library) if (!m.has(e.name)) m.set(e.name, e);
    return m;
  }, [library]);

  const open = (tpl: RoutineTemplate) => {
    setPreview(tpl);
    setDraft(cloneDays(tpl.days));
    setSwap(null);
    setSwapSearch("");
  };

  const close = () => {
    setPreview(null);
    setSwap(null);
    setSwapSearch("");
  };

  const removeExercise = (di: number, ei: number) => {
    setDraft((ds) =>
      ds.map((d, i) =>
        i !== di ? d : { ...d, exercises: d.exercises.filter((_, j) => j !== ei) }
      )
    );
  };

  const applyPick = (name: string) => {
    if (!swap) return;
    setDraft((ds) =>
      ds.map((d, i) => {
        if (i !== swap.di) return d;
        if (swap.ei === null) {
          return { ...d, exercises: [...d.exercises, { name, sets: 3, reps: "8-12" }] };
        }
        return {
          ...d,
          exercises: d.exercises.map((e, j) => (j === swap.ei ? { ...e, name } : e)),
        };
      })
    );
    setSwap(null);
    setSwapSearch("");
  };

  const add = async () => {
    if (!user || !preview) return;
    setAddingId(preview.id);
    try {
      await addPlan(user.uid, {
        name: preview.name,
        description: preview.description,
        days: draft,
        active: false,
        createdAt: Date.now(),
      });
      close();
      onAdded?.();
    } catch (e) {
      alert("No se pudo añadir la rutina.");
      console.error(e);
    } finally {
      setAddingId(null);
    }
  };

  // Lista de sugerencias para el cambio/alta de ejercicio: por defecto, los del
  // mismo grupo muscular que el que se sustituye; al buscar, en toda la biblioteca.
  const swapGroup =
    swap && swap.ei !== null
      ? libByName.get(draft[swap.di]?.exercises[swap.ei]?.name ?? "")?.muscleGroup
      : undefined;
  const swapList = useMemo(() => {
    if (!swap) return [];
    const q = swapSearch.trim().toLowerCase();
    return library
      .filter((e) =>
        q ? e.name.toLowerCase().includes(q) : swapGroup ? e.muscleGroup === swapGroup : true
      )
      .slice(0, 50);
  }, [swap, swapSearch, library, swapGroup]);

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
            <button onClick={() => open(tpl)} className="btn-primary w-full !py-1.5 !text-xs">
              Ver y personalizar
            </button>
          </div>
        ))}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={close}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-base-900 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {swap ? (
              /* ---- Selector de ejercicio (cambiar o añadir) ---- */
              <>
                <div className="flex items-center gap-3 border-b border-base-700/60 p-4">
                  <button
                    onClick={() => {
                      setSwap(null);
                      setSwapSearch("");
                    }}
                    className="text-sm text-accent hover:underline"
                  >
                    ← Volver
                  </button>
                  <p className="font-semibold">
                    {swap.ei === null ? "Añadir ejercicio" : "Cambiar ejercicio"}
                  </p>
                </div>
                <div className="p-4">
                  <input
                    autoFocus
                    className="input"
                    placeholder="🔍 Buscar en la biblioteca…"
                    value={swapSearch}
                    onChange={(e) => setSwapSearch(e.target.value)}
                  />
                  {!swapSearch && swapGroup && (
                    <p className="mt-2 text-xs text-slate-500">
                      Sugerencias de <span className="capitalize">{swapGroup}</span> · busca para
                      ver todos
                    </p>
                  )}
                </div>
                <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 pb-4">
                  {swapList.map((e, i) => (
                    <button
                      key={`${e.id ?? e.name}-${i}`}
                      onClick={() => applyPick(e.name)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-base-800"
                    >
                      <ExerciseImage
                        media={e.media}
                        alt={e.name}
                        className="h-10 w-10 shrink-0 rounded-lg"
                      />
                      <span className="min-w-0 flex-1 truncate">{e.name}</span>
                      <span className="shrink-0 text-xs capitalize text-slate-500">
                        {e.muscleGroup}
                      </span>
                    </button>
                  ))}
                  {swapList.length === 0 && (
                    <p className="px-2 py-4 text-sm text-slate-400">
                      No hay ejercicios que coincidan.
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* ---- Vista de la rutina (editable) ---- */
              <>
                <div className="flex items-start justify-between gap-3 border-b border-base-700/60 p-5">
                  <div>
                    <h2 className="text-xl font-bold">
                      {preview.emoji} {preview.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">{preview.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Toca 🔄 para cambiar un ejercicio o ✕ para quitarlo antes de añadir la rutina.
                    </p>
                  </div>
                  <button
                    onClick={close}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-base-800 text-lg"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-5">
                  {draft.map((day, di) => (
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
                        <ul className="mt-2 space-y-1">
                          {day.exercises.map((e, ei) => (
                            <li
                              key={ei}
                              className="flex items-center gap-2 text-xs text-slate-300"
                            >
                              <span className="min-w-0 flex-1 truncate">
                                {e.name}{" "}
                                <span className="text-slate-500">
                                  — {e.sets}×{e.reps}
                                </span>
                              </span>
                              <button
                                onClick={() => setSwap({ di, ei })}
                                className="shrink-0 rounded-md px-1.5 py-0.5 text-slate-400 hover:bg-base-700 hover:text-accent"
                                aria-label="Cambiar ejercicio"
                                title="Cambiar"
                              >
                                🔄
                              </button>
                              <button
                                onClick={() => removeExercise(di, ei)}
                                className="shrink-0 rounded-md px-1.5 py-0.5 text-slate-500 hover:bg-base-700 hover:text-red-400"
                                aria-label="Quitar ejercicio"
                                title="Quitar"
                              >
                                ✕
                              </button>
                            </li>
                          ))}
                          <li>
                            <button
                              onClick={() => setSwap({ di, ei: null })}
                              className="mt-1 text-xs font-semibold text-accent hover:underline"
                            >
                              + Añadir ejercicio
                            </button>
                          </li>
                        </ul>
                      )}

                      {day.type === "cardio" && day.cardioNote && (
                        <p className="mt-2 text-xs text-slate-400">{day.cardioNote}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-base-700/60 p-4">
                  <button
                    onClick={add}
                    disabled={addingId === preview.id}
                    className="btn-primary w-full py-3"
                  >
                    {addingId === preview.id ? "Añadiendo…" : "Añadir a mis planes"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
