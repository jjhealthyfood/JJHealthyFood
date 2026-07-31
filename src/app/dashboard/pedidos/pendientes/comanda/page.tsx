import { createClient } from "@/lib/supabase/server";
import { listarPedidosPendientesParaComanda } from "@/models/pedidos.model";
import { BotonImprimirComanda } from "@/components/dashboard/boton-imprimir-comanda";
import { ComandaTicket } from "@/components/dashboard/comanda-ticket";
import { ResumenCocina } from "@/components/dashboard/resumen-cocina";
import { AutoPrint } from "@/components/dashboard/auto-print";

export default async function ComandasPendientesPage() {
  let pedidos: Awaited<ReturnType<typeof listarPedidosPendientesParaComanda>> = [];

  try {
    const supabase = await createClient();
    pedidos = await listarPedidosPendientesParaComanda(supabase);
  } catch {
    pedidos = [];
  }

  return (
    <div className="min-h-screen bg-surface-container-low py-8 px-4 print:bg-white print:p-0 print:min-h-0">
      {pedidos.length > 0 && <AutoPrint />}
      <div className="max-w-sm mx-auto print:max-w-none">
        <div className="print:hidden mb-4 flex flex-col items-center gap-2">
          <p className="font-sans text-sm text-on-surface-variant">
            {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"} pendiente
            {pedidos.length === 1 ? "" : "s"}
          </p>
          {pedidos.length > 0 && <BotonImprimirComanda />}
        </div>

        {pedidos.length === 0 ? (
          <p className="text-center text-on-surface-variant font-sans">
            No hay pedidos pendientes por imprimir.
          </p>
        ) : (
          <>
            <ResumenCocina pedidos={pedidos} />
            <div className="space-y-2 print:space-y-0 print:block">
              {pedidos.map((pedido, index) => (
                <ComandaTicket
                  key={pedido.id}
                  pedido={pedido}
                  showSeparator={index < pedidos.length - 1}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
