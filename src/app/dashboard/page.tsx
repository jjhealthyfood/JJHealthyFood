import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  calcularIngresosDelMes,
  calcularIngresosDeLaSemana,
  contarPedidosEntregados,
  contarPedidosPendientes,
  DIA_INICIO_SEMANA,
  inicioDeSemana,
  listarPedidosRecientes,
} from "@/models/pedidos.model";
import { PedidosRecientes } from "@/components/dashboard/pedidos-recientes";
import {
  Wallet,
  Hourglass,
  Truck,
  Printer,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(valor);
}

const NOMBRES_DIA = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

const PEDIDOS_POR_PAGINA = 20;

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const paginaActual = Math.max(1, Number(page) || 1);

  let ingresosMes = 0;
  let ingresosSemana = 0;
  let pendientes = 0;
  let entregados = 0;
  let pedidos: Awaited<ReturnType<typeof listarPedidosRecientes>>["pedidos"] = [];
  let total = 0;
  let errorMsg: string | null = null;

  try {
    const supabase = await createClient();

    const resultados = await Promise.all([
      calcularIngresosDelMes(supabase).catch(() => 0),
      calcularIngresosDeLaSemana(supabase).catch(() => 0),
      contarPedidosPendientes(supabase).catch(() => 0),
      contarPedidosEntregados(supabase).catch(() => 0),
      listarPedidosRecientes(supabase, paginaActual, PEDIDOS_POR_PAGINA).catch(() => ({ pedidos: [], total: 0 })),
    ]);

    [ingresosMes, ingresosSemana, pendientes, entregados, { pedidos, total }] =
      resultados;
  } catch {
    errorMsg = "No se pudo conectar con la base de datos. Intenta de nuevo.";
  }

  const hoy = new Intl.DateTimeFormat("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const inicioSemanaTexto = new Intl.DateTimeFormat("es-VE", {
    day: "numeric",
    month: "short",
    timeZone: "America/New_York",
  }).format(inicioDeSemana());

  const nombreDiaInicio = NOMBRES_DIA[DIA_INICIO_SEMANA] ?? "lunes";

  return (
    <div className="max-w-[1280px] mx-auto p-4 md:p-6">
      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 bg-error-container/30 border border-error/30 rounded-2xl p-4">
          <AlertTriangle size={20} className="text-error shrink-0" />
          <div>
            <p className="font-sans text-sm font-semibold text-on-surface">
              Error de conexión
            </p>
            <p className="font-sans text-sm text-on-surface-variant">
              {errorMsg}
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-[32px] font-semibold text-on-surface">
            Panel de Pedidos
          </h2>
          <p className="font-sans text-on-surface-variant capitalize">
            {hoy} · {total} pedidos en total
          </p>
        </div>
        <Link
          href="/dashboard/pedidos/pendientes/comanda"
          target="_blank"
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-xl font-sans text-sm font-semibold active:scale-95 transition-all"
        >
          <Printer size={18} />
          Imprimir pendientes
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8">
        {/* Ingresos: el mensual acumula todo el mes; el semanal solo la semana en curso */}
        <div className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex justify-between items-start gap-3">
            <div>
              <p className="font-sans text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Ingresos Mensuales
              </p>
              <h3 className="font-display text-[26px] sm:text-[28px] xl:text-3xl font-semibold leading-tight text-primary tabular-nums">
                {formatearMoneda(ingresosMes)}
              </h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl shrink-0">
              <Wallet className="text-primary" size={26} />
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex justify-between items-start gap-3">
            <div>
              <p className="font-sans text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Ingresos Semanales
              </p>
              <h3 className="font-display text-[26px] sm:text-[28px] xl:text-3xl font-semibold leading-tight text-primary tabular-nums">
                {formatearMoneda(ingresosSemana)}
              </h3>
              <p className="font-sans text-[11px] text-on-surface-variant mt-2 leading-snug">
                Desde el {inicioSemanaTexto} · reinicia cada {nombreDiaInicio}
              </p>
            </div>
            <div className="bg-secondary-fixed-dim/30 p-3 rounded-xl shrink-0">
              <CalendarDays className="text-secondary" size={26} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-4 md:gap-6">
          <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex justify-between items-center">
            <div>
              <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mb-1">
                Pedidos Pendientes
              </p>
              <h4 className="font-display text-2xl font-semibold text-on-surface">
                {pendientes}
              </h4>
            </div>
            <div className="bg-secondary-fixed-dim/30 text-secondary p-4 rounded-full shrink-0">
              <Hourglass size={22} />
            </div>
          </div>
          <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex justify-between items-center">
            <div>
              <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mb-1">
                Entregados
              </p>
              <h4 className="font-display text-2xl font-semibold text-on-surface">
                {entregados}
              </h4>
            </div>
            <div className="bg-tertiary-container/20 text-tertiary p-4 rounded-full shrink-0">
              <Truck size={22} />
            </div>
          </div>
        </div>
      </div>

      <PedidosRecientes
        pedidos={pedidos}
        total={total}
        paginaActual={paginaActual}
        porPagina={PEDIDOS_POR_PAGINA}
      />
    </div>
  );
}
