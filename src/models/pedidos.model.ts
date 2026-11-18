import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EstadoPedido,
  Pedido,
  PedidoConDetalle,
  PedidoParaComanda,
} from "./types";

export async function crearPedido(
  supabase: SupabaseClient,
  datos: Pick<Pedido, "clienta_id" | "dia_entrega" | "precio_total" | "modo"> &
    Partial<
      Pick<
        Pedido,
        | "notas"
        | "tipo_entrega"
        | "sede_nombre"
        | "sede_direccion"
        | "direccion_entrega"
        | "descuento_pct"
        | "codigo_descuento"
        | "fecha_entrega"
      >
    >
): Promise<Pedido> {
  // El publico (anon) puede insertar pero no leer pedidos (por diseno,
  // para que nadie pueda consultar pedidos ajenos), y Postgres RLS
  // rechaza un INSERT que pida devolver la fila (.select()) si el rol
  // no tiene politica de SELECT que la haga visible. Por eso se genera
  // el id aca mismo y se arma el objeto de vuelta sin volver a leerlo.
  const id = crypto.randomUUID();
  const { error } = await supabase.from("pedidos").insert({ id, ...datos });

  if (error) throw error;
  return {
    id,
    fecha_pedido: new Date().toISOString(),
    estado: "pendiente" as EstadoPedido,
    notas: datos.notas ?? null,
    tipo_entrega: datos.tipo_entrega ?? "pickup",
    sede_nombre: datos.sede_nombre ?? null,
    sede_direccion: datos.sede_direccion ?? null,
    direccion_entrega: datos.direccion_entrega ?? null,
    entregado_en: null,
    descuento_pct: datos.descuento_pct ?? 0,
    codigo_descuento: datos.codigo_descuento ?? null,
    fecha_entrega: datos.fecha_entrega ?? null,
    ...datos,
  };
}

export async function listarPedidosRecientes(
  supabase: SupabaseClient,
  pagina = 1,
  porPagina = 20
): Promise<{ pedidos: PedidoConDetalle[]; total: number }> {
  const desde = (pagina - 1) * porPagina;
  const hasta = desde + porPagina - 1;

  const { data, error, count } = await supabase
    .from("pedidos")
    .select(
      "*, clientas(nombre, telefono, zona_entrega, direccion), comidas_pedido(proteina)",
      { count: "exact" }
    )
    .order("fecha_pedido", { ascending: false })
    .range(desde, hasta);

  if (error) throw error;
  return { pedidos: data as unknown as PedidoConDetalle[], total: count ?? 0 };
}

export async function contarPedidosPendientes(
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from("pedidos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "pendiente");

  if (error) throw error;
  return count ?? 0;
}

export async function contarPedidosEntregados(
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from("pedidos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "entregado");

  if (error) throw error;
  return count ?? 0;
}

export async function actualizarEstadoPedido(
  supabase: SupabaseClient,
  pedidoId: string,
  estado: EstadoPedido
): Promise<Pedido> {
  const { data, error } = await supabase
    .from("pedidos")
    .update({
      estado,
      entregado_en: estado === "entregado" ? new Date().toISOString() : null,
    })
    .eq("id", pedidoId)
    .select()
    .single();

  if (error) throw error;
  return data as Pedido;
}

export async function obtenerPedidoParaComanda(
  supabase: SupabaseClient,
  pedidoId: string
): Promise<PedidoParaComanda | null> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "*, clientas(nombre, telefono, direccion, zona_entrega), comidas_pedido(*)"
    )
    .eq("id", pedidoId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as PedidoParaComanda | null;
}

export async function listarPedidosPendientesParaComanda(
  supabase: SupabaseClient
): Promise<PedidoParaComanda[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "*, clientas(nombre, telefono, direccion, zona_entrega), comidas_pedido(*)"
    )
    .eq("estado", "pendiente")
    .order("fecha_pedido", { ascending: false });

  if (error) throw error;
  return data as unknown as PedidoParaComanda[];
}

export async function actualizarPrecioPedido(
  supabase: SupabaseClient,
  pedidoId: string,
  precioTotal: number
): Promise<Pedido> {
  const { data, error } = await supabase
    .from("pedidos")
    .update({ precio_total: precioTotal })
    .eq("id", pedidoId)
    .select()
    .single();

  if (error) throw error;
  return data as Pedido;
}

/**
 * Día en que arranca la semana para el reporte de ingresos semanales.
 * 1 = lunes, 0 = domingo. Cambia este valor si la semana del negocio
 * debe empezar otro día.
 */
export const DIA_INICIO_SEMANA = 1;

/** Zona horaria del negocio: los cortes de semana/mes se hacen aquí. */
const ZONA_NEGOCIO = "America/New_York";

type PartesFecha = {
  y: number;
  m: number;
  d: number;
  h: number;
  mi: number;
  s: number;
};

function partesEnZona(fecha: Date): PartesFecha {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA_NEGOCIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);

  const valor = (tipo: string) =>
    Number(partes.find((p) => p.type === tipo)?.value ?? 0);

  return {
    y: valor("year"),
    m: valor("month"),
    d: valor("day"),
    h: valor("hour"),
    mi: valor("minute"),
    s: valor("second"),
  };
}

/** Diferencia (en minutos) entre la hora de Florida y UTC para ese instante. */
function desfaseZonaMinutos(fecha: Date): number {
  const p = partesEnZona(fecha);
  const comoUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s);
  return (comoUtc - fecha.getTime()) / 60000;
}

/** Instante UTC que corresponde a la medianoche de Florida de esa fecha. */
function medianocheEnZona(y: number, m: number, d: number): Date {
  const ingenuo = Date.UTC(y, m - 1, d, 0, 0, 0);
  const desfase = desfaseZonaMinutos(new Date(ingenuo));
  return new Date(ingenuo - desfase * 60000);
}

/** Devuelve el inicio (00:00 hora de Florida) de la semana actual. */
export function inicioDeSemana(ahora = new Date()): Date {
  const { y, m, d } = partesEnZona(ahora);
  const calendario = new Date(Date.UTC(y, m - 1, d));
  const diferencia = (calendario.getUTCDay() - DIA_INICIO_SEMANA + 7) % 7;
  calendario.setUTCDate(calendario.getUTCDate() - diferencia);

  return medianocheEnZona(
    calendario.getUTCFullYear(),
    calendario.getUTCMonth() + 1,
    calendario.getUTCDate()
  );
}

export async function calcularIngresosDelMes(
  supabase: SupabaseClient
): Promise<number> {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("pedidos")
    .select("precio_total")
    .eq("estado", "entregado")
    .gte("entregado_en", inicioMes.toISOString());

  if (error) throw error;
  return data.reduce((total, p) => total + Number(p.precio_total), 0);
}

/**
 * Ingresos de la semana actual. Se calcula desde el inicio de la semana, así
 * que se "limpia" solo cada semana sin borrar nada: los pedidos siguen
 * contando en el total mensual porque ese se calcula por su cuenta.
 */
export async function calcularIngresosDeLaSemana(
  supabase: SupabaseClient
): Promise<number> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("precio_total")
    .eq("estado", "entregado")
    .gte("entregado_en", inicioDeSemana().toISOString());

  if (error) throw error;
  return data.reduce((total, p) => total + Number(p.precio_total), 0);
}

export async function listarPedidosPendientes(
  supabase: SupabaseClient
): Promise<{ id: string; clienta_nombre: string; dia_entrega: string; precio_total: number; fecha_pedido: string }[]> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("id, dia_entrega, precio_total, fecha_pedido, clientas(nombre)")
    .eq("estado", "pendiente")
    .order("fecha_pedido", { ascending: false })
    .limit(10);

  if (error) throw error;

  type FilaPedidoPendiente = {
    id: string;
    dia_entrega: string;
    precio_total: number;
    fecha_pedido: string;
    clientas: { nombre: string } | null;
  };

  return ((data ?? []) as unknown as FilaPedidoPendiente[]).map((p) => ({
    id: p.id,
    clienta_nombre: p.clientas?.nombre ?? "Sin nombre",
    dia_entrega: p.dia_entrega,
    precio_total: p.precio_total,
    fecha_pedido: p.fecha_pedido,
  }));
}
