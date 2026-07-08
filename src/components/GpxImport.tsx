"use client";

import { useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addWorkout, useWorkouts } from "@/lib/db";
import { parseGpx } from "@/lib/gpx";

// Importador de archivos GPX: acepta varios a la vez (por ejemplo, la
// carpeta "activities" de la exportación gratuita de Strava).
export default function GpxImport() {
  const { user } = useAuth();
  const { data: workouts } = useWorkouts();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const existingIds = useMemo(
    () =>
      new Set(
        workouts.map((w) => w.gpxId).filter((id): id is string => Boolean(id))
      ),
    [workouts]
  );

  const importFiles = async (files: FileList | null) => {
    if (!user || !files || files.length === 0) return;
    setBusy(true);
    setResult(null);
    let imported = 0;
    let duplicated = 0;
    let invalid = 0;
    const list = Array.from(files);

    for (let i = 0; i < list.length; i++) {
      setProgress(`Procesando ${i + 1} de ${list.length}…`);
      try {
        const workout = parseGpx(await list[i].text(), list[i].name);
        if (!workout) {
          invalid++;
          continue;
        }
        if (workout.gpxId && existingIds.has(workout.gpxId)) {
          duplicated++;
          continue;
        }
        if (workout.gpxId) existingIds.add(workout.gpxId);
        await addWorkout(user.uid, workout);
        imported++;
      } catch (e) {
        console.error(`Error importando ${list[i].name}:`, e);
        invalid++;
      }
    }

    setResult(
      `✅ ${imported} ${imported === 1 ? "actividad importada" : "actividades importadas"}` +
        (duplicated ? ` · ${duplicated} ya existían` : "") +
        (invalid ? ` · ${invalid} archivos no válidos` : "")
    );
    setProgress("");
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="card space-y-3">
      <h2 className="font-semibold">📁 Importar archivos GPX</h2>
      <p className="text-sm text-slate-400">
        Trae tus actividades antiguas de Strava, Garmin o cualquier reloj:
        selecciona uno o varios archivos <code className="rounded bg-base-800 px-1">.gpx</code>{" "}
        y se importarán con su ruta, distancia, tiempo y pulsaciones. Los
        duplicados se detectan y se omiten.
      </p>
      <p className="text-xs text-slate-500">
        💡 En Strava (gratis): cada actividad → ⋯ → «Exportar GPX». O todo tu
        historial de golpe: Ajustes → Mi cuenta → «Descarga o elimina tu
        cuenta» → los .gpx llegan en la carpeta <em>activities</em> del ZIP.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".gpx,application/gpx+xml"
        multiple
        disabled={busy}
        onChange={(e) => importFiles(e.target.files)}
        className="block w-full text-sm text-slate-400 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-accent file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-base-950 hover:file:bg-accent-soft disabled:opacity-50"
      />
      {busy && <p className="text-sm text-gym">{progress}</p>}
      {result && <p className="text-sm text-slate-200">{result}</p>}
    </div>
  );
}
