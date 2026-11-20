"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function SuggestionBox() {
  const { t } = useLanguage();
  const [nombre, setNombre] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function enviar() {
    if (!mensaje.trim()) {
      setError("El mensaje no puede estar vacío.");
      return;
    }
    setError("");
    setEnviando(true);
    try {
      const res = await fetch("/api/sugerencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: anonimo ? null : nombre.trim() || null,
          anonimo,
          mensaje: mensaje.trim(),
        }),
      });
      if (!res.ok) throw new Error("Error");
      setEnviado(true);
      setMensaje("");
      setNombre("");
      setAnonimo(false);
    } catch {
      setError("No se pudo enviar. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <section className="max-w-[1160px] mx-auto px-5 sm:px-6 py-12">
        <div className="rounded-2xl bg-[#EAF4DC] border border-[#CFCBA8]/40 p-6 text-center">
          <Check size={32} className="mx-auto text-[#2F6E00] mb-2" />
          <p className="font-poppins font-bold text-[#17330A]">
            ¡Gracias por tu sugerencia!
          </p>
          <button
            type="button"
            onClick={() => setEnviado(false)}
            className="mt-3 text-sm text-[#2F6E00] underline"
          >
            Enviar otra
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1160px] mx-auto px-5 sm:px-6 py-12">
      <div className="rounded-2xl bg-white border border-[#CFCBA8] p-6 md:p-8">
        <h2 className="font-poppins text-2xl font-extrabold text-[#17330A] mb-2">
          Buzón de sugerencias
        </h2>
        <p className="text-sm text-[#4A5A3C] mb-4">
          ¿Tienes alguna idea o comentario? Cuéntanos.
        </p>

        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={anonimo}
              onChange={(e) => setAnonimo(e.target.checked)}
              className="w-4 h-4 rounded text-[#2F6E00]"
            />
            <span className="text-sm text-[#17330A]">Enviar de forma anónima</span>
          </label>

          {!anonimo && (
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="w-full px-4 py-3 rounded-xl border border-[#CFCBA8] bg-[#FFFBEA] text-[#17330A] text-sm focus:outline-none focus:border-[#2F6E00] focus:ring-2 focus:ring-[#2F6E00]/20"
            />
          )}

          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe tu sugerencia aquí..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-[#CFCBA8] bg-[#FFFBEA] text-[#17330A] text-sm resize-none focus:outline-none focus:border-[#2F6E00] focus:ring-2 focus:ring-[#2F6E00]/20"
          />

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={enviar}
            disabled={enviando || !mensaje.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2F6E00] text-white font-poppins font-bold text-sm hover:bg-[#255700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            {enviando ? "Enviando..." : "Enviar sugerencia"}
          </button>
        </div>
      </div>
    </section>
  );
}
