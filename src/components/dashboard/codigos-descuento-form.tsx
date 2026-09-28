"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { guardarListaDescuentoAction } from "@/controllers/dashboard-configuracion.actions";
import type { CodigoDescuento } from "@/models/codigos-descuento.model";

export function CodigosDescuentoForm({
  listaInicial,
}: {
  listaInicial: CodigoDescuento[];
}) {
  const [lista, setLista] = useState<CodigoDescuento[]>(listaInicial);
  const [nuevoPct, setNuevoPct] = useState("5");
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  async function handleAgregar() {
    const pct = parseInt(nuevoPct, 10);
    if (!nuevoCodigo.trim() || !Number.isFinite(pct) || pct <= 0 || pct > 100) return;
    if (lista.some((c) => c.code.toUpperCase() === nuevoCodigo.trim().toUpperCase())) return;
    setAgregando(true);
    try {
      const nuevaLista = [...lista, { pct, code: nuevoCodigo.trim().toUpperCase() }];
      setLista(nuevaLista);
      setNuevoCodigo("");
      await guardarListaDescuentoAction(nuevaLista);
    } finally {
      setAgregando(false);
    }
  }

  async function handleEliminar(index: number) {
    setEliminandoId(index);
    try {
      const nuevaLista = lista.filter((_, i) => i !== index);
      setLista(nuevaLista);
      await guardarListaDescuentoAction(nuevaLista);
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <div className="space-y-3">
      <p className="font-sans text-xs text-on-surface-variant">
        Los códigos de 5% y 10% ya existen. Agregá o eliminá los que quieras abajo.
      </p>
      {lista.map((c, index) => (
        <div key={index} className="flex items-center gap-2 bg-surface-container rounded-xl px-4 py-3">
          <div className="flex-1">
            <span className="font-sans text-sm font-medium text-on-surface">
              {c.pct}% off
            </span>
            <span className="font-sans text-xs text-on-surface-variant ml-2">
              ({c.code})
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleEliminar(index)}
            disabled={eliminandoId === index}
            className="text-error hover:text-error/80 p-1.5 rounded-lg hover:bg-error/10 transition-colors disabled:opacity-40"
            title="Eliminar código"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      <div className="border border-dashed border-outline-variant rounded-xl p-4 mt-2">
        <p className="font-sans text-sm text-on-surface-variant mb-3">Agregar nuevo código de descuento</p>
        <div className="flex gap-2">
          <select
            value={nuevoPct}
            onChange={(e) => setNuevoPct(e.target.value)}
            className="bg-surface-container border border-outline-variant rounded-xl px-3 py-2 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary"
          >
            {[5, 10, 15, 20, 25, 30, 40, 50].map((p) => (
              <option key={p} value={p}>{p}%</option>
            ))}
          </select>
          <input
            type="text"
            value={nuevoCodigo}
            onChange={(e) => setNuevoCodigo(e.target.value.toUpperCase())}
            placeholder="EJ: MYCODE"
            className="flex-1 bg-surface-container border border-outline-variant rounded-xl px-4 py-2 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => e.key === "Enter" && handleAgregar()}
          />
          <button
            type="button"
            onClick={handleAgregar}
            disabled={agregando || !nuevoCodigo.trim()}
            className="px-4 rounded-xl bg-primary text-on-primary font-sans text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all flex items-center gap-1"
          >
            {agregando ? "..." : <><Plus size={16} /> Agregar</>}
          </button>
        </div>
      </div>
    </div>
  );
}