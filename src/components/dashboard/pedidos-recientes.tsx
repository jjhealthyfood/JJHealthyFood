"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Printer, ChevronLeft, ChevronRight, Search, Tag } from "lucide-react";
import type { PedidoConDetalle } from "@/models/types";
import { EstadoSelector } from "./estado-selector";
import { PrecioEditor } from "./precio-editor";

const AVATAR_COLORS = [
  "bg-secondary-fixed-dim text-on-secondary-fixed",
  "bg-tertiary-fixed text-on-tertiary-fixed",
  "bg-primary-fixed text-on-primary-fixed",
  "bg-outline-variant text-on-surface-variant",
];

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function formatearFecha(fechaIso: string) {
  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(fechaIso));
}

function detalleComidas(pedido: PedidoConDetalle) {
  const proteinas = Array.from(
    new Set(pedido.comidas_pedido.map((c) => c.proteina))
  );
  const cantidad = pedido.comidas_pedido.length;
  if (cantidad === 0) return "Sin comidas registradas";
  return `${proteinas.join(" · ")} (${cantidad} comida${cantidad === 1 ? "" : "s"})`;
}

function BotonImprimir({ pedidoId }: { pedidoId: string }) {
  return (
    <Link
      href={`/dashboard/pedidos/${pedidoId}/comanda`}
      target="_blank"
      className="text-primary font-sans text-sm font-semibold inline-flex items-center gap-1 hover:underline"
    >
      Imprimir
      <Printer size={14} />
    </Link>
  );
}

export function PedidosRecientes({
  pedidos,
  total,
}: {
  pedidos: PedidoConDetalle[];
  total: number;
}) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = pedidos.filter((pedido) => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return true;
    return (
      (pedido.clientas?.nombre ?? "").toLowerCase().includes(termino) ||
      pedido.id.slice(0, 5).toLowerCase().includes(termino) ||
      (pedido.sede_nombre ?? "").toLowerCase().includes(termino) ||
      (pedido.direccion_entrega ?? "").toLowerCase().includes(termino) ||
      detalleComidas(pedido).toLowerCase().includes(termino)
    );
  });

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="px-4 md:px-6 py-5 border-b border-outline-variant flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
        <h3 className="font-display text-xl font-semibold text-on-surface">
          Pedidos Recientes
        </h3>
        <div className="relative w-full md:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, ID o sede..."
            className="w-full h-10 pl-9 pr-3 bg-surface-container-low border border-outline-variant rounded-full text-sm font-sans focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="p-10 text-center text-on-surface-variant font-sans">
          Aún no hay pedidos registrados.
        </div>
      ) : filtrados.length === 0 ? (
        <div className="p-10 text-center text-on-surface-variant font-sans">
          Ningún pedido coincide con esa búsqueda.
        </div>
      ) : (
        <>
          {/* Tabla (escritorio) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 font-sans text-xs font-bold text-on-surface-variant uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-4 font-sans text-xs font-bold text-on-surface-variant uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-4 font-sans text-xs font-bold text-on-surface-variant uppercase">
                    Detalle del pedido
                  </th>
                  <th className="px-6 py-4 font-sans text-xs font-bold text-on-surface-variant uppercase">
                    Retiro en
                  </th>
                  <th className="px-6 py-4 font-sans text-xs font-bold text-on-surface-variant uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-4 font-sans text-xs font-bold text-on-surface-variant uppercase text-center">
                    Estado
                  </th>
                  <th className="px-6 py-4 font-sans text-xs font-bold text-on-surface-variant uppercase text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtrados.map((pedido, i) => (
                  <tr
                    key={pedido.id}
                    className="hover:bg-surface-bright transition-colors"
                  >
                    <td className="px-6 py-5">
                      <p className="font-sans text-sm text-on-surface whitespace-nowrap">
                        {formatearFecha(pedido.fecha_pedido)}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                        >
                          {iniciales(pedido.clientas?.nombre ?? "?")}
                        </div>
                        <div>
                          <p className="font-sans text-sm font-semibold text-on-surface">
                            {pedido.clientas?.nombre ?? "Clienta eliminada"}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            ID: #{pedido.id.slice(0, 5).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-on-surface text-sm">
                        {detalleComidas(pedido)}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1 text-on-surface-variant text-sm">
                        <MapPin size={14} />
                        {pedido.tipo_entrega === "delivery"
                          ? `Delivery — ${pedido.direccion_entrega ?? "—"}`
                          : pedido.sede_nombre ?? "—"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <PrecioEditor
                        pedidoId={pedido.id}
                        precioInicial={pedido.precio_total}
                      />
                      {pedido.descuento_pct > 0 && (
                        <span className="inline-flex items-center gap-1 mt-1 bg-secondary text-on-secondary text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                          <Tag size={11} />
                          {pedido.descuento_pct}% OFF
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <EstadoSelector
                        pedidoId={pedido.id}
                        estadoInicial={pedido.estado}
                      />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <BotonImprimir pedidoId={pedido.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas (movil) */}
          <div className="md:hidden divide-y divide-outline-variant/40">
            {filtrados.map((pedido) => (
              <div key={pedido.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-semibold text-on-surface">
                      {pedido.clientas?.nombre ?? "Clienta eliminada"}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {formatearFecha(pedido.fecha_pedido)}
                    </span>
                    <span className="text-sm text-on-surface-variant">
                      {pedido.tipo_entrega === "delivery"
                        ? `Delivery — ${pedido.direccion_entrega ?? "—"}`
                        : pedido.sede_nombre ?? "—"}
                    </span>
                  </div>
                  <EstadoSelector
                    pedidoId={pedido.id}
                    estadoInicial={pedido.estado}
                  />
                </div>
                <div className="text-sm text-on-surface-variant">
                  {detalleComidas(pedido)}
                </div>
                <div className="flex justify-between items-center border-t border-outline-variant/20 pt-3">
                  <div>
                    <PrecioEditor
                      pedidoId={pedido.id}
                      precioInicial={pedido.precio_total}
                    />
                    {pedido.descuento_pct > 0 && (
                      <span className="inline-block mt-1 bg-secondary-container/40 text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {pedido.descuento_pct}% off
                      </span>
                    )}
                  </div>
                  <BotonImprimir pedidoId={pedido.id} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="px-4 md:px-6 py-4 bg-surface-container-low flex justify-between items-center">
        <p className="font-sans text-xs text-on-surface-variant">
          {busqueda
            ? `Mostrando ${filtrados.length} de ${pedidos.length} pedidos cargados`
            : `Mostrando ${pedidos.length} de ${total} pedidos`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1 rounded bg-primary text-on-primary font-sans text-xs">
            1
          </span>
          <button
            type="button"
            disabled={pedidos.length >= total}
            className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
