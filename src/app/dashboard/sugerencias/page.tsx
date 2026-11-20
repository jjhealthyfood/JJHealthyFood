import { createClient } from "@/lib/supabase/server";
import { SugerenciasLista } from "@/components/dashboard/sugerencias-lista";

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

      <SugerenciasLista inicial={sugerencias ?? []} />
    </div>
  );
}
