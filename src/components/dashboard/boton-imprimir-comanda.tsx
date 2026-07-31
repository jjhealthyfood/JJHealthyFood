"use client";

import { Printer } from "lucide-react";
import { imprimirComanda } from "@/lib/imprimir-comanda";

export function BotonImprimirComanda() {
  return (
    <button
      type="button"
      onClick={imprimirComanda}
      className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-sans text-sm font-semibold inline-flex items-center gap-2 active:scale-95 transition-all"
    >
      <Printer size={16} />
      Imprimir comanda
    </button>
  );
}
