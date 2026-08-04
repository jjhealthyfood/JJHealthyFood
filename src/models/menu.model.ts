import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoriaMenu, NivelProteina, OpcionMenu } from "./types";

export type ExtrasConfig = {
  proteina_regular: number;
  proteina_premium: number;
  carbohidrato: number;
  vegetal: number;
};

export async function listarOpcionesMenu(
  supabase: SupabaseClient
): Promise<OpcionMenu[]> {
  const { data, error } = await supabase
    .from("opciones_menu")
    .select("*")
    .order("categoria", { ascending: true })
    .order("orden", { ascending: true });

  if (error) throw error;
  return data as OpcionMenu[];
}

export async function agregarOpcionMenu(
  supabase: SupabaseClient,
  categoria: CategoriaMenu,
  nombre: string,
  detalles?: {
    nivel?: NivelProteina;
    precioRacion?: number;
    precioMacroGramo?: number;
    precioExtra?: number;
  }
): Promise<OpcionMenu> {
  const { data, error } = await supabase
    .from("opciones_menu")
    .insert({
      categoria,
      nombre,
      nivel: detalles?.nivel ?? null,
      precio_racion: detalles?.precioRacion ?? null,
      precio_macro_gramo: detalles?.precioMacroGramo ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as OpcionMenu;
}

export async function eliminarOpcionMenu(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("opciones_menu").delete().eq("id", id);
  if (error) throw error;
}

export async function actualizarPrecioMacroGramo(
  supabase: SupabaseClient,
  id: string,
  precioMacroGramo: number
): Promise<OpcionMenu> {
  const { data, error } = await supabase
    .from("opciones_menu")
    .update({ precio_macro_gramo: precioMacroGramo })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as OpcionMenu;
}

export async function actualizarPrecioRacion(
  supabase: SupabaseClient,
  id: string,
  precioRacion: number
): Promise<OpcionMenu> {
  const { data, error } = await supabase
    .from("opciones_menu")
    .update({ precio_racion: precioRacion })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as OpcionMenu;
}

export async function listarExtrasConfig(
  supabase: SupabaseClient
): Promise<ExtrasConfig> {
  const { data, error } = await supabase
    .from("extras_config")
    .select("id, precio");

  if (error) throw error;

  const defaults: ExtrasConfig = {
    proteina_regular: 1,
    proteina_premium: 2,
    carbohidrato: 0.5,
    vegetal: 0,
  };

  if (!data) return defaults;

  for (const row of data) {
    if (row.id in defaults) {
      (defaults as Record<string, number>)[row.id] = row.precio;
    }
  }

  return defaults;
}

export async function actualizarExtrasConfig(
  supabase: SupabaseClient,
  config: Partial<ExtrasConfig>
): Promise<void> {
  for (const [key, precio] of Object.entries(config)) {
    if (precio === undefined) continue;
    const { error } = await supabase
      .from("extras_config")
      .upsert({ id: key, precio }, { onConflict: "id" });
    if (error) throw error;
  }
}



export async function toggleExcluidoExtra(
  supabase: SupabaseClient,
  id: string,
  excluido: boolean
): Promise<void> {
  const { error } = await supabase
    .from("opciones_menu")
    .update({ excluido_extra: excluido })
    .eq("id", id);
  if (error) throw error;
}

export async function actualizarExtraPriceOverride(
  supabase: SupabaseClient,
  id: string,
  precio: number | null
): Promise<void> {
  const { error } = await supabase
    .from("opciones_menu")
    .update({ extra_price_override: precio })
    .eq("id", id);
  if (error) throw error;
}

export async function actualizarSoloExtra(
  supabase: SupabaseClient,
  id: string,
  soloExtra: boolean
): Promise<void> {
  const { error } = await supabase
    .from("opciones_menu")
    .update({ solo_extra: soloExtra })
    .eq("id", id);
  if (error) throw error;
}
