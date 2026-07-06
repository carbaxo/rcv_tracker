"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import GymSession from "@/components/GymSession";
import CardioForm from "@/components/CardioForm";

export default function EntrenarPage() {
  return (
    <AppShell>
      <Suspense>
        <Entrenar />
      </Suspense>
    </AppShell>
  );
}

function Entrenar() {
  const [mode, setMode] = useState<"gym" | "cardio">("gym");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Entrenar</h1>
        <Link href="/ejercicios" className="text-sm text-accent hover:underline">
          Biblioteca de ejercicios →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode("gym")}
          className={`card text-left transition-colors ${
            mode === "gym" ? "!border-gym ring-1 ring-gym/50" : "hover:bg-base-800"
          }`}
        >
          <span className="text-3xl">🏋️</span>
          <p className="mt-2 font-semibold">Gimnasio</p>
          <p className="text-xs text-slate-400">
            Sesión en vivo con series, peso y descansos
          </p>
        </button>
        <button
          onClick={() => setMode("cardio")}
          className={`card text-left transition-colors ${
            mode === "cardio"
              ? "!border-cardio ring-1 ring-cardio/50"
              : "hover:bg-base-800"
          }`}
        >
          <span className="text-3xl">🏃</span>
          <p className="mt-2 font-semibold">Cardio</p>
          <p className="text-xs text-slate-400">
            Carrera, bici, natación… con distancia y ritmo
          </p>
        </button>
      </div>

      {mode === "gym" ? <GymSession /> : <CardioForm />}
    </div>
  );
}
