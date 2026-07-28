"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  agregarOpcionMenu,
  eliminarOpcionMenu,
  actualizarPrecioMacroGramo,
  actualizarPrecioRacion,
  actualizarExtrasConfig,
  toggleExcluidoExtra,
  actualizarExtraPriceOverride,
} from "@/models/menu.model";
import type { CategoriaMenu, NivelProteina } from "@/models/types";
import type { ExtrasConfig } from "@/models/menu.model";

export async function crearOpcionMenu(
  categoria: CategoriaMenu,
  nombre: string,
  detalles?: {
    nivel?: NivelProteina;
    precioRacion?: number;
    precioMacroGramo?: number;
    precioExtra?: number;
  }
) {
  const limpio = nombre.trim();
  if (!limpio) return null;

  const supabase = await createClient();
  const nueva = await agregarOpcionMenu(supabase, categoria, limpio, detalles);
  revalidatePath("/dashboard/menu");
  revalidatePath("/pedido");
  return nueva;
}

export async function borrarOpcionMenu(id: string) {
  const supabase = await createClient();
  await eliminarOpcionMenu(supabase, id);
  revalidatePath("/dashboard/menu");
  revalidatePath("/pedido");
}

export async function cambiarPrecioMacroGramo(id: string, precio: number) {
  const supabase = await createClient();
  await actualizarPrecioMacroGramo(supabase, id, precio);
  revalidatePath("/dashboard/menu");
  revalidatePath("/pedido");
}

export async function cambiarPrecioRacion(id: string, precio: number) {
  const supabase = await createClient();
  await actualizarPrecioRacion(supabase, id, precio);
  revalidatePath("/dashboard/menu");
  revalidatePath("/pedido");
}

export async function recargarMenuCompleto() {
  const supabase = await createClient();

  // Limpiar menú existente
  await supabase.from("opciones_menu").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Proteínas sencillas: $9 ración, $12 macro
  const sencillas: [string, number, number][] = [
    ["Pechuga de pollo", 1, 9],
    ["Cadera de pollo", 2, 9],
    ["Carne de pavo", 3, 9],
    ["Albóndigas", 4, 9],
    ["Carne molida", 5, 9],
    ["Cerdo", 6, 9],
    ["Pimientos rellenos", 7, 9],
  ];

  for (const [nombre, orden, precio] of sencillas) {
    await supabase.from("opciones_menu").insert({
      categoria: "proteina",
      nombre,
      nivel: "sencilla",
      precio_racion: precio,
      precio_macro_gramo: 12,
      orden,
    });
  }

  // Proteínas premium: $12 ración, $14 macro
  const premium: [string, number][] = [
    ["Steak", 8],
    ["Salmón", 9],
    ["Pescado", 10],
    ["Camarones grill", 11],
    ["Lasaña", 12],
  ];

  for (const [nombre, orden] of premium) {
    await supabase.from("opciones_menu").insert({
      categoria: "proteina",
      nombre,
      nivel: "premium",
      precio_racion: 12,
      precio_macro_gramo: 14,
      orden,
    });
  }

  // Carbohidratos (incluidos, sin costo extra)
  const carbohidratos: [string, number][] = [
    ["Quinoa", 1],
    ["Malanga", 2],
    ["Pasta protein", 3],
    ["Batata", 4],
    ["Mangú", 5],
    ["Arroz", 6],
    ["Yuca", 7],
    ["Baby potatoes al horno", 8],
    ["Sweet potatoes al horno", 9],
  ];

  for (const [nombre, orden] of carbohidratos) {
    await supabase.from("opciones_menu").insert({
      categoria: "carbohidrato",
      nombre,
      orden,
    });
  }

  // Vegetales (incluidos, sin costo extra)
  const vegetales: [string, number][] = [
    ["Brócoli", 1],
    ["Coliflor", 2],
    ["Green Beans", 3],
    ["Espárragos", 4],
    ["Zucchini", 5],
  ];

  for (const [nombre, orden] of vegetales) {
    await supabase.from("opciones_menu").insert({
      categoria: "vegetal",
      nombre,
      orden,
    });
  }

  // Desayunos (25g proteína + waffles, precio fijo)
  const desayunos: [string, number][] = [
    ["2 waffles (regular)", 1],
    ["2 waffles + huevos", 2],
    ["2 waffles + blackberry", 3],
    ["2 waffles + huevo y bacon de pavo", 4],
  ];

  for (const [nombre, orden] of desayunos) {
    await supabase.from("opciones_menu").insert({
      categoria: "desayuno",
      nombre,
      orden,
    });
  }

  revalidatePath("/dashboard/menu");
  revalidatePath("/pedido");
}

export async function actualizarPreciosExistentes() {
  const supabase = await createClient();

  // Primero verificar qué hay en la BD
  const { data: opciones, error: fetchError } = await supabase
    .from("opciones_menu")
    .select("id, nombre, nivel, precio_racion, precio_macro_gramo");

  console.log("Opciones actuales en BD:", JSON.stringify(opciones, null, 2));
  if (fetchError) console.error("Error leyendo opciones:", fetchError);

  // Actualizar sencillas
  const { error: err1, count: count1 } = await supabase
    .from("opciones_menu")
    .update({ precio_racion: 9, precio_macro_gramo: 12 })
    .eq("categoria", "proteina")
    .eq("nivel", "sencilla")
    .select();

  console.log("Sencillas actualizadas:", count1);
  if (err1) console.error("Error actualizando sencillas:", err1);

  // Actualizar premium
  const { error: err2, count: count2 } = await supabase
    .from("opciones_menu")
    .update({ precio_racion: 12, precio_macro_gramo: 14 })
    .eq("categoria", "proteina")
    .eq("nivel", "premium")
    .select();

  console.log("Premium actualizadas:", count2);
  if (err2) console.error("Error actualizando premium:", err2);

  revalidatePath("/dashboard/menu");
  revalidatePath("/pedido");
}

export async function guardarExtrasConfig(config: Partial<ExtrasConfig>) {
  const supabase = await createClient();
  await actualizarExtrasConfig(supabase, config);
  revalidatePath("/dashboard/menu");
  revalidatePath("/pedido");
}

export async function toggleExtraOpcion(id: string, excluido: boolean) {
  const supabase = await createClient();
  await toggleExcluidoExtra(supabase, id, excluido);
  revalidatePath("/dashboard/menu");
  revalidatePath("/pedido");
}

export async function cambiarExtraPriceOverride(id: string, precio: number | null) {
  const supabase = await createClient();
  await actualizarExtraPriceOverride(supabase, id, precio);
  revalidatePath("/dashboard/menu");
  revalidatePath("/pedido");
}
