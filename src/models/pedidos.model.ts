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
    ...datos,
  };
}

export async function listarPedidosRecientes(
  supabase: SupabaseClient,
  limite = 20
): Promise<{ pedidos: PedidoConDetalle[]; total: number }> {
  const { data, error, count } = await supabase
    .from("pedidos")
    .select(
      "*, clientas(nombre, telefono, zona_entrega, direccion), comidas_pedido(proteina)",
      { count: "exact" }
    )
    .order("fecha_pedido", { ascending: false })
    .limit(limite);

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
