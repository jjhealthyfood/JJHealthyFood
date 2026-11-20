"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

type Sugerencia = {
  id: string;
  nombre: string | null;
  anonimo: boolean;
  mensaje: string;
  created_at: string;
};

export function SugerenciasLista({ inicial }: { inicial: Sugerencia[] }) {
  const [lista, setLista] = useState<Sugerencia[]>(inicial);
  const [pending, startTransition] = useTransition();

  function eliminar(id: string) {
    startTransition(async () => {
      const res = await fetch("/api/sugerencias/" + id, { method: "DELETE" });
      if (res.ok) {
        setLista((prev) => prev.filter((s) => s.id !== id));
      }
    });
  }

  function limpiarAntiguas() {
    if (lista.length <= 10) return;
    const aEliminar = lista.slice(10);
    startTransition(async () => {
      await Promise.all(
        aEliminar.map((s) =>
          fetch("/api/sugerencias/" + s.id, { method: "DELETE" })
        )
      );
      setLista((prev) => prev.slice(0, 10));
    });
  }

  if (lista.length === 0) {
    return (
      <div className="p-6 text-center text-on-surface-variant font-sans">
        No hay sugerencias todavía.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lista.length > 10 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={limpiarAntiguas}
            disabled={pending}
            className="text-xs font-bold uppercase tracking-wider text-red-600 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 disabled:opacity-50"
          >
            Limpiar antiguas (mantener 10 más recientes)
          </button>
        </div>
      )}
      {lista.map((s) => (
        <div
          key={s.id}
          className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-sm font-semibold text-on-surface">
              {s.anonimo ? "Anónimo" : s.nombre || "Sin nombre"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-sans">
                {new Date(s.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <button
                type="button"
                onClick={() => eliminar(s.id)}
                disabled={pending}
                className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors disabled:opacity-50"
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <p className="font-sans text-sm text-on-surface-variant whitespace-pre-wrap">
            {s.mensaje}
          </p>
        </div>
      ))}
    </div>
  );
}
