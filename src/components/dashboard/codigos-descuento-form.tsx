"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { guardarCodigoDescuento } from "@/controllers/dashboard-configuracion.actions";

function CampoCodigo({
  clave,
  etiqueta,
  valorActual,
  placeholder,
}: {
  clave: "codigo_descuento_5" | "codigo_descuento_10";
  etiqueta: string;
  valorActual: string;
  placeholder: string;
}) {
  const [valor, setValor] = useState(valorActual);
  const [guardado, setGuardado] = useState(false);
  const [pending, startTransition] = useTransition();

  function guardar() {
    setGuardado(false);
    startTransition(async () => {
      await guardarCodigoDescuento(clave, valor);
      setGuardado(true);
    });
  }

  return (
    <div>
      <label className="font-sans text-sm font-medium text-on-surface">
        {etiqueta}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setGuardado(false);
          }}
          placeholder={placeholder}
          disabled={pending}
          className="flex-1 bg-surface-container border border-outline-variant rounded-xl px-4 py-3 font-sans text-on-surface focus:ring-2 focus:ring-primary outline-none"
        />
        <button
          type="button"
          onClick={guardar}
          disabled={pending || !valor.trim()}
          className="px-4 rounded-xl bg-primary text-on-primary font-sans text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
        >
          {pending ? "..." : "Guardar"}
        </button>
      </div>
      {guardado && (
        <p className="mt-1.5 text-xs text-primary font-sans flex items-center gap-1">
          <Check size={13} /> Guardado
        </p>
      )}
    </div>
  );
}

export function CodigosDescuentoForm({
  codigo5,
  codigo10,
}: {
  codigo5: string;
  codigo10: string;
}) {
  return (
    <div className="space-y-4">
      <CampoCodigo
        clave="codigo_descuento_5"
        etiqueta="Código de 5% off"
        valorActual={codigo5}
        placeholder="CODIGO5OFF"
      />
      <CampoCodigo
        clave="codigo_descuento_10"
        etiqueta="Código de 10% off"
        valorActual={codigo10}
        placeholder="CODIGO10OFF"
      />
    </div>
  );
}
