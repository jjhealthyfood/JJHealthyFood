import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listarOpcionesMenu, listarExtrasConfig } from "@/models/menu.model";
import { listarSedesActivas } from "@/models/sedes.model";
import { PedidoWizard } from "@/components/pedido/pedido-wizard";

export const metadata: Metadata = {
  title: "Arma tu pedido — JJ Healthy Food",
};

export default async function PedidoPage() {
  const supabase = await createClient();
  const [opciones, sedes, extrasConfig] = await Promise.all([
    listarOpcionesMenu(supabase),
    listarSedesActivas(supabase),
    listarExtrasConfig(supabase),
  ]);

  const proteinas = opciones.filter((o) => o.categoria === "proteina");
  const carbohidratosFull = opciones.filter((o) => o.categoria === "carbohidrato");
  const vegetalesFull = opciones.filter((o) => o.categoria === "vegetal");
  const carbohidratos = carbohidratosFull.map((o) => o.nombre);
  const vegetales = vegetalesFull.map((o) => o.nombre);
  const opcionesDesayuno = opciones
    .filter((o) => o.categoria === "desayuno");
  const platos = opciones.filter((o) => o.categoria === "plato");

  return (
    <PedidoWizard
      proteinas={proteinas}
      carbohidratos={carbohidratos}
      vegetales={vegetales}
      carbohidratosFull={carbohidratosFull}
      vegetalesFull={vegetalesFull}
      opcionesDesayuno={opcionesDesayuno}
      sedes={sedes}
      extrasConfig={extrasConfig}
      platos={platos}
    />
  );
}
