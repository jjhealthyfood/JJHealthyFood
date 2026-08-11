"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { guardarLimiteComidasSemana } from "@/controllers/dashboard-configuracion.actions";

export function LimiteComidasForm({ limiteActual }: { limiteActual: string }) {
  const [valor, setValor] = useState(limiteActual);
  const [guardado, setGuardado] = useState(false);
  const [pending, startTransition] = useTransition();

  function guardar() {
    setGuardado(false);
    startTransition(async () => {
      await guardarLimiteComidasSemana(Number(valor));
      setGuardado(true);
    });
  }

  return (
    <div>
      <label className="font-sans text-sm font-medium text-on-surface">
        Límite de comidas por fin de semana
      </label>
      <div className="mt-1 flex gap-2">
        <input
          type="number"
          min={0}
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setGuardado(false);
          }}
          placeholder="250"
          disabled={pending}
          className="flex-1 bg-surface-container border border-outline-variant rounded-xl px-4 py-3 font-sans text-on-surface focus:ring-2 focus:ring-primary outline-none"
        />
        <button
          type="button"
          onClick={guardar}
          disabled={pending || valor.trim() === ""}
          className="px-4 rounded-xl bg-primary text-on-primary font-sans text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
        >
          {pending ? "..." : "Guardar"}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-on-surface-variant font-sans flex items-center gap-1">
        {guardado ? (
          <>
            <Check size={13} className="text-primary" /> Guardado — ya aplica
            a los próximos pedidos.
          </>
        ) : (
          "Al llegar a este número de comidas en un mismo fin de semana (domingo + lunes), se bloquean los pedidos nuevos y a la clienta le sale un botón para escribirte por WhatsApp. Sube este número cuando le hagas espacio a más pedidos. Pon 0 para desactivar el límite."
        )}
      </p>
    </div>
  );
}
