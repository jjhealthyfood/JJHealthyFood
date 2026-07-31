import { UtensilsCrossed } from "lucide-react";
import type { PedidoParaComanda } from "@/models/types";

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-[8px] font-bold uppercase tracking-wider text-black/50">
        {label}
      </p>
      <p className="text-[11px] font-semibold text-black leading-snug">
        {valor}
      </p>
    </div>
  );
}

const DIAS_LABELS: Record<string, string> = {
  domingo: "Domingo",
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
};

export function ComandaTicket({
  pedido,
  showSeparator = true,
}: {
  pedido: PedidoParaComanda;
  showSeparator?: boolean;
}) {
  const comidas = [...pedido.comidas_pedido].sort(
    (a, b) => a.numero_comida - b.numero_comida
  );
  const diaLabel = DIAS_LABELS[pedido.dia_entrega] ?? pedido.dia_entrega;

  return (
    <div className="print:break-inside-avoid print:[page-break-inside:avoid] print:mb-3">
      <div className="bg-white border-2 border-black rounded-xl overflow-hidden w-full">
        {/* Encabezado */}
        <div className="bg-black text-white flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shrink-0">
              <UtensilsCrossed size={13} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-none">
                JJ Healthy Food
              </p>
              <p className="text-[8px] uppercase tracking-[0.15em] text-white/60 mt-1">
                Comanda de pedido
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase tracking-wider text-white/60">
              Pedido
            </p>
            <p className="font-mono text-sm font-bold">
              #{pedido.id.slice(0, 5).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Cuerpo: dos columnas */}
        <div className="flex divide-x divide-black/15">
          {/* Datos de la clienta */}
          <div className="w-[34%] p-3 space-y-2">
            <Campo label="Clienta" valor={pedido.clientas?.nombre ?? "—"} />
            <Campo label="Teléfono" valor={pedido.clientas?.telefono ?? "—"} />
            {pedido.tipo_entrega === "delivery" ? (
              <Campo
                label="Entregar en"
                valor={pedido.direccion_entrega ?? "—"}
              />
            ) : (
              <Campo
                label="Retirar en"
                valor={
                  pedido.sede_nombre
                    ? `${pedido.sede_nombre} — ${pedido.sede_direccion ?? ""}`
                    : "—"
                }
              />
            )}
            {pedido.notas && <Campo label="Detalles" valor={pedido.notas} />}

            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-black/50">
                {pedido.tipo_entrega === "delivery" ? "Delivery" : "Retiro"}
              </p>
              <span className="inline-block mt-1 bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {diaLabel}
              </span>
            </div>

            <div className="pt-1 space-y-1">
              <span className="flex items-center gap-1.5 text-[10px] text-black/70">
                <span className="w-3 h-3 rounded-full border border-black/50 inline-block shrink-0" />
                Empacado
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-black/70">
                <span className="w-3 h-3 rounded-full border border-black/50 inline-block shrink-0" />
                Retirado
              </span>
            </div>
          </div>

          {/* Comidas */}
          <div className="flex-1 p-3">
            <ul className="divide-y divide-black/10">
              {comidas.map((c, i) => (
                <li key={c.id} className="flex items-center gap-2.5 py-1.5">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[12px] text-black font-medium">
                    {c.es_desayuno
                      ? c.proteina
                      : !c.carbohidrato && !c.vegetal
                      ? c.proteina
                      : `${c.proteina} + ${c.carbohidrato}${c.vegetal ? ` + ${c.vegetal}` : ""}`}
                    {c.extra ? ` + ${c.extra}` : ""}
                    {!c.es_desayuno &&
                      c.gramos_proteina !== null &&
                      ` (${c.gramos_proteina}g / ${c.gramos_carbohidrato}g)`}
                  </span>
                  <span className="w-3.5 h-3.5 rounded-full border border-black/40 shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Separador de corte */}
      {showSeparator && (
        <div className="flex items-center gap-2 my-1 print:my-0">
          <div className="flex-1 border-t border-dashed border-black/30" />
          <span className="text-[8px] uppercase tracking-widest text-black/40 shrink-0">
            Recortar aquí
          </span>
          <div className="flex-1 border-t border-dashed border-black/30" />
        </div>
      )}
    </div>
  );
}
