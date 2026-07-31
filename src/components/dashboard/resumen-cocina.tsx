import type { PedidoParaComanda } from "@/models/types";

function descripcionComida(
  c: PedidoParaComanda["comidas_pedido"][number]
): string {
  if (c.es_desayuno) return c.proteina;
  const base = `${c.proteina} + ${c.carbohidrato}${c.vegetal ? ` + ${c.vegetal}` : ""}`;
  return c.extra ? `${base} + extra: ${c.extra}` : base;
}

function agruparComidas(pedidos: PedidoParaComanda[]) {
  const conteo = new Map<string, number>();

  for (const pedido of pedidos) {
    for (const comida of pedido.comidas_pedido) {
      const descripcion = descripcionComida(comida);
      conteo.set(descripcion, (conteo.get(descripcion) ?? 0) + 1);
    }
  }

  return Array.from(conteo.entries())
    .map(([descripcion, cantidad]) => ({ descripcion, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad || a.descripcion.localeCompare(b.descripcion));
}

export function ResumenCocina({ pedidos }: { pedidos: PedidoParaComanda[] }) {
  const resumen = agruparComidas(pedidos);
  const totalComidas = resumen.reduce((suma, r) => suma + r.cantidad, 0);

  if (resumen.length === 0) return null;

  return (
    <div className="print:break-after-page mb-4 print:mb-0">
      <div className="bg-white border-2 border-black rounded-xl overflow-hidden">
        <div className="bg-black text-white px-4 py-2.5">
          <p className="font-display font-bold text-sm leading-none">
            Resumen de Cocina
          </p>
          <p className="text-[8px] uppercase tracking-[0.15em] text-white/60 mt-1">
            {totalComidas} comida{totalComidas === 1 ? "" : "s"} en total ·{" "}
            {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"} pendiente
            {pedidos.length === 1 ? "" : "s"}
          </p>
        </div>
        <ul className="divide-y divide-black/10">
          {resumen.map((r) => (
            <li
              key={r.descripcion}
              className="flex items-center gap-3 px-4 py-2.5 print:break-inside-avoid print:[page-break-inside:avoid]"
            >
              <span className="shrink-0 w-8 h-8 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center">
                {r.cantidad}
              </span>
              <span className="text-[13px] text-black font-medium">
                {r.descripcion}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
