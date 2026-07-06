"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { addExercise, deleteExercise, useCustomExercises } from "@/lib/db";
import { EXERCISE_LIBRARY } from "@/lib/exercisesSeed";
import { MUSCLE_GROUPS, type Exercise, type MuscleGroup } from "@/lib/types";

export default function EjerciciosPage() {
  return (
    <AppShell>
      <Ejercicios />
    </AppShell>
  );
}

function Ejercicios() {
  const { user } = useAuth();
  const { data: custom } = useCustomExercises();
  const [group, setGroup] = useState<MuscleGroup | "todos">("todos");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [newGroup, setNewGroup] = useState<MuscleGroup>("pecho");
  const [equipment, setEquipment] = useState("");
  const [instructions, setInstructions] = useState("");

  const all: Exercise[] = useMemo(
    () => [...custom.map((e) => ({ ...e, custom: true })), ...EXERCISE_LIBRARY],
    [custom]
  );

  const filtered = all.filter(
    (e) =>
      (group === "todos" || e.muscleGroup === group) &&
      e.name.toLowerCase().includes(search.toLowerCase())
  );

  const create = async () => {
    if (!user || !name.trim()) return;
    await addExercise(user.uid, {
      name: name.trim(),
      muscleGroup: newGroup,
      equipment: equipment.trim() || undefined,
      instructions: instructions.trim() || undefined,
      custom: true,
    });
    setName("");
    setEquipment("");
    setInstructions("");
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Biblioteca de ejercicios</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
          {showForm ? "Cancelar" : "+ Crear"}
        </button>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <p className="font-semibold">Nuevo ejercicio personalizado</p>
          <input
            className="input"
            placeholder="Nombre del ejercicio"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="input capitalize"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value as MuscleGroup)}
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g} className="capitalize">
                  {g}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Equipamiento (opcional)"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
            />
          </div>
          <textarea
            className="input"
            rows={2}
            placeholder="Instrucciones o notas de técnica (opcional)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <button onClick={create} disabled={!name.trim()} className="btn-primary">
            Guardar ejercicio
          </button>
        </div>
      )}

      <input
        className="input"
        placeholder="🔍 Buscar ejercicio…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setGroup("todos")}
          className={`chip capitalize ${
            group === "todos" ? "bg-accent/20 text-accent" : "bg-base-800 text-slate-400"
          }`}
        >
          todos
        </button>
        {MUSCLE_GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`chip capitalize ${
              group === g ? "bg-accent/20 text-accent" : "bg-base-800 text-slate-400"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((e, i) => (
          <div key={`${e.name}-${i}`} className="card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {e.name}
                  {e.custom && (
                    <span className="ml-2 chip bg-accent/15 text-accent">propio</span>
                  )}
                </p>
                <p className="text-xs capitalize text-slate-400">
                  {e.muscleGroup}
                  {e.equipment ? ` · ${e.equipment}` : ""}
                </p>
              </div>
              {e.custom && e.id && (
                <button
                  onClick={() => user && deleteExercise(user.uid, e.id!)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Eliminar
                </button>
              )}
            </div>
            {e.instructions && (
              <p className="mt-2 text-sm text-slate-400">{e.instructions}</p>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400">No hay ejercicios que coincidan.</p>
        )}
      </div>
    </div>
  );
}
