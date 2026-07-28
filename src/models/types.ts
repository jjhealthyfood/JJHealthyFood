export type Clienta = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string | null;
  zona_entrega: string | null;
  created_at: string;
};

export type DiaEntrega = "domingo" | "lunes";
export type EstadoPedido = "pendiente" | "en_preparacion" | "entregado";
export type ModoPedido = "racion" | "macro";

export type Pedido = {
  id: string;
  clienta_id: string;
  fecha_pedido: string;
  dia_entrega: DiaEntrega;
  estado: EstadoPedido;
  modo: ModoPedido;
  precio_total: number;
  notas: string | null;
  sede_nombre: string | null;
  sede_direccion: string | null;
};

export type SedeRetiro = {
  id: string;
  nombre: string;
  direccion: string;
  activa: boolean;
  orden: number;
};

export type ComidaPedido = {
  id: string;
  pedido_id: string;
  numero_comida: number;
  proteina: string;
  carbohidrato: string;
  vegetal: string | null;
  extra: string | null;
  gramos_proteina: number | null;
  gramos_carbohidrato: number | null;
  precio: number;
  es_desayuno: boolean;
};

export type PedidoConDetalle = Pedido & {
  clientas: Pick<
    Clienta,
    "nombre" | "telefono" | "zona_entrega" | "direccion"
  > | null;
  comidas_pedido: Pick<ComidaPedido, "proteina">[];
};

export type ClientaConPedidos = Clienta & {
  pedidos: Pick<Pedido, "id" | "fecha_pedido">[];
};

export type PedidoParaComanda = Pedido & {
  clientas: Pick<
    Clienta,
    "nombre" | "telefono" | "direccion" | "zona_entrega"
  > | null;
  comidas_pedido: ComidaPedido[];
};

export type EstadoClienta = "vip" | "recurrente" | "nuevo" | "inactivo";

export type CategoriaMenu = "proteina" | "carbohidrato" | "vegetal" | "desayuno" | "plato";
export type NivelProteina = "sencilla" | "premium";

export type OpcionMenu = {
  id: string;
  categoria: CategoriaMenu;
  nombre: string;
  nivel: NivelProteina | null;
  precio_racion: number | null;
  precio_macro_gramo: number | null;
  orden: number;
  excluido_extra: boolean;
  extra_price_override: number | null;
};
