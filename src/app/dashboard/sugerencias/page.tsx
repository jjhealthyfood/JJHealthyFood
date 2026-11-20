import { createClient } from "@/lib/supabase/server";

export default async function SugerenciasPage() {
  const supabase = await createClient();
  const { data: sugerencias } = await supabase
    .from("sugerencias")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h2 className="font-display text-2xl md:text-[32px] font-semibold text-on-surface mb-1">
          Buzón de sugerencias
        </h2>
        <p className="font-sans text-on-surface-variant">
          Sugerencias enviadas por las clientas desde el landing.
        </p>
      </div>

      {!sugerencias || sugerencias.length === 0 ? (
        <div className="p-6 text-center text-on-surface-variant font-sans">
          No hay sugerencias todavía.
        </div>
      ) : (
        <div className="space-y-4">
          {sugerencias.map((s) => (
            <div
              key={s.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-sm font-semibold text-on-surface">
                  {s.anonimo ? "Anónimo" : s.nombre || "Sin nombre"}
                </span>
                <span className="text-xs text-on-surface-variant font-sans">
                  {new Date(s.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="font-sans text-sm text-on-surface-variant whitespace-pre-wrap">
                {s.mensaje}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
