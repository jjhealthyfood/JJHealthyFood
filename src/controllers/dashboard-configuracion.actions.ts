"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { actualizarConfiguracion } from "@/models/configuracion.model";

export async function guardarWhatsappNumero(numero: string) {
  const limpio = numero.replace(/[^0-9]/g, "");
  if (!limpio) return;

  const supabase = await createClient();
  await actualizarConfiguracion(supabase, "whatsapp_numero", limpio);
  revalidatePath("/dashboard/configuracion");
}

export async function guardarCodigoDescuento(clave: "codigo_descuento_5" | "codigo_descuento_10", codigo: string) {
  const limpio = codigo.trim();
  if (!limpio) return;

  const supabase = await createClient();
  await actualizarConfiguracion(supabase, clave, limpio);
  revalidatePath("/dashboard/configuracion");
}
