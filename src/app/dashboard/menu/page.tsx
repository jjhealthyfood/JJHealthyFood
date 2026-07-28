import { createClient } from "@/lib/supabase/server";
import { listarOpcionesMenu, listarExtrasConfig } from "@/models/menu.model";
import { MenuCategoria } from "@/components/dashboard/menu-categoria";
import { RecargarMenuButton } from "@/components/dashboard/recargar-menu-button";
import { ExtrasConfigPanel } from "@/components/dashboard/extras-config-panel";
import { AlertTriangle } from "lucide-react";

export default async function MenuSemanalPage() {
  let opciones: Awaited<ReturnType<typeof listarOpcionesMenu>> = [];
  let extrasConfig: Awaited<ReturnType<typeof listarExtrasConfig>> = {
    proteina_regular: 1,
    proteina_premium: 2,
    carbohidrato: 0.5,
    vegetal: 0,
  };
  let errorMsg: string | null = null;

  try {
    const supabase = await createClient();
    opciones = await listarOpcionesMenu(supabase);
    extrasConfig = await listarExtrasConfig(supabase);
  } catch {
    errorMsg = "No se pudo conectar con la base de datos.";
  }

  const proteinas = opciones.filter((o) => o.categoria === "proteina");
  const carbohidratos = opciones.filter((o) => o.categoria === "carbohidrato");
  const vegetales = opciones.filter((o) => o.categoria === "vegetal");
  const desayuno = opciones.filter((o) => o.categoria === "desayuno");
  const platos = opciones.filter((o) => o.categoria === "plato");
  const todosLosNombres = opciones.map((o) => o.nombre);

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-6">
      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 bg-error-container/30 border border-error/30 rounded-2xl p-4">
          <AlertTriangle size={20} className="text-error shrink-0" />
          <p className="font-sans text-sm text-on-surface-variant">{errorMsg}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-display text-2xl md:text-[32px] font-semibold text-on-surface mb-1">
          Menú Semanal
        </h2>
        <p className="font-sans text-on-surface-variant">
          Agrega o quita las opciones que ve la clienta al armar su pedido.
        </p>
      </div>

      {opciones.length === 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="font-sans text-sm text-amber-800 mb-3">
            El menú está vacío. Puedes cargar las opciones predeterminadas.
          </p>
          <RecargarMenuButton />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <MenuCategoria
          categoria="proteina"
          titulo="Proteínas"
          opciones={proteinas}
          todosLosNombres={todosLosNombres}
          esProteina
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <MenuCategoria
            categoria="carbohidrato"
            titulo="Carbohidratos"
            opciones={carbohidratos}
            todosLosNombres={todosLosNombres}
          />
          <MenuCategoria
            categoria="vegetal"
            titulo="Vegetales"
            opciones={vegetales}
            todosLosNombres={todosLosNombres}
          />
        </div>
        <MenuCategoria
          categoria="desayuno"
          titulo="Opciones de desayuno"
          opciones={desayuno}
          todosLosNombres={todosLosNombres}
        />
        <MenuCategoria
          categoria="plato"
          titulo="Platos"
          opciones={platos}
          todosLosNombres={todosLosNombres}
          esPlato
        />
        <ExtrasConfigPanel
          config={extrasConfig}
          proteinas={proteinas}
          carbohidratos={carbohidratos}
          vegetales={vegetales}
        />
      </div>
    </div>
  );
}
