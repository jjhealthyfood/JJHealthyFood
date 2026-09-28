import type { SupabaseClient } from "@supabase/supabase-js";
import { obtenerConfiguracion, actualizarConfiguracion } from "@/models/configuracion.model";

export type CodigoDescuento = {
  pct: number;
  code: string;
};

export async function obtenerListaDescuentos(supabase: SupabaseClient): Promise<CodigoDescuento[]> {
  const valor = await obtenerConfiguracion(supabase, "codigos_descuento_lista");
  if (!valor) return [];
  try {
    return JSON.parse(valor) as CodigoDescuento[];
  } catch {
    return [];
  }
}

export async function guardarListaDescuentos(supabase: SupabaseClient, lista: CodigoDescuento[]): Promise<void> {
  await actualizarConfiguracion(supabase, "codigos_descuento_lista", JSON.stringify(lista));
}
