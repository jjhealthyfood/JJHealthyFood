"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { crearPedido } from "@/models/pedidos.model";
import { crearComidasPedido } from "@/models/comidas-pedido.model";
import { obtenerConfiguracion } from "@/models/configuracion.model";
import { listarSedesActivas } from "@/models/sedes.model";
import type { ComidaPedido, DiaEntrega, ModoPedido, TipoEntrega } from "@/models/types";

export type DatosEntrega = {
  nombre: string;
  telefono: string;
  detalles: string;
  dia_entrega: DiaEntrega;
  tipo_entrega: TipoEntrega;
  sede_id: string;
  direccion_entrega: string;
};

export type ComidaSeleccionada = Omit<ComidaPedido, "id" | "pedido_id">;

export type ClientaEncontrada = {
  nombre: string;
  direccion: string | null;
  zona_entrega: string | null;
};

export type ResultadoEnvioPedido =
  | { success: true; whatsappUrl: string }
  | { success: false; error: string; esDuplicado?: boolean };

const ZIP_FLORIDA_REGEX = /\b3[2-4]\d{3}\b/;
const ESTADO_FLORIDA_REGEX = /\bFL\b|florida/i;

function esDireccionFloridaValida(direccion: string): boolean {
  const texto = direccion.trim();
  if (texto.length < 10) return false;
  return ESTADO_FLORIDA_REGEX.test(texto) && ZIP_FLORIDA_REGEX.test(texto);
}

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(valor);
}

type FirmaComida = {
  proteina: string;
  carbohidrato: string | null;
  vegetal: string | null;
  extra: string | null;
  gramos_proteina: number | string | null;
  gramos_carbohidrato: number | string | null;
  es_desayuno: boolean;
};

function firmaComida(c: FirmaComida): string {
  const gp =
    c.gramos_proteina === null || c.gramos_proteina === undefined
      ? ""
      : String(Number(c.gramos_proteina));
  const gc =
    c.gramos_carbohidrato === null || c.gramos_carbohidrato === undefined
      ? ""
      : String(Number(c.gramos_carbohidrato));
  return [c.proteina, c.carbohidrato ?? "", c.vegetal ?? "", c.extra ?? "", gp, gc, c.es_desayuno].join("|");
}

async function esPedidoDuplicado(
  supabase: SupabaseClient,
  clientaId: string,
  diaEntrega: DiaEntrega,
  comidasNuevas: ComidaSeleccionada[]
): Promise<boolean> {
  const { data, error } = await supabase.rpc("comidas_pendientes_de_clienta_dia", {
    p_clienta_id: clientaId,
    p_dia_entrega: diaEntrega,
  });

  if (error || !data) return false;

  const porPedido = new Map<string, string[]>();
  for (const fila of data as (FirmaComida & { pedido_id: string })[]) {
    const lista = porPedido.get(fila.pedido_id) ?? [];
    lista.push(firmaComida(fila));
    porPedido.set(fila.pedido_id, lista);
  }

  const firmasNuevas = comidasNuevas.map(firmaComida).sort();

  for (const firmas of porPedido.values()) {
    const ordenadas = [...firmas].sort();
    if (
      ordenadas.length === firmasNuevas.length &&
      ordenadas.every((f, i) => f === firmasNuevas[i])
    ) {
      return true;
    }
  }
  return false;
}

export async function buscarClientaPorTelefono(
  telefono: string
): Promise<ClientaEncontrada | null> {
  if (!telefono.trim()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("buscar_clienta_por_telefono", { telefono_buscado: telefono })
    .maybeSingle();

  if (error || !data) return null;
  return data as ClientaEncontrada;
}

function construirMensajeWhatsapp(
  numeroOrden: string,
  datos: DatosEntrega,
  modo: ModoPedido,
  comidas: ComidaSeleccionada[],
  total: number,
  sedeNombre: string | null,
  sedeDireccion: string | null
) {
  const lineas = comidas
    .map((c) => {
      const base = c.es_desayuno
        ? c.proteina
        : !c.carbohidrato && !c.vegetal
        ? c.proteina
        : `${c.proteina} + ${c.carbohidrato}${c.vegetal ? ` + ${c.vegetal}` : ""}`;
      const extra = c.extra ? ` + extra: ${c.extra}` : "";
      const gramos =
        modo === "macro" && !c.es_desayuno && c.gramos_proteina !== null
          ? ` (${c.gramos_proteina}g / ${c.gramos_carbohidrato}g)`
          : "";
      const nota = c.comentario ? `\n   _Note: ${c.comentario}_` : "";
      return `*Meal ${c.numero_comida}:* ${base}${extra}${gramos} — ${formatearMoneda(c.precio)}${nota}`;
    })
    .join("\n");

  const diaLabel = datos.dia_entrega === "domingo" ? "Sunday" : "Monday";
  const modoLabel = modo === "macro" ? "Macro" : "By Portion";
  const entregaLinea =
    datos.tipo_entrega === "delivery"
      ? `*Delivery to:* ${datos.direccion_entrega}`
      : `*Pickup at:* ${sedeNombre} — ${sedeDireccion}`;

  return (
    `*✅ Order #${numeroOrden} received!*\n\n` +
    `Hi JJ Healthy Food! I'd like to place this order (${modoLabel}):\n\n${lineas}\n\n` +
    `*Estimated total: ${formatearMoneda(total)}*\n\n` +
    `*${datos.tipo_entrega === "delivery" ? "Delivery" : "Pickup"} day:* ${diaLabel}\n` +
    `${entregaLinea}\n` +
    `*Name:* ${datos.nombre}` +
    (datos.detalles ? `\n*Details:* ${datos.detalles}` : "")
  );
}

export async function enviarPedido(
  datosEntrega: DatosEntrega,
  modo: ModoPedido,
  comidas: ComidaSeleccionada[],
  confirmarDuplicado = false
): Promise<ResultadoEnvioPedido> {
  console.log("=== INICIO ENVIAR PEDIDO ===");
  console.log("Datos entrega:", datosEntrega);
  console.log("Modo:", modo);
  console.log("Comidas:", comidas.length);

  if (comidas.length < 1) {
    console.log("Error: No hay comidas");
    return { success: false, error: "Choose at least one meal." };
  }
  if (!datosEntrega.nombre.trim() || !datosEntrega.telefono.trim()) {
    console.log("Error: Faltan datos");
    return { success: false, error: "Your pickup details are missing." };
  }

  const supabase = await createClient();

  let sedeElegida: { nombre: string; direccion: string } | null = null;
  if (datosEntrega.tipo_entrega === "delivery") {
    if (!esDireccionFloridaValida(datosEntrega.direccion_entrega)) {
      console.log("Error: direccion de delivery invalida");
      return {
        success: false,
        error: "Please enter a valid Florida delivery address with a zip code.",
      };
    }
  } else {
    const sedesActivas = await listarSedesActivas(supabase);
    sedeElegida = sedesActivas.find((s) => s.id === datosEntrega.sede_id) ?? null;
    if (!sedeElegida) {
      console.log("Error: sede de retiro invalida o inactiva");
      return {
        success: false,
        error: "Please choose a valid pickup location and try again.",
      };
    }
  }

  console.log("Intentando upsert clienta...");
  const { data: clientaId, error: clientaError } = await supabase.rpc(
    "upsert_clienta_publica",
    {
      p_telefono: datosEntrega.telefono,
      p_nombre: datosEntrega.nombre,
    }
  );

  console.log("Resultado upsert:", { clientaId, clientaError });

  if (clientaError || !clientaId) {
    console.log("Error en upsert:", clientaError);
    return { success: false, error: "We couldn't save your details. Please try again." };
  }

  if (!confirmarDuplicado) {
    const duplicado = await esPedidoDuplicado(
      supabase,
      clientaId as string,
      datosEntrega.dia_entrega,
      comidas
    );
    if (duplicado) {
      console.log("Posible pedido duplicado detectado");
      return {
        success: false,
        error: "This looks like a duplicate order.",
        esDuplicado: true,
      };
    }
  }

  try {
    const total = comidas.reduce((suma, c) => suma + c.precio, 0);
    console.log("Total:", total);

    console.log("Creando pedido...");
    const pedido = await crearPedido(supabase, {
      clienta_id: clientaId as string,
      dia_entrega: datosEntrega.dia_entrega,
      modo,
      precio_total: total,
      notas: datosEntrega.detalles.trim() || undefined,
      tipo_entrega: datosEntrega.tipo_entrega,
      sede_nombre: sedeElegida?.nombre ?? undefined,
      sede_direccion: sedeElegida?.direccion ?? undefined,
      direccion_entrega:
        datosEntrega.tipo_entrega === "delivery"
          ? datosEntrega.direccion_entrega.trim()
          : undefined,
    });

    console.log("Pedido creado:", pedido.id);

    console.log("Creando comidas...");
    await crearComidasPedido(
      supabase,
      comidas.map((c) => ({ ...c, pedido_id: pedido.id }))
    );

    console.log("Comidas creadas OK");

    const numeroOrden = pedido.id.slice(0, 5).toUpperCase();
    const numeroNegocio =
      (await obtenerConfiguracion(supabase, "whatsapp_numero")) ??
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
      "";
    const mensaje = construirMensajeWhatsapp(
      numeroOrden,
      datosEntrega,
      modo,
      comidas,
      total,
      sedeElegida?.nombre ?? null,
      sedeElegida?.direccion ?? null
    );
    const whatsappUrl = `https://wa.me/${numeroNegocio}?text=${encodeURIComponent(mensaje)}`;

    console.log("=== PEDIDO COMPLETADO ===");
    return { success: true, whatsappUrl };
  } catch (e) {
    console.error("=== ERROR AL CREAR PEDIDO ===");
    console.error("Error:", e);
    return { success: false, error: "We couldn't create your order. Please try again." };
  }
}
