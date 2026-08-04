import { createClient } from "@/lib/supabase/server";
import { Settings, Lock, MapPin, AlertTriangle, Tag } from "lucide-react";
import { CambiarClaveForm } from "@/components/dashboard/cambiar-clave-form";
import { WhatsappNumeroForm } from "@/components/dashboard/whatsapp-numero-form";
import { SedesRetiroPanel } from "@/components/dashboard/sedes-retiro-panel";
import { CodigosDescuentoForm } from "@/components/dashboard/codigos-descuento-form";
import { obtenerConfiguracion } from "@/models/configuracion.model";
import { listarSedes } from "@/models/sedes.model";

export default async function ConfiguracionPage() {
  let user: { email?: string; id?: string } | null = null;
  let whatsappNumero = "";
  let sedes: Awaited<ReturnType<typeof listarSedes>> = [];
  let codigo5 = "";
  let codigo10 = "";
  let errorMsg: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;
    whatsappNumero =
      (await obtenerConfiguracion(supabase, "whatsapp_numero")) ??
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
      "";
    sedes = await listarSedes(supabase);
    codigo5 = (await obtenerConfiguracion(supabase, "codigo_descuento_5")) ?? "";
    codigo10 = (await obtenerConfiguracion(supabase, "codigo_descuento_10")) ?? "";
  } catch {
    errorMsg = "No se pudo conectar con la base de datos.";
  }

  return (
    <div className="max-w-[800px] mx-auto p-4 md:p-6">
      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 bg-error-container/30 border border-error/30 rounded-2xl p-4">
          <AlertTriangle size={20} className="text-error shrink-0" />
          <p className="font-sans text-sm text-on-surface-variant">{errorMsg}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-display text-2xl md:text-[32px] font-semibold text-on-surface flex items-center gap-3">
          <Settings size={28} />
          Configuración
        </h2>
        <p className="font-sans text-on-surface-variant mt-1">
          Administra los ajustes del sistema
        </p>
      </div>

      <div className="space-y-6">
        {/* Datos del Negocio */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <h3 className="font-sans text-lg font-semibold text-on-surface mb-4">Datos del Negocio</h3>
          <div className="space-y-4">
            <div>
              <label className="font-sans text-sm font-medium text-on-surface">Nombre</label>
              <input
                type="text"
                defaultValue="JJ Healthy Food"
                className="mt-1 w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 font-sans text-on-surface focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <WhatsappNumeroForm numeroActual={whatsappNumero} />
          </div>
        </div>

        {/* Direcciones de Retiro */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <h3 className="font-sans text-lg font-semibold text-on-surface mb-2 flex items-center gap-2">
            <MapPin size={20} />
            Direcciones de Retiro
          </h3>
          <p className="font-sans text-sm text-on-surface-variant mb-4">
            El cliente ve la sede marcada como activa al armar su pedido.
            Podés editar la dirección o cargar otras sedes.
          </p>
          <SedesRetiroPanel sedes={sedes} />
        </div>

        {/* Días de Entrega */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <h3 className="font-sans text-lg font-semibold text-on-surface mb-4">Días de Retiro</h3>
          <p className="font-sans text-sm text-on-surface-variant mb-4">
            Los días en que los clientes pueden retirar su pedido
          </p>
          <div className="flex flex-wrap gap-3">
            {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((dia) => (
              <label
                key={dia}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <input
                  type="checkbox"
                  defaultChecked={dia === "Domingo" || dia === "Lunes"}
                  className="w-4 h-4 accent-primary"
                />
                <span className="font-sans text-sm text-on-surface">{dia}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Códigos de Descuento */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <h3 className="font-sans text-lg font-semibold text-on-surface mb-2 flex items-center gap-2">
            <Tag size={20} />
            Códigos de Descuento
          </h3>
          <p className="font-sans text-sm text-on-surface-variant mb-4">
            La clienta puede ingresar uno de estos códigos al llegar al
            resumen de su pedido, para un 5% o 10% off.
          </p>
          <CodigosDescuentoForm codigo5={codigo5} codigo10={codigo10} />
        </div>

        {/* Información de Cuenta */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <h3 className="font-sans text-lg font-semibold text-on-surface mb-4">Cuenta</h3>
          <div className="space-y-2 mb-6">
            <p className="font-sans text-sm text-on-surface-variant">
              <span className="font-medium text-on-surface">Email:</span> {user?.email}
            </p>
            <p className="font-sans text-sm text-on-surface-variant">
              <span className="font-medium text-on-surface">ID:</span> {user?.id}
            </p>
          </div>
        </div>

        {/* Cambiar Contraseña */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
          <h3 className="font-sans text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Lock size={20} />
            Cambiar Contraseña
          </h3>
          <CambiarClaveForm />
        </div>

      </div>
    </div>
  );
}
