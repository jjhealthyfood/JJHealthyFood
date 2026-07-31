"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  ChevronLeft,
  MapPin,
  Send,
  Clock,
  Leaf,
  Minus,
  Plus,
  Pencil,
  CheckCircle2,
  Star,
  ChefHat,
  Store,
  Settings2,
} from "lucide-react";
import { Chip } from "./chip";
import {
  buscarClientaPorTelefono,
  enviarPedido,
  type ComidaSeleccionada,
  type DatosEntrega,
} from "@/controllers/pedidos.actions";
import type { DiaEntrega, ModoPedido, OpcionMenu, SedeRetiro, TipoEntrega } from "@/models/types";
import type { ExtrasConfig } from "@/models/menu.model";

const TELEFONO_US_REGEX = /^(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const ZIP_FLORIDA_REGEX = /\b3[2-4]\d{3}\b/;
const ESTADO_FLORIDA_REGEX = /\bFL\b|florida/i;

function esDireccionFloridaValida(direccion: string): boolean {
  const texto = direccion.trim();
  if (texto.length < 10) return false;
  return ESTADO_FLORIDA_REGEX.test(texto) && ZIP_FLORIDA_REGEX.test(texto);
}

type TipoComida = "regular" | "desayuno" | "plato";

type ComidaSlot = {
  tipo: TipoComida;
  proteinaId: string;
  carbohidrato: string;
  vegetal: string;
  cantidad: number;
  gramosProteina: number;
  gramosCarbohidrato: number;
  extraActivo: boolean;
  extraValor: string;
};

const comidaVacia: ComidaSlot = {
  tipo: "regular",
  proteinaId: "",
  carbohidrato: "",
  vegetal: "",
  cantidad: 1,
  gramosProteina: 100,
  gramosCarbohidrato: 100,
  extraActivo: false,
  extraValor: "",
};

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(valor);
}

function proximaFecha(diaSemana: number, forzarProximaSemana = false): Date {
  const hoy = new Date();
  let diff = (diaSemana - hoy.getDay() + 7) % 7;
  if (forzarProximaSemana || diff === 0) diff += 7;
  const resultado = new Date(hoy);
  resultado.setDate(hoy.getDate() + diff);
  return resultado;
}

function etiquetaFecha(fecha: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(fecha);
}

function estaAntesDelCorte(): boolean {
  const ahora = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const partes = formatter.formatToParts(ahora);
  const dia = partes.find((p) => p.type === "weekday")?.value;
  const hora = parseInt(partes.find((p) => p.type === "hour")?.value ?? "0");
  const minuto = parseInt(partes.find((p) => p.type === "minute")?.value ?? "0");

  if (dia === "Sat" || dia === "Sun") return false;
  if (dia === "Fri" && (hora > 18 || (hora === 18 && minuto > 0))) return false;
  return true;
}

const PRECIOS_MACRO: Record<string, number> = {
  sencilla: 12,
  premium: 14,
};

function precioComida(
  slot: ComidaSlot,
  modo: ModoPedido,
  proteinas: OpcionMenu[],
  opcionesDesayuno: OpcionMenu[],
  extrasConfig?: ExtrasConfig,
  platos?: OpcionMenu[],
  carbohidratosFull?: OpcionMenu[],
  vegetalesFull?: OpcionMenu[]
): number {
  if (slot.tipo === "desayuno") {
    const desayuno = opcionesDesayuno.find((d) => d.nombre === slot.proteinaId);
    if (!desayuno) return 0;
    const precioBD = Number(desayuno.precio_racion);
    if (!isNaN(precioBD) && precioBD > 0) return precioBD;
    return 0;
  }
  if (slot.tipo === "plato") {
    const plato = platos?.find((p) => p.id === slot.proteinaId);
    if (!plato) return 0;
    if (modo === "macro") {
      const precioBD = Number(plato.precio_macro_gramo);
      if (!isNaN(precioBD) && precioBD > 0) return precioBD;
      return 12;
    }
    const precioBD = Number(plato.precio_racion);
    if (!isNaN(precioBD) && precioBD > 0) return precioBD;
    return 9;
  }
  const proteina = proteinas.find((p) => p.id === slot.proteinaId);
  if (!proteina) return 0;
  let base = 0;
  if (modo === "macro") {
    const precioBD = Number(proteina.precio_macro_gramo);
    if (!isNaN(precioBD) && precioBD > 0) base = precioBD;
    else {
      const fallback = proteina.nivel ? PRECIOS_MACRO[proteina.nivel] : undefined;
      base = fallback ?? 0;
    }
  } else {
    const precioBD = Number(proteina.precio_racion);
    if (!isNaN(precioBD) && precioBD > 0) base = precioBD;
  }

  let extra = 0;
  if (slot.extraActivo && slot.extraValor) {
    extra = precioExtraDeItem(slot.extraValor, proteinas, carbohidratosFull, vegetalesFull, extrasConfig);
  }

  return base + extra;
}

function precioExtraDeItem(
  nombre: string,
  proteinas: OpcionMenu[],
  carbohidratosFull: OpcionMenu[] | undefined,
  vegetalesFull: OpcionMenu[] | undefined,
  extrasConfig?: ExtrasConfig
): number {
  const extraProteina = proteinas.find((p) => p.nombre === nombre);
  if (extraProteina) {
    if (extraProteina.extra_price_override !== null && extraProteina.extra_price_override !== undefined) {
      return Number(extraProteina.extra_price_override);
    }
    return extraProteina.nivel === "premium"
      ? (extrasConfig?.proteina_premium ?? 2)
      : (extrasConfig?.proteina_regular ?? 1);
  }
  const extraCarb = carbohidratosFull?.find((c) => c.nombre === nombre);
  if (extraCarb) {
    if (extraCarb.extra_price_override !== null && extraCarb.extra_price_override !== undefined) {
      return Number(extraCarb.extra_price_override);
    }
    return extrasConfig?.carbohidrato ?? 0.5;
  }
  const extraVeg = vegetalesFull?.find((v) => v.nombre === nombre);
  if (extraVeg) {
    if (extraVeg.extra_price_override !== null && extraVeg.extra_price_override !== undefined) {
      return Number(extraVeg.extra_price_override);
    }
    return extrasConfig?.vegetal ?? 0;
  }
  return 0;
}

function etiquetaPaso(paso: number, cantidad: number) {
  if (paso === 0) return "Quantity";
  if (paso === 1) return "Mode";
  if (paso <= cantidad + 1) return `Meal ${paso - 1}`;
  if (paso === cantidad + 2) return "Pickup";
  return "Summary";
}

export function PedidoWizard({
  proteinas,
  carbohidratos,
  vegetales,
  carbohidratosFull = [],
  vegetalesFull = [],
  opcionesDesayuno,
  sedes,
  extrasConfig,
  platos = [],
}: {
  proteinas: OpcionMenu[];
  carbohidratos: string[];
  vegetales: string[];
  carbohidratosFull?: OpcionMenu[];
  vegetalesFull?: OpcionMenu[];
  opcionesDesayuno: OpcionMenu[];
  sedes: SedeRetiro[];
  extrasConfig?: ExtrasConfig;
  platos?: OpcionMenu[];
}) {
  const [iniciado, setIniciado] = useState(false);
  const [paso, setPaso] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [modo, setModo] = useState<ModoPedido>("racion");
  const [comidas, setComidas] = useState<ComidaSlot[]>([{ ...comidaVacia }]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [detalles, setDetalles] = useState("");
  const [sedeId, setSedeId] = useState(() =>
    sedes.length === 1 ? sedes[0].id : ""
  );
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>("pickup");
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [diaEntrega, setDiaEntrega] = useState<DiaEntrega | "">("");
  const [bienvenidaClienta, setBienvenidaClienta] = useState<string | null>(
    null
  );
  const [enviando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [resumenVisitado, setResumenVisitado] = useState(false);
  const [mostrarAvisoCorte, setMostrarAvisoCorte] = useState(false);
  const [forzarProximaSemana, setForzarProximaSemana] = useState(false);

  const totalPasos = cantidad + 4; // cantidad + modo + N comidas + entrega + resumen
  const esPasoCantidad = paso === 0;
  const esPasoModo = paso === 1;
  const esPasoComida = paso >= 2 && paso <= cantidad + 1;
  const esPasoEntrega = paso === cantidad + 2;
  const esPasoResumen = paso === cantidad + 3;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [paso]);

  function cambiarCantidad(nueva: number) {
    const limitada = Math.max(1, nueva);
    setCantidad(limitada);
    setComidas((prev) => {
      const copia = [...prev];
      while (copia.length < limitada) copia.push({ ...comidaVacia });
      return copia.slice(0, Math.max(limitada, copia.length));
    });
    setResumenVisitado(false);
  }

  function cambiarModo(nuevoModo: ModoPedido) {
    setModo(nuevoModo);
    setResumenVisitado(false);
  }

  function actualizarComida(indice: number, cambios: Partial<ComidaSlot>) {
    setComidas((prev) =>
      prev.map((c, i) => (i === indice ? { ...c, ...cambios } : c))
    );
  }

  async function alSalirDeTelefono() {
    if (!telefono.trim()) return;
    const encontrada = await buscarClientaPorTelefono(telefono.trim());
    if (encontrada) {
      setBienvenidaClienta(encontrada.nombre);
      if (!nombre) setNombre(encontrada.nombre);
    }
  }

  function puedeAvanzar() {
    if (esPasoCantidad || esPasoModo) return true;
    if (esPasoComida) {
      const c = comidas[paso - 2];
      if (c.tipo === "desayuno") return Boolean(c.proteinaId);
      if (c.tipo === "plato") return Boolean(c.proteinaId);
      return Boolean(c.proteinaId && c.carbohidrato);
    }
    if (esPasoEntrega) {
      return Boolean(
        nombre.trim() &&
          telefono.trim() &&
          TELEFONO_US_REGEX.test(telefono.trim()) &&
          (tipoEntrega === "delivery"
            ? esDireccionFloridaValida(direccionEntrega)
            : sedeId) &&
          diaEntrega
      );
    }
    return true;
  }

  function siguiente() {
    if (!puedeAvanzar()) return;
    if (resumenVisitado) {
      setPaso(totalPasos - 1);
      return;
    }
    const nuevoPaso = Math.min(paso + 1, totalPasos - 1);

    if (!forzarProximaSemana && nuevoPaso === cantidad + 2 && !estaAntesDelCorte()) {
      setMostrarAvisoCorte(true);
      return;
    }

    setPaso(nuevoPaso);
    if (nuevoPaso === totalPasos - 1) setResumenVisitado(true);
  }

  function atras() {
    setPaso((p) => Math.max(p - 1, 0));
  }

  const comidasActivas = comidas.slice(0, cantidad);
  const total = comidasActivas.reduce(
    (suma, c) => suma + precioComida(c, modo, proteinas, opcionesDesayuno, extrasConfig, platos, carbohidratosFull, vegetalesFull),
    0
  );

  function enviar() {
    if (!diaEntrega) return;
    if (
      tipoEntrega === "delivery"
        ? !esDireccionFloridaValida(direccionEntrega)
        : !sedeId
    )
      return;
    setError(null);

    // Open the tab right away (synchronously, inside the click) so the
    // browser doesn't block it as a popup; the real WhatsApp URL is
    // assigned once the server responds.
    const ventana = window.open("", "_blank");

    const datosEntrega: DatosEntrega = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      detalles: detalles.trim(),
      dia_entrega: diaEntrega,
      tipo_entrega: tipoEntrega,
      sede_id: sedeId,
      direccion_entrega: direccionEntrega.trim(),
    };

    const comidasSeleccionadas: ComidaSeleccionada[] = comidasActivas.map(
      (c, i) => {
        const proteina = proteinas.find((p) => p.id === c.proteinaId);
        const plato = platos?.find((p) => p.id === c.proteinaId);
        return {
          numero_comida: i + 1,
          proteina: c.tipo === "desayuno" ? c.carbohidrato : c.tipo === "plato" ? plato?.nombre ?? "" : proteina?.nombre ?? "",
          carbohidrato: c.tipo === "desayuno" || c.tipo === "plato" ? "" : c.carbohidrato,
          vegetal: c.tipo === "desayuno" || c.tipo === "plato" ? null : c.vegetal || null,
          extra: c.extraActivo && c.extraValor ? c.extraValor : null,
          gramos_proteina:
            modo === "macro" && c.tipo !== "desayuno" ? c.gramosProteina : null,
          gramos_carbohidrato:
            modo === "macro" && c.tipo !== "desayuno" ? c.gramosCarbohidrato : null,
          precio: precioComida(c, modo, proteinas, opcionesDesayuno, extrasConfig, platos, carbohidratosFull, vegetalesFull),
          es_desayuno: c.tipo === "desayuno",
        };
      }
    );

    startTransition(async () => {
      const resultado = await enviarPedido(datosEntrega, modo, comidasSeleccionadas);
      if (resultado.success) {
        setEnviado(true);
        if (ventana) {
          ventana.location.href = resultado.whatsappUrl;
        } else {
          window.location.href = resultado.whatsappUrl;
        }
      } else {
        ventana?.close();
        setError(resultado.error);
      }
    });
  }

  if (!iniciado) {
    return <IntroScreen onComenzar={() => setIniciado(true)} />;
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      <header className="flex items-center gap-3 px-4 h-16 border-b border-outline-variant/40">
        <a href="/pedido" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="JJ Healthy Food" className="w-9 h-9 object-contain" />
          <div>
            <h1 className="font-display text-base font-semibold text-primary leading-none">
              JJ Healthy Food
            </h1>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-widest mt-0.5">
              Build Your Order
            </p>
          </div>
        </a>
      </header>

      {/* Progress */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-sans font-semibold text-on-surface-variant">
            Step {paso + 1} of {totalPasos} · {etiquetaPaso(paso, cantidad)}
          </span>
        </div>
        <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((paso + 1) / totalPasos) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-lg w-full mx-auto">
        {esPasoCantidad && (
          <PasoCantidad cantidad={cantidad} onCambiar={cambiarCantidad} />
        )}

        {esPasoModo && <PasoModo modo={modo} onCambiar={cambiarModo} />}

        {esPasoComida && (
          <PasoComida
            numero={paso - 1}
            comida={comidas[paso - 2]}
            modo={modo}
            proteinas={proteinas}
            carbohidratos={carbohidratos}
            vegetales={vegetales}
            carbohidratosFull={carbohidratosFull}
            vegetalesFull={vegetalesFull}
            opcionesDesayuno={opcionesDesayuno}
            onCambiar={(cambios) => actualizarComida(paso - 2, cambios)}
            extrasConfig={extrasConfig}
            platos={platos}
          />
        )}

        {esPasoEntrega && (
          <PasoEntrega
            nombre={nombre}
            telefono={telefono}
            detalles={detalles}
            diaEntrega={diaEntrega}
            bienvenidaClienta={bienvenidaClienta}
            sedes={sedes}
            sedeId={sedeId}
            tipoEntrega={tipoEntrega}
            direccionEntrega={direccionEntrega}
            forzarProximaSemana={forzarProximaSemana}
            onNombreChange={setNombre}
            onTelefonoChange={setTelefono}
            onTelefonoBlur={alSalirDeTelefono}
            onDetallesChange={setDetalles}
            onDiaChange={setDiaEntrega}
            onSedeChange={setSedeId}
            onTipoEntregaChange={setTipoEntrega}
            onDireccionEntregaChange={setDireccionEntrega}
          />
        )}

        {esPasoResumen && (
          <PasoResumen
            comidas={comidasActivas}
            modo={modo}
            proteinas={proteinas}
            opcionesDesayuno={opcionesDesayuno}
            nombre={nombre}
            detalles={detalles}
            diaEntrega={diaEntrega}
            sede={sedes.find((s) => s.id === sedeId) ?? null}
            tipoEntrega={tipoEntrega}
            direccionEntrega={direccionEntrega}
            total={total}
            onEditarPaso={setPaso}
            extrasConfig={extrasConfig}
            platos={platos}
            carbohidratosFull={carbohidratosFull}
            vegetalesFull={vegetalesFull}
            forzarProximaSemana={forzarProximaSemana}
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-error font-sans" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Bottom navigation bar */}
      <div className="sticky bottom-0 bg-surface border-t border-outline-variant/40 px-4 py-4 flex items-center gap-3">
        {paso > 0 && !enviado && (
          <button
            type="button"
            onClick={atras}
            className="flex items-center gap-1 px-4 py-3 text-on-surface-variant font-sans text-sm font-semibold"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        )}
        {!esPasoResumen ? (
          <button
            type="button"
            onClick={siguiente}
            disabled={!puedeAvanzar()}
            className="flex-1 bg-primary text-on-primary py-3 rounded-2xl font-sans text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
          >
            {resumenVisitado ? "Back to summary" : "Next"}
          </button>
        ) : (
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || enviado}
            className="flex-1 bg-secondary text-on-secondary py-3 rounded-2xl font-sans text-sm font-semibold disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {enviando
              ? "Sending..."
              : enviado
                ? "Done! Check the WhatsApp tab"
                : "Send order via WhatsApp"}
          </button>
        )}
      </div>

      {mostrarAvisoCorte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-on-surface">
              <Clock size={20} className="text-secondary" />
              <h3 className="font-display text-lg font-semibold">
                Orders closed
              </h3>
            </div>
            <p className="font-sans text-sm text-on-surface-variant">
              The order deadline for this week has passed (Friday 6 PM Orlando time).
            </p>
            <p className="font-sans text-sm text-on-surface-variant">
              Would you like to schedule your order for <strong>next week</strong>?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setForzarProximaSemana(true);
                  setMostrarAvisoCorte(false);
                  const nuevoPaso = Math.min(paso + 1, totalPasos - 1);
                  setPaso(nuevoPaso);
                  if (nuevoPaso === totalPasos - 1) setResumenVisitado(true);
                }}
                className="flex-1 bg-primary text-on-primary py-3 rounded-2xl font-sans text-sm font-semibold active:scale-95 transition-all"
              >
                Schedule for next week
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarAvisoCorte(false);
                  window.location.href = "/pedido";
                }}
                className="flex-1 bg-surface-container-high text-on-surface py-3 rounded-2xl font-sans text-sm font-semibold active:scale-95 transition-all"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function PasoCantidad({
  cantidad,
  onCambiar,
}: {
  cantidad: number;
  onCambiar: (n: number) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          How many meals do you want?
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          Choose how many meals for this order.
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => onCambiar(cantidad - 1)}
          disabled={cantidad <= 1}
          className="w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
        >
          <Minus size={20} />
        </button>
        <span className="font-display text-4xl font-semibold text-primary w-16 text-center">
          {cantidad}
        </span>
        <button
          type="button"
          onClick={() => onCambiar(cantidad + 1)}
          className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}

function PasoModo({
  modo,
  onCambiar,
}: {
  modo: ModoPedido;
  onCambiar: (m: ModoPedido) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          How do you want your meals?
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          This applies to every meal in this order.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onCambiar("racion")}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${
            modo === "racion"
              ? "border-primary bg-primary/10"
              : "border-outline-variant bg-surface-container-lowest"
          }`}
        >
          <p className="font-sans font-semibold text-on-surface">By Portion</p>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Standard portion of protein, carb, and veggie.
          </p>
        </button>
        <button
          type="button"
          onClick={() => onCambiar("macro")}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${
            modo === "macro"
              ? "border-primary bg-primary/10"
              : "border-outline-variant bg-surface-container-lowest"
          }`}
        >
          <p className="font-sans font-semibold text-on-surface">Macro</p>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Adjustable protein amount for your macros.
          </p>
        </button>
      </div>
    </div>
  );
}

function PasoComida({
  numero,
  comida,
  modo,
  proteinas,
  carbohidratos,
  vegetales,
  carbohidratosFull = [],
  vegetalesFull = [],
  opcionesDesayuno,
  onCambiar,
  extrasConfig,
  platos = [],
}: {
  numero: number;
  comida: ComidaSlot;
  modo: ModoPedido;
  proteinas: OpcionMenu[];
  carbohidratos: string[];
  vegetales: string[];
  carbohidratosFull?: OpcionMenu[];
  vegetalesFull?: OpcionMenu[];
  opcionesDesayuno: OpcionMenu[];
  onCambiar: (cambios: Partial<ComidaSlot>) => void;
  extrasConfig?: ExtrasConfig;
  platos?: OpcionMenu[];
}) {
  const esDesayuno = comida.tipo === "desayuno";
  const sencillas = proteinas.filter((p) => p.nivel === "sencilla");
  const premium = proteinas.filter((p) => p.nivel === "premium");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Meal {numero}
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          Choose the meal type, then build your ingredients.
        </p>
      </div>

      <div>
        <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mb-3">
          Meal type
        </p>
        <div className="flex gap-2">
          <Chip
            label={modo === "macro" ? "Macro meal" : "Regular meal"}
            selected={comida.tipo === "regular"}
            onClick={() => onCambiar({ tipo: "regular", proteinaId: "" })}
          />
          {platos.length > 0 && (
            <Chip
              label="Plato"
              selected={comida.tipo === "plato"}
              onClick={() => onCambiar({ tipo: "plato", proteinaId: "" })}
            />
          )}
          <Chip
            label="Breakfast"
            selected={esDesayuno}
            onClick={() => onCambiar({ tipo: "desayuno", proteinaId: "" })}
          />
        </div>
      </div>

      {comida.tipo === "plato" ? (
        <>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="font-sans text-xs font-bold uppercase tracking-wide text-secondary">
                Choose your dish
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {platos.map((o) => {
                const precio = modo === "macro"
                  ? (Number(o.precio_macro_gramo) || 12)
                  : (Number(o.precio_racion) || 9);
                return (
                  <Chip
                    key={o.id}
                    label={`${o.nombre} — $${precio}`}
                    selected={comida.proteinaId === o.id}
                    onClick={() => onCambiar({ proteinaId: o.id })}
                  />
                );
              })}
            </div>
          </div>

          {modo === "macro" && (
            <div className="bg-surface-container-low rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-on-surface-variant uppercase">
                  Protein
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosProteina: Math.max(0, comida.gramosProteina - 5),
                      })
                    }
                    className="w-8 h-8 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center hover:bg-surface-container-highest active:scale-95 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-sans text-lg font-semibold text-on-surface w-16 text-center">
                    {comida.gramosProteina}
                    <span className="text-xs font-normal text-on-surface-variant ml-0.5">g</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosProteina: comida.gramosProteina + 5,
                      })
                    }
                    className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="h-px bg-outline-variant/50" />

              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-on-surface-variant uppercase">
                  Carb
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosCarbohidrato: Math.max(0, comida.gramosCarbohidrato - 5),
                      })
                    }
                    className="w-8 h-8 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center hover:bg-surface-container-highest active:scale-95 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-sans text-lg font-semibold text-on-surface w-16 text-center">
                    {comida.gramosCarbohidrato}
                    <span className="text-xs font-normal text-on-surface-variant ml-0.5">g</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosCarbohidrato: comida.gramosCarbohidrato + 5,
                      })
                    }
                    className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <ExtraToggle
            comida={comida}
            onCambiar={onCambiar}
            proteinas={proteinas}
            carbohidratosFull={carbohidratosFull}
            vegetalesFull={vegetalesFull}
            extrasConfig={extrasConfig}
          />
        </>
      ) : esDesayuno ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="font-sans text-xs font-bold uppercase tracking-wide text-secondary">
              Choose your breakfast
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {opcionesDesayuno.map((o) => (
              <Chip
                key={o.id}
                label={`${o.nombre} — $${Number(o.precio_racion) || 7}`}
                selected={comida.carbohidrato === o.nombre}
                onClick={() => onCambiar({ carbohidrato: o.nombre, proteinaId: o.nombre })}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-sans text-xs font-bold uppercase tracking-wide text-[#c2410c]">
                Protein · Standard
              </p>
              <span className="font-sans text-xs font-bold text-[#c2410c]">
                ${modo === "macro" ? (Number(sencillas[0]?.precio_macro_gramo) || PRECIOS_MACRO.sencilla) : (Number(sencillas[0]?.precio_racion) || 0)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {sencillas.map((p) => (
                <Chip
                  key={p.id}
                  label={p.nombre}
                  selected={comida.proteinaId === p.id}
                  onClick={() => onCambiar({ proteinaId: p.id })}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-sans text-xs font-bold uppercase tracking-wide text-green-600">
                Protein · Premium
              </p>
              <span className="font-sans text-xs font-bold text-green-600">
                ${modo === "macro" ? (Number(premium[0]?.precio_macro_gramo) || PRECIOS_MACRO.premium) : (Number(premium[0]?.precio_racion) || 0)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {premium.map((p) => (
                <Chip
                  key={p.id}
                  label={p.nombre}
                  selected={comida.proteinaId === p.id}
                  onClick={() => onCambiar({ proteinaId: p.id })}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-wide text-[#b45309] mb-3">
              Carb
            </p>
            <div className="flex flex-wrap gap-2">
              {carbohidratos.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={comida.carbohidrato === c}
                  onClick={() => onCambiar({ carbohidrato: c })}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-wide text-[#15803d] mb-3">
              Veggie (optional)
            </p>
            <div className="flex flex-wrap gap-2">
              {vegetales.map((v) => (
                <Chip
                  key={v}
                  label={v}
                  selected={comida.vegetal === v}
                  onClick={() =>
                    onCambiar({ vegetal: comida.vegetal === v ? "" : v })
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary">
            <Leaf size={18} className="shrink-0" />
            <p className="font-sans text-sm">
              Includes 1 protein, 1 carb, and 1 veggie.
            </p>
          </div>

          {modo === "macro" && (
            <div className="bg-surface-container-low rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-on-surface-variant uppercase">
                  Protein
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosProteina: Math.max(0, comida.gramosProteina - 5),
                      })
                    }
                    className="w-8 h-8 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center hover:bg-surface-container-highest active:scale-95 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-sans text-lg font-semibold text-on-surface w-16 text-center">
                    {comida.gramosProteina}
                    <span className="text-xs font-normal text-on-surface-variant ml-0.5">g</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosProteina: comida.gramosProteina + 5,
                      })
                    }
                    className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="h-px bg-outline-variant/50" />

              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold text-on-surface-variant uppercase">
                  Carb
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosCarbohidrato: Math.max(0, comida.gramosCarbohidrato - 5),
                      })
                    }
                    className="w-8 h-8 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center hover:bg-surface-container-highest active:scale-95 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-sans text-lg font-semibold text-on-surface w-16 text-center">
                    {comida.gramosCarbohidrato}
                    <span className="text-xs font-normal text-on-surface-variant ml-0.5">g</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onCambiar({
                        gramosCarbohidrato: comida.gramosCarbohidrato + 5,
                      })
                    }
                    className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <ExtraToggle
            comida={comida}
            onCambiar={onCambiar}
            proteinas={proteinas}
            carbohidratosFull={carbohidratosFull}
            vegetalesFull={vegetalesFull}
            extrasConfig={extrasConfig}
          />
        </>
      )}
    </div>
  );
}

function ExtraToggle({
  comida,
  onCambiar,
  proteinas,
  carbohidratosFull,
  vegetalesFull,
  extrasConfig,
}: {
  comida: ComidaSlot;
  onCambiar: (cambios: Partial<ComidaSlot>) => void;
  proteinas: OpcionMenu[];
  carbohidratosFull: OpcionMenu[];
  vegetalesFull: OpcionMenu[];
  extrasConfig?: ExtrasConfig;
}) {
  return (
    <div>
      <label className="flex items-center justify-between cursor-pointer mb-3">
        <span className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Add something extra?
        </span>
        <input
          type="checkbox"
          checked={comida.extraActivo}
          onChange={(e) =>
            onCambiar({ extraActivo: e.target.checked, extraValor: "" })
          }
          className="w-5 h-5 rounded text-secondary focus:ring-secondary"
        />
      </label>
      {comida.extraActivo && (
        <div className="space-y-3">
          <div>
            <p className="text-[11px] uppercase mb-1.5 text-[#c2410c] font-bold tracking-wide">
              Another protein
            </p>
            <div className="flex flex-wrap gap-2">
              {proteinas.filter((p) => !p.excluido_extra).map((p) => {
                const precio = p.extra_price_override ?? (p.nivel === "premium" ? (extrasConfig?.proteina_premium ?? 2) : (extrasConfig?.proteina_regular ?? 1));
                return (
                  <Chip
                    key={p.id}
                    label={`${p.nombre} (+ $${precio})`}
                    selected={comida.extraValor === p.nombre}
                    onClick={() => onCambiar({ extraValor: p.nombre })}
                  />
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase mb-1.5 text-green-600 font-bold tracking-wide">
              Another carb
            </p>
            <div className="flex flex-wrap gap-2">
              {carbohidratosFull.filter((c) => !c.excluido_extra).map((c) => {
                const precio = c.extra_price_override ?? (extrasConfig?.carbohidrato ?? 0.5);
                return (
                  <Chip
                    key={c.id}
                    label={`${c.nombre} (+ $${precio})`}
                    selected={comida.extraValor === c.nombre}
                    onClick={() => onCambiar({ extraValor: c.nombre })}
                  />
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase mb-1.5 text-teal-600 font-bold tracking-wide">
              Another veggie
            </p>
            <div className="flex flex-wrap gap-2">
              {vegetalesFull.filter((v) => !v.excluido_extra).map((v) => {
                const precio = v.extra_price_override ?? (extrasConfig?.vegetal ?? 0);
                const texto = precio === 0 ? `${v.nombre} (free)` : `${v.nombre} (+ $${precio})`;
                return (
                  <Chip
                    key={v.id}
                    label={texto}
                    selected={comida.extraValor === v.nombre}
                    onClick={() => onCambiar({ extraValor: v.nombre })}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PasoEntrega({
  nombre,
  telefono,
  detalles,
  diaEntrega,
  bienvenidaClienta,
  sedes,
  sedeId,
  tipoEntrega,
  direccionEntrega,
  forzarProximaSemana,
  onNombreChange,
  onTelefonoChange,
  onTelefonoBlur,
  onDetallesChange,
  onDiaChange,
  onSedeChange,
  onTipoEntregaChange,
  onDireccionEntregaChange,
}: {
  nombre: string;
  telefono: string;
  detalles: string;
  diaEntrega: DiaEntrega | "";
  bienvenidaClienta: string | null;
  sedes: SedeRetiro[];
  sedeId: string;
  tipoEntrega: TipoEntrega;
  direccionEntrega: string;
  forzarProximaSemana: boolean;
  onNombreChange: (v: string) => void;
  onTelefonoChange: (v: string) => void;
  onTelefonoBlur: () => void;
  onDetallesChange: (v: string) => void;
  onDiaChange: (v: DiaEntrega) => void;
  onSedeChange: (v: string) => void;
  onTipoEntregaChange: (v: TipoEntrega) => void;
  onDireccionEntregaChange: (v: string) => void;
}) {
  const telefonoInvalido =
    telefono.trim().length > 0 && !TELEFONO_US_REGEX.test(telefono.trim());
  const sedeElegida = sedes.find((s) => s.id === sedeId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          {tipoEntrega === "delivery" ? "Delivery details" : "Pickup details"}
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          We need these to coordinate your {tipoEntrega === "delivery" ? "delivery" : "pickup"}.
        </p>
      </div>

      {bienvenidaClienta && (
        <p className="text-sm font-sans text-primary bg-primary/10 rounded-xl px-4 py-3">
          Welcome back, {bienvenidaClienta}! We&apos;ve filled in your info.
        </p>
      )}

      <div className="flex gap-1 bg-surface-container rounded-xl p-1">
        <button
          type="button"
          onClick={() => onTipoEntregaChange("pickup")}
          className={`flex-1 py-2.5 px-3 rounded-lg font-sans text-sm font-semibold transition-colors ${
            tipoEntrega === "pickup"
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          Pickup
        </button>
        <button
          type="button"
          onClick={() => onTipoEntregaChange("delivery")}
          className={`flex-1 py-2.5 px-3 rounded-lg font-sans text-sm font-semibold transition-colors ${
            tipoEntrega === "delivery"
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          Delivery
        </button>
      </div>

      {tipoEntrega === "delivery" ? (
        <div className="space-y-2">
          <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
            Delivery address
          </label>
          <textarea
            value={direccionEntrega}
            onChange={(e) => onDireccionEntregaChange(e.target.value)}
            placeholder="123 Main St, Orlando, FL 32801"
            rows={2}
            className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans focus:ring-2 focus:ring-primary outline-none resize-none"
          />
          <p className="text-xs text-on-surface-variant font-sans">
            We currently only deliver within Florida.
          </p>
          {direccionEntrega.trim().length > 0 &&
            !esDireccionFloridaValida(direccionEntrega) && (
              <p className="text-xs text-error font-sans">
                Please enter a full Florida address with a valid FL zip code.
              </p>
            )}
        </div>
      ) : sedes.length > 1 ? (
        <div className="space-y-2">
          <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
            Pickup location
          </label>
          <div className="space-y-3">
            {sedes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSedeChange(s.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${
                  sedeId === s.id
                    ? "border-primary bg-primary/10"
                    : "border-outline-variant bg-surface-container-lowest"
                }`}
              >
                <p className="font-sans text-sm text-on-surface flex items-start gap-1.5">
                  <MapPin size={14} className="shrink-0 mt-0.5" />
                  {s.direccion}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        sedeElegida && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary">
            <MapPin size={18} className="shrink-0 mt-0.5" />
            <p className="font-sans text-sm font-semibold">
              {sedeElegida.direccion}
            </p>
          </div>
        )
      )}

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Phone
        </label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => onTelefonoChange(e.target.value)}
          onBlur={onTelefonoBlur}
          placeholder="(555) 123-4567"
          className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans focus:ring-2 focus:ring-primary outline-none"
        />
        {telefonoInvalido && (
          <p className="text-xs text-error font-sans">
            Please enter a valid US phone number.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Name
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
          placeholder="Your full name"
          className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Additional details (optional)
        </label>
        <textarea
          value={detalles}
          onChange={(e) => onDetallesChange(e.target.value)}
          placeholder={`Anything we should know about your ${tipoEntrega === "delivery" ? "delivery" : "pickup"}?`}
          rows={2}
          className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          {tipoEntrega === "delivery" ? "Delivery day" : "Pickup day"}
        </label>
        {forzarProximaSemana && (
          <p className="text-xs text-secondary font-sans font-semibold bg-secondary/10 rounded-lg px-3 py-1.5">
            Scheduling for next week
          </p>
        )}
        <div className="flex gap-3">
          <Chip
            label={etiquetaFecha(proximaFecha(0, forzarProximaSemana))}
            selected={diaEntrega === "domingo"}
            onClick={() => onDiaChange("domingo")}
          />
          <Chip
            label={etiquetaFecha(proximaFecha(1, forzarProximaSemana))}
            selected={diaEntrega === "lunes"}
            onClick={() => onDiaChange("lunes")}
          />
        </div>
      </div>
    </div>
  );
}

function PasoResumen({
  comidas,
  modo,
  proteinas,
  opcionesDesayuno,
  nombre,
  detalles,
  diaEntrega,
  sede,
  tipoEntrega,
  direccionEntrega,
  total,
  onEditarPaso,
  extrasConfig,
  platos = [],
  carbohidratosFull = [],
  vegetalesFull = [],
  forzarProximaSemana = false,
}: {
  comidas: ComidaSlot[];
  modo: ModoPedido;
  proteinas: OpcionMenu[];
  opcionesDesayuno: OpcionMenu[];
  nombre: string;
  detalles: string;
  diaEntrega: DiaEntrega | "";
  sede: SedeRetiro | null;
  tipoEntrega: TipoEntrega;
  direccionEntrega: string;
  total: number;
  onEditarPaso: (paso: number) => void;
  extrasConfig?: ExtrasConfig;
  platos?: OpcionMenu[];
  carbohidratosFull?: OpcionMenu[];
  vegetalesFull?: OpcionMenu[];
  forzarProximaSemana?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-on-surface">
          Your order summary
        </h2>
        <p className="text-on-surface-variant font-sans text-sm mt-1">
          Review everything before sending it via WhatsApp. Tap any card to
          edit it.
        </p>
      </div>

      <div className="space-y-3">
        {comidas.map((c, i) => {
          const proteina = proteinas.find((p) => p.id === c.proteinaId);
          const platoItem = platos?.find((p) => p.id === c.proteinaId);
          const precio = precioComida(c, modo, proteinas, opcionesDesayuno, extrasConfig, platos, carbohidratosFull, vegetalesFull);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onEditarPaso(i + 2)}
              className="w-full text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <p className="font-sans text-xs font-bold text-secondary uppercase mb-1 flex items-center gap-1.5">
                  Meal {i + 1} · {c.tipo === "desayuno" ? "Breakfast" : c.tipo === "plato" ? "Plato" : "Regular"}
                  <Pencil size={11} className="opacity-60" />
                </p>
                <p className="font-sans text-sm font-semibold text-primary shrink-0">
                  {formatearMoneda(precio)}
                </p>
              </div>
              <p className="font-sans text-sm text-on-surface">
                {c.tipo === "desayuno"
                  ? c.carbohidrato
                  : c.tipo === "plato"
                  ? platoItem?.nombre ?? ""
                  : `${proteina?.nombre} + ${c.carbohidrato}${c.vegetal ? ` + ${c.vegetal}` : ""}`}
                {c.extraActivo && c.extraValor ? ` + ${c.extraValor}` : ""}
                {modo === "macro" && c.tipo !== "desayuno"
                  ? ` (${c.gramosProteina}g / ${c.gramosCarbohidrato}g)`
                  : ""}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center px-4 py-3 bg-primary/10 rounded-xl">
        <span className="font-sans text-sm font-semibold text-primary">
          Estimated total
        </span>
        <span className="font-display text-xl font-semibold text-primary">
          {formatearMoneda(total)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onEditarPaso(comidas.length + 2)}
        className="w-full text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-primary transition-colors"
      >
        <p className="font-sans text-xs font-bold text-secondary uppercase mb-1 flex items-center gap-1.5">
          {tipoEntrega === "delivery" ? "Delivery" : "Pickup"}
          <Pencil size={11} className="opacity-60" />
        </p>
        <p className="font-sans text-sm text-on-surface">{nombre}</p>
        {tipoEntrega === "delivery" ? (
          direccionEntrega && (
            <p className="font-sans text-sm text-on-surface-variant">
              {direccionEntrega}
            </p>
          )
        ) : (
          sede && (
            <p className="font-sans text-sm text-on-surface-variant">
              {sede.direccion}
            </p>
          )
        )}
        {detalles && (
          <p className="font-sans text-sm text-on-surface-variant italic">
            {detalles}
          </p>
        )}
        <p className="font-sans text-sm text-on-surface-variant">
          {diaEntrega &&
            etiquetaFecha(proximaFecha(diaEntrega === "domingo" ? 0 : 1, forzarProximaSemana))}
        </p>
      </button>
    </div>
  );
}

function IntroScreen({ onComenzar }: { onComenzar: () => void }) {
  return (
    <main className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/55 to-primary/85" />

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-16 max-w-lg mx-auto text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-white flex items-center justify-center mb-6 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="JJ Healthy Food" className="w-16 h-16 object-contain" />
        </div>

        <p className="text-secondary-container font-sans text-xs font-bold uppercase tracking-widest mb-3">
          JJ Healthy Food
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-white text-balance mb-4">
          Build your healthy meal week in minutes
        </h1>
        <p className="font-sans text-white/80 text-base mb-10">
          We save you time and effort: pick your meals, choose a pickup day,
          and swing by to grab your order.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <span className="font-sans text-xs text-white/70">Fast</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
              <Leaf className="text-white" size={20} />
            </div>
            <span className="font-sans text-xs text-white/70">Healthy</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
              <Store className="text-white" size={20} />
            </div>
            <span className="font-sans text-xs text-white/70">
              Easy pickup
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onComenzar}
          className="bg-secondary text-on-secondary py-4 rounded-2xl font-sans text-sm font-semibold active:scale-95 transition-all"
        >
          Start my order
        </button>
      </div>
    </main>
  );
}
