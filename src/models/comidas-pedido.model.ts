import type { SupabaseClient } from "@supabase/supabase-js";
import type { ComidaPedido } from "./types";

export async function crearComidasPedido(
  supabase: SupabaseClient,
  comidas: Array<Omit<ComidaPedido, "id">>
): Promise<void> {
  // Igual que en crearPedido: el publico solo puede insertar, no leer,
  // asi que no se pide .select() de vuelta (Postgres RLS rechazaria el
  // INSERT ... RETURNING sin una politica de SELECT para anon).
  const { error } = await supabase.from("comidas_pedido").insert(comidas);

  // Si la migracion de la bandera keto (20261118000000_comidas_keto.sql)
  // todavia no esta aplicada, Postgres rechaza la columna es_keto. En ese
  // caso guardamos la comida igual (sin la bandera) en vez de perder el
  // pedido: la cocina la vera como antes.
  if (error && /es_keto/i.test(error.message ?? "")) {
    console.warn(
      "comidas_pedido.es_keto no existe; guardando sin la bandera keto. Aplica supabase/migrations/20261118000000_comidas_keto.sql"
    );
    const comidasSinBandera = comidas.map((c) => {
      const copia = { ...c } as Partial<typeof c>;
      delete copia.es_keto;
      return copia;
    });
    const { error: errorSinBandera } = await supabase
      .from("comidas_pedido")
      .insert(comidasSinBandera);
    if (errorSinBandera) {
      console.error(
        "Error Supabase al insertar comidas:",
        JSON.stringify(errorSinBandera, null, 2)
      );
      throw errorSinBandera;
    }
    return;
  }

  if (error) {
    console.error("Error Supabase al insertar comidas:", JSON.stringify(error, null, 2));
    console.error("Datos que se intentaron insertar:", JSON.stringify(comidas, null, 2));
    throw error;
  }
}

export async function listarComidasPorPedido(
  supabase: SupabaseClient,
  pedidoId: string
): Promise<ComidaPedido[]> {
  const { data, error } = await supabase
    .from("comidas_pedido")
    .select("*")
    .eq("pedido_id", pedidoId)
    .order("numero_comida", { ascending: true });

  if (error) throw error;
  return data as ComidaPedido[];
}
