import type { PedidoParaComanda } from "@/models/types";

type Fila = { etiqueta: string; cantidad: number };

function agregar(mapa: Map<string, number>, clave: string) {
  mapa.set(clave, (mapa.get(clave) ?? 0) + 1);
}

function aFilas(mapa: Map<string, number>): Fila[] {
  return Array.from(mapa.entries())
    .map(([etiqueta, cantidad]) => ({ etiqueta, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad || a.etiqueta.localeCompare(b.etiqueta));
}

function construirResumen(pedidos: PedidoParaComanda[]) {
  const desayunos = new Map<string, number>();
  const platos = new Map<string, number>();
  const proteinasReg = new Map<string, number>();
  const carbosReg = new Map<string, number>();
  const vegetalesReg = new Map<string, number>();
  const extrasReg = new Map<string, number>();
  const proteinasMacro = new Map<string, number>();
  const carbosMacro = new Map<string, number>();
  const vegetalesMacro = new Map<string, number>();
  const extrasMacro = new Map<string, number>();

  let totalComidas = 0;

  for (const pedido of pedidos) {
    for (const c of pedido.comidas_pedido) {
      totalComidas++;

      if (c.es_desayuno) {
        agregar(desayunos, c.proteina);
        continue;
      }
      if (!c.carbohidrato) {
        // Plato completo: no se descompone en proteina/carb/veg.
        agregar(platos, c.proteina);
        continue;
      }

      const esMacro = c.gramos_proteina !== null;

      agregar(
        esMacro ? proteinasMacro : proteinasReg,
        esMacro ? `${c.proteina} — ${c.gramos_proteina}g` : c.proteina
      );
      agregar(
        esMacro ? carbosMacro : carbosReg,
        esMacro && c.gramos_carbohidrato !== null
          ? `${c.carbohidrato} — ${c.gramos_carbohidrato}g`
          : c.carbohidrato
      );
      if (c.vegetal) {
        agregar(esMacro ? vegetalesMacro : vegetalesReg, c.vegetal);
      }
      if (c.extra) {
        agregar(esMacro ? extrasMacro : extrasReg, c.extra);
      }
    }
  }

  return {
    totalComidas,
    desayunos: aFilas(desayunos),
    platos: aFilas(platos),
    regular: {
      proteinas: aFilas(proteinasReg),
      carbohidratos: aFilas(carbosReg),
      vegetales: aFilas(vegetalesReg),
      extras: aFilas(extrasReg),
    },
    macro: {
      proteinas: aFilas(proteinasMacro),
      carbohidratos: aFilas(carbosMacro),
      vegetales: aFilas(vegetalesMacro),
      extras: aFilas(extrasMacro),
    },
  };
}

function Seccion({ titulo, filas }: { titulo: string; filas: Fila[] }) {
  if (filas.length === 0) return null;
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-black/50 px-4 pt-2.5 pb-1">
        {titulo}
      </p>
      <ul className="divide-y divide-black/10">
        {filas.map((f) => (
          <li
            key={f.etiqueta}
            className="flex items-center gap-3 px-4 py-2 print:break-inside-avoid print:[page-break-inside:avoid]"
          >
            <span className="shrink-0 w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
              {f.cantidad}
            </span>
            <span className="text-[12px] text-black font-medium">
              {f.etiqueta}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BloqueModo({
  titulo,
  grupo,
}: {
  titulo: string;
  grupo: { proteinas: Fila[]; carbohidratos: Fila[]; vegetales: Fila[]; extras: Fila[] };
}) {
  const vacio =
    grupo.proteinas.length === 0 &&
    grupo.carbohidratos.length === 0 &&
    grupo.vegetales.length === 0 &&
    grupo.extras.length === 0;
  if (vacio) return null;

  return (
    <div className="print:break-inside-avoid">
      <div className="bg-black/5 px-4 py-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-black">
          {titulo}
        </p>
      </div>
      <Seccion titulo="Proteinas" filas={grupo.proteinas} />
      <Seccion titulo="Carbohidratos" filas={grupo.carbohidratos} />
      <Seccion titulo="Vegetales" filas={grupo.vegetales} />
      <Seccion titulo="Extras" filas={grupo.extras} />
    </div>
  );
}

export function ResumenCocina({ pedidos }: { pedidos: PedidoParaComanda[] }) {
  const resumen = construirResumen(pedidos);

  if (resumen.totalComidas === 0) return null;

  return (
    <div className="print:break-after-page mb-4 print:mb-0">
      <div className="bg-white border-2 border-black rounded-xl overflow-hidden">
        <div className="bg-black text-white px-4 py-2.5">
          <p className="font-display font-bold text-sm leading-none">
            Resumen de Cocina
          </p>
          <p className="text-[8px] uppercase tracking-[0.15em] text-white/60 mt-1">
            {resumen.totalComidas} comida{resumen.totalComidas === 1 ? "" : "s"} en total ·{" "}
            {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"} pendiente
            {pedidos.length === 1 ? "" : "s"}
          </p>
        </div>

        <Seccion titulo="Desayunos" filas={resumen.desayunos} />
        <Seccion titulo="Platos" filas={resumen.platos} />
        <BloqueModo titulo="Por porción (regular)" grupo={resumen.regular} />
        <BloqueModo titulo="Por gramos (macro)" grupo={resumen.macro} />
      </div>
    </div>
  );
}
