"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import DrillPitch from "@/components/DrillPitch";
import {
  CATEGORY_LABEL,
  DRILL_CATEGORIES,
  FOOTBALL_DRILLS,
  type DrillCategory,
  type FootballDrill,
} from "@/lib/footballDrills";
import {
  FOOTBALL_SESSIONS,
  sessionMinutes,
  type FootballSession,
} from "@/lib/footballSessions";

const LEVEL_COLOR: Record<FootballDrill["level"], string> = {
  Base: "bg-emerald-500/15 text-emerald-400",
  Intermedio: "bg-amber-500/15 text-amber-400",
  Avanzado: "bg-red-500/15 text-red-400",
};

const drillById = (id: string) => FOOTBALL_DRILLS.find((d) => d.id === id);

export default function FutbolPage() {
  return (
    <AppShell>
      <Futbol />
    </AppShell>
  );
}

function Futbol() {
  const [tab, setTab] = useState<"ejercicios" | "sesiones">("ejercicios");
  const [cat, setCat] = useState<DrillCategory | "todos">("todos");
  const [drill, setDrill] = useState<FootballDrill | null>(null);
  const [session, setSession] = useState<FootballSession | null>(null);

  const drills = useMemo(
    () => (cat === "todos" ? FOOTBALL_DRILLS : FOOTBALL_DRILLS.filter((d) => d.category === cat)),
    [cat]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">⚽ Fútbol · Tecnificación</h1>
        <p className="text-sm text-slate-400">
          Ejercicios técnicos con diagramas y sesiones listas para entrenar.
        </p>
      </div>

      <div className="flex gap-2">
        {(["ejercicios", "sesiones"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`press flex-1 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
              tab === t
                ? "border-accent/40 bg-accent/12 text-accent"
                : "border-white/10 bg-base-800 text-slate-300"
            }`}
          >
            {t === "ejercicios" ? "🎯 Ejercicios" : "🗓️ Sesiones"}
          </button>
        ))}
      </div>

      {tab === "ejercicios" ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCat("todos")}
              className={`press chip ${cat === "todos" ? "bg-accent/20 text-accent" : "bg-base-800 text-slate-400"}`}
            >
              todos
            </button>
            {DRILL_CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCat(c.value)}
                className={`press chip ${cat === c.value ? "bg-accent/20 text-accent" : "bg-base-800 text-slate-400"}`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {drills.map((d) => (
              <button
                key={d.id}
                onClick={() => setDrill(d)}
                className="card press !p-0 overflow-hidden text-left hover:border-accent/40"
              >
                <div className="aspect-video w-full">
                  <DrillPitch diagram={d.diagram} />
                </div>
                <div className="p-3">
                  <p className="font-semibold leading-tight">{d.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className={`chip ${LEVEL_COLOR[d.level]}`}>{d.level}</span>
                    <span className="text-xs text-slate-400">
                      {CATEGORY_LABEL[d.category]} · {d.durationMin} min · 👤 {d.players}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {FOOTBALL_SESSIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSession(s)}
              className="card press text-left hover:border-accent/40"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{s.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.name}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className={`chip ${LEVEL_COLOR[s.level]}`}>{s.level}</span>
                    <span className="chip bg-base-800 text-slate-300">
                      ⏱ {sessionMinutes(s)} min
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-400">{s.description}</p>
            </button>
          ))}
        </div>
      )}

      {drill && <DrillDetail drill={drill} onClose={() => setDrill(null)} />}
      {session && (
        <SessionDetail
          session={session}
          onClose={() => setSession(null)}
          onOpenDrill={(d) => setDrill(d)}
        />
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-0.5 w-5 bg-slate-200" /> pase
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-amber-300" /> carrera
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-0.5 w-5 bg-gym" style={{ maskImage: "none" }} /> regate
      </span>
    </div>
  );
}

function DrillDetail({ drill, onClose }: { drill: FootballDrill; onClose: () => void }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <div className="relative min-h-0 flex-1 overflow-y-auto scroll-momentum">
          <button
            onClick={onClose}
            className="press absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-black/50 text-lg text-white backdrop-blur"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <div className="aspect-video w-full bg-base-950 p-3">
            <DrillPitch diagram={drill.diagram} />
          </div>

          <div className="space-y-4 p-5">
            <div>
              <h2 className="text-xl font-bold">{drill.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="chip bg-accent/15 text-accent">
                  {CATEGORY_LABEL[drill.category]}
                </span>
                <span className={`chip ${LEVEL_COLOR[drill.level]}`}>{drill.level}</span>
                <span className="chip bg-base-800 text-slate-300">⏱ {drill.durationMin} min</span>
                <span className="chip bg-base-800 text-slate-300">👤 {drill.players}</span>
                {drill.solo && <span className="chip bg-base-800 text-slate-300">🏠 en solitario</span>}
              </div>
            </div>

            <Legend />

            <div>
              <p className="mb-1 text-sm font-semibold text-slate-300">Material</p>
              <p className="text-sm text-slate-400">{drill.equipment.join(" · ")}</p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-300">Cómo se hace</p>
              <ol className="space-y-2">
                {drill.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-300">Claves técnicas</p>
              <ul className="space-y-1.5">
                {drill.keys.map((k, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-300">
                    <span className="text-accent">✓</span>
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionDetail({
  session,
  onClose,
  onOpenDrill,
}: {
  session: FootballSession;
  onClose: () => void;
  onOpenDrill: (d: FootballDrill) => void;
}) {
  // Agrupa los bloques por etiqueta manteniendo el orden.
  const groups: { label: string; blocks: typeof session.blocks }[] = [];
  for (const b of session.blocks) {
    const last = groups[groups.length - 1];
    if (last && last.label === b.label) last.blocks.push(b);
    else groups.push({ label: b.label, blocks: [b] });
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <div className="flex items-start justify-between gap-3 border-b border-white/5 p-5">
          <div>
            <h2 className="text-xl font-bold">
              {session.emoji} {session.name}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{session.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`chip ${LEVEL_COLOR[session.level]}`}>{session.level}</span>
              <span className="chip bg-base-800 text-slate-300">⏱ {sessionMinutes(session)} min</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Toca un ejercicio para ver su diagrama y claves.</p>
          </div>
          <button
            onClick={onClose}
            className="press grid h-11 w-11 shrink-0 place-items-center rounded-full bg-base-800 text-lg"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 scroll-momentum">
          {groups.map((g, gi) => (
            <div key={gi}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {g.label}
              </p>
              <div className="space-y-2">
                {g.blocks.map((b, bi) => {
                  const d = drillById(b.drillId);
                  if (!d) return null;
                  return (
                    <button
                      key={bi}
                      onClick={() => onOpenDrill(d)}
                      className="press flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-base-800/50 p-2 text-left"
                    >
                      <div className="h-14 w-24 shrink-0 overflow-hidden rounded-xl">
                        <DrillPitch diagram={d.diagram} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{d.name}</p>
                        <p className="text-xs text-slate-400">
                          {CATEGORY_LABEL[d.category]} · {b.minutes} min
                        </p>
                      </div>
                      <span className="shrink-0 text-slate-600">›</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
