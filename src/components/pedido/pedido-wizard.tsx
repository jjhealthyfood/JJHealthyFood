"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  ChevronLeft,
  Clock,
  Leaf,
  Minus,
  Plus,
  Pencil,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Chip } from "./chip";
import {
  buscarClientaPorTelefono,
  enviarPedido,
  validarCodigoDescuentoAction,
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
  extras: string[];
  comentario: string;
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
  extras: [],
  comentario: "",
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
  if (slot.extraActivo && slot.extras && slot.extras.length > 0) {
    extra = slot.extras.reduce(
      (suma, nombre) => suma + precioExtraDeItem(nombre, proteinas, carbohidratosFull, vegetalesFull, extrasConfig),
      0
    );
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

function faseTexto(paso: number, cantidad: number) {
  if (paso === 0) return "Step 1 of 4 · Order setup";
  if (paso <= cantidad) return `Step 2 of 4 · Meal ${paso} of ${cantidad}`;
  if (paso === cantidad + 1) return "Step 3 of 4 · Pickup & Delivery";
  return "Step 4 of 4 · Summary & Checkout";
}

function porcentajeProgreso(paso: number, cantidad: number) {
  if (paso === 0) return 25;
  if (paso <= cantidad) return 25 + Math.round((paso / Math.max(1, cantidad)) * 25);
  if (paso === cantidad + 1) return 75;
  return 100;
}

function descripcionCorta(
  slot: ComidaSlot,
  proteinas: OpcionMenu[],
  platos: OpcionMenu[]
): string {
  if (slot.tipo === "desayuno") return slot.carbohidrato || "—";
  if (slot.tipo === "plato") {
    const plato = platos.find((p) => p.id === slot.proteinaId);
    return plato?.nombre ?? "—";
  }
  const proteina = proteinas.find((p) => p.id === slot.proteinaId);
  if (!proteina) return "—";
  return `${proteina.nombre}${slot.carbohidrato ? ` + ${slot.carbohidrato}` : ""}`;
}

function ResumenParcial({
  comidas,
  proteinas,
  platos,
  onEditar,
}: {
  comidas: ComidaSlot[];
  proteinas: OpcionMenu[];
  platos: OpcionMenu[];
  onEditar: (indice: number) => void;
}) {
  const [expandido, setExpandido] = useState(false);

  if (comidas.length === 0) return null;

  return (
    <div className="mb-6 bg-surface-container-low rounded-2xl border border-outline-variant overflow-hidden">
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 font-sans text-sm font-semibold text-on-surface"
      >
        <span>
          Your meals so far ({comidas.length})
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${expandido ? "rotate-180" : ""}`}
        />
      </button>
      {expandido && (
        <div className="px-2 pb-2 space-y-1">
          {comidas.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onEditar(i)}
              className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-surface-container-high transition-colors flex items-start gap-2"
            >
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs text-on-surface truncate">
                  {descripcionCorta(c, proteinas, platos)}
                  {c.extraActivo && c.extras && c.extras.length > 0 ? ` + ${c.extras.join(", ")}` : ""}
                </span>
                {c.comentario && (
                  <span className="block text-[11px] text-on-surface-variant italic truncate">
                    Note: {c.comentario}
                  </span>
                )}
              </span>
              <Pencil size={11} className="opacity-50 shrink-0 mt-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
  const [paso, setPaso] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [modo, setModo] = useState<ModoPedido>("racion");
  const [comidas, setComidas] = useState<ComidaSlot[]>([
    { ...comidaVacia },
  ]);
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
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [resumenVisitado, setResumenVisitado] = useState(false);
  const [mostrarAvisoCorte, setMostrarAvisoCorte] = useState(false);
  const [mostrarAvisoDuplicado, setMostrarAvisoDuplicado] = useState(false);
  const [avisoLimite, setAvisoLimite] = useState<{ whatsappUrl: string } | null>(null);
  const [forzarProximaSemana, setForzarProximaSemana] = useState(false);
  const [mostrarModalDescuento, setMostrarModalDescuento] = useState(false);
  const [modalDescuentoVisto, setModalDescuentoVisto] = useState(false);
  const [codigoDescuento, setCodigoDescuento] = useState("");
  const [descuentoPct, setDescuentoPct] = useState(0);
  const [errorCodigo, setErrorCodigo] = useState("");
  const [validandoCodigo, setValidandoCodigo] = useState(false);

  const totalPasos = cantidad + 3; // 0: setup, 1..N: comidas, N+1: entrega, N+2: resumen
  const esPasoSetup = paso === 0;
  const esPasoComida = paso >= 1 && paso <= cantidad;
  const esPasoEntrega = paso === cantidad + 1;
  const esPasoResumen = paso === cantidad + 2;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [paso]);

  function mostrarModalDescuentoSiCorresponde() {
    if (!modalDescuentoVisto) {
      setMostrarModalDescuento(true);
      setModalDescuentoVisto(true);
    }
  }

  function aplicarCodigoDescuento() {
    const codigo = codigoDescuento.trim();
    if (!codigo) {
      setMostrarModalDescuento(false);
      return;
    }
    setErrorCodigo("");
    setValidandoCodigo(true);
    validarCodigoDescuentoAction(codigo).then((pct) => {
      setValidandoCodigo(false);
      if (pct > 0) {
        setDescuentoPct(pct);
        setMostrarModalDescuento(false);
      } else {
        setErrorCodigo("That code isn't valid.");
      }
    });
  }

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
    if (esPasoSetup) return true;
    if (esPasoComida) {
      const c = comidas[paso - 1];
      if (!c) return false;
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
      mostrarModalDescuentoSiCorresponde();
      return;
    }
    const nuevoPaso = Math.min(paso + 1, totalPasos - 1);

    if (!forzarProximaSemana && nuevoPaso === cantidad + 1 && !estaAntesDelCorte()) {
      setMostrarAvisoCorte(true);
      return;
    }

    setPaso(nuevoPaso);
    if (nuevoPaso === totalPasos - 1) {
      setResumenVisitado(true);
      mostrarModalDescuentoSiCorresponde();
    }
  }

  function atras() {
    setPaso((p) => Math.max(p - 1, 0));
  }

  const comidasActivas = comidas.slice(0, cantidad);
  const subtotal = comidasActivas.reduce(
    (suma, c) => suma + precioComida(c, modo, proteinas, opcionesDesayuno, extrasConfig, platos, carbohidratosFull, vegetalesFull),
    0
  );
  const total = subtotal - (subtotal * descuentoPct) / 100;

  function enviar(confirmarDuplicado = false) {
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

    const fechaEntregaReal = proximaFecha(
      diaEntrega === "domingo" ? 0 : 1,
      forzarProximaSemana
    );
    const fechaEntregaIso = `${fechaEntregaReal.getFullYear()}-${String(fechaEntregaReal.getMonth() + 1).padStart(2, "0")}-${String(fechaEntregaReal.getDate()).padStart(2, "0")}`;

    const datosEntrega: DatosEntrega = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      detalles: detalles.trim(),
      dia_entrega: diaEntrega,
      fecha_entrega: fechaEntregaIso,
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
          extra: c.extraActivo && c.extras && c.extras.length > 0 ? c.extras.join(", ") : null,
          gramos_proteina:
            modo === "macro" && c.tipo !== "desayuno" ? c.gramosProteina : null,
          gramos_carbohidrato:
            modo === "macro" && c.tipo !== "desayuno" ? c.gramosCarbohidrato : null,
          precio: precioComida(c, modo, proteinas, opcionesDesayuno, extrasConfig, platos, carbohidratosFull, vegetalesFull),
          es_desayuno: c.tipo === "desayuno",
          comentario: c.comentario.trim() || null,
        };
      }
    );

    startTransition(async () => {
      const resultado = await enviarPedido(
        datosEntrega,
        modo,
        comidasSeleccionadas,
        confirmarDuplicado,
        descuentoPct > 0 ? codigoDescuento.trim() : ""
      );
      if (resultado.success) {
        setEnviado(true);
        setWhatsappUrl(resultado.whatsappUrl ?? "");
        if (ventana) {
          ventana.location.href = resultado.whatsappUrl;
        } else {
          window.location.href = resultado.whatsappUrl;
        }
      } else if (resultado.esDuplicado) {
        ventana?.close();
        setMostrarAvisoDuplicado(true);
      } else if (resultado.esLimiteAlcanzado) {
        ventana?.close();
        setAvisoLimite({ whatsappUrl: resultado.whatsappSolicitudUrl ?? "" });
      } else {
        ventana?.close();
        setError(resultado.error);
      }
    });
  }

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#17330A] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b-[1.5px] border-[#E6E2C8] sticky top-0 z-30">
        <div className="max-w-[480px] mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/brand/jj-meals-mark.png"
              alt="JJ Meals"
              width={48}
              height={48}
              className="h-10 w-10 object-contain sm:h-11 sm:w-11"
              priority
            />
            <div>
              <div className="font-poppins font-extrabold text-[18px] text-[#2F6E00] leading-tight group-hover:text-[#17330A] transition-colors">
                JJ Meals
              </div>
              <div className="text-[11px] font-bold tracking-[0.12em] text-[#4A5A3C] leading-none mt-0.5">
                BUILD YOUR ORDER
              </div>
            </div>
          </Link>

          <span className="inline-flex items-center min-h-[36px] px-3 rounded-full bg-white border-[1.5px] border-[#CFCBA8] text-[#17330A] text-xs font-semibold">
            <b className="text-[#2F6E00]">EN</b>&nbsp;·&nbsp;ES
          </span>
        </div>
      </header>

      {/* Progress */}
      {!enviado && (
        <div className="max-w-[480px] w-full mx-auto px-5 pt-5 pb-1">
          <div className="font-sans text-sm font-medium text-[#17330A] mb-2">
            {faseTexto(paso, cantidad)}
          </div>
          <div className="h-2 rounded-full bg-[#EDE9CF] overflow-hidden">
            <div
              className="h-full bg-[#2F6E00] rounded-full transition-all duration-300"
              style={{ width: `${porcentajeProgreso(paso, cantidad)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 max-w-[480px] w-full mx-auto px-5 py-2">
        {esPasoSetup && (
          <PasoSetup
            cantidad={cantidad}
            modo={modo}
            onCambiarCantidad={cambiarCantidad}
            onCambiarModo={cambiarModo}
          />
        )}

        {esPasoComida && (
          <ResumenParcial
            comidas={comidas.slice(0, paso - 1)}
            proteinas={proteinas}
            platos={platos}
            onEditar={(i) => setPaso(i + 1)}
          />
        )}

        {esPasoComida && (
          <PasoComida
            numero={paso}
            comida={comidas[paso - 1]}
            modo={modo}
            proteinas={proteinas}
            carbohidratos={carbohidratos}
            vegetales={vegetales}
            carbohidratosFull={carbohidratosFull}
            vegetalesFull={vegetalesFull}
            opcionesDesayuno={opcionesDesayuno}
            onCambiar={(cambios) => actualizarComida(paso - 1, cambios)}
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
            diaEntrega={diaEntrega}
            sede={sedes.find((s) => s.id === sedeId) ?? null}
            tipoEntrega={tipoEntrega}
            direccionEntrega={direccionEntrega}
            subtotal={subtotal}
            descuentoPct={descuentoPct}
            total={total}
            onEditarPaso={setPaso}
            onCambiarCodigo={() => setMostrarModalDescuento(true)}
            extrasConfig={extrasConfig}
            platos={platos}
            carbohidratosFull={carbohidratosFull}
            vegetalesFull={vegetalesFull}
            forzarProximaSemana={forzarProximaSemana}
          />
        )}

        {enviado && (
          <PasoConfirmacion
            comidas={comidasActivas}
            modo={modo}
            nombre={nombre}
            telefono={telefono}
            detalles={detalles}
            diaEntrega={diaEntrega}
            sede={sedes.find((s) => s.id === sedeId) ?? null}
            tipoEntrega={tipoEntrega}
            direccionEntrega={direccionEntrega}
            total={total}
            whatsappUrl={whatsappUrl}
            onStartNewOrder={() => {
              setEnviado(false);
              setWhatsappUrl("");
              setPaso(0);
              window.location.href = "/pedido";
            }}
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-error font-sans" role="alert">
            {error}
          </p>
        )}
      </div>

      {!enviado && (
        <>
          {/* Bottom navigation bar */}
          <div className="sticky bottom-0 bg-white border-t-[1.5px] border-[#E6E2C8] px-5 py-3.5 z-30 shadow-xs">
        <div className="max-w-[480px] mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-bold tracking-[0.06em] text-[#4A5A3C]">
              ORDER TOTAL
            </span>
            <span className="font-poppins font-extrabold text-xl text-[#17330A]">
              {formatearMoneda(total)}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            {paso > 0 && !enviado && (
              <button
                type="button"
                onClick={atras}
                className="min-h-[48px] px-3 text-[#4A5A3C] hover:text-[#17330A] font-medium text-sm flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
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
                className="flex-1 max-w-[200px] min-h-[52px] rounded-full bg-[#FDC305] hover:bg-[#FFD43B] text-[#17330A] font-poppins font-bold text-[17px] flex items-center justify-center transition-all active:scale-95 shadow-2xs disabled:bg-[#D9D5B8] disabled:text-[#3F4635] disabled:cursor-not-allowed cursor-pointer"
              >
                {resumenVisitado ? "Summary" : "Next"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => enviar()}
                disabled={enviando || enviado}
                className="flex-1 max-w-[240px] min-h-[52px] rounded-full bg-[#FDC305] hover:bg-[#FFD43B] text-[#17330A] font-poppins font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xs disabled:bg-[#D9D5B8] disabled:text-[#3F4635] disabled:cursor-not-allowed cursor-pointer"
              >
                Send via WhatsApp
              </button>
            )}
          </div>
        </div>
          </div>
        </>
      )}

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

      {mostrarAvisoDuplicado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-on-surface">
              <AlertTriangle size={20} className="text-secondary" />
              <h3 className="font-display text-lg font-semibold">
                Possible duplicate order
              </h3>
            </div>
            <p className="font-sans text-sm text-on-surface-variant">
              You already have an order with these exact same meals for this
              day that hasn&apos;t been delivered yet. Did you mean to send
              it again?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMostrarAvisoDuplicado(false);
                  enviar(true);
                }}
                className="flex-1 bg-primary text-on-primary py-3 rounded-2xl font-sans text-sm font-semibold active:scale-95 transition-all"
              >
                Send anyway
              </button>
              <button
                type="button"
                onClick={() => setMostrarAvisoDuplicado(false)}
                className="flex-1 bg-surface-container-high text-on-surface py-3 rounded-2xl font-sans text-sm font-semibold active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {avisoLimite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-on-surface">
              <AlertTriangle size={20} className="text-secondary" />
              <h3 className="font-display text-lg font-semibold">
                We&apos;re full for this weekend
              </h3>
            </div>
            <p className="font-sans text-sm text-on-surface-variant">
              We&apos;ve reached our meal capacity for this delivery weekend.
              Message us on WhatsApp and we&apos;ll let you know if we can
              make room for your order.
            </p>
            <p className="font-sans text-xs text-on-surface-variant bg-surface-container-high rounded-xl px-3 py-2">
              Don&apos;t close or reload this page while you wait — your
              meals are still saved here, so once we confirm you can just
              tap send again.
            </p>
            <div className="flex gap-3">
              <a
                href={avisoLimite.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAvisoLimite(null)}
                className="flex-1 text-center bg-primary text-on-primary py-3 rounded-2xl font-sans text-sm font-semibold active:scale-95 transition-all"
              >
                Message us
              </a>
              <button
                type="button"
                onClick={() => setAvisoLimite(null)}
                className="flex-1 bg-surface-container-high text-on-surface py-3 rounded-2xl font-sans text-sm font-semibold active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalDescuento && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#17330A]/55 px-4 pb-4">
          <div className="w-full max-w-[390px] rounded-t-[24px] bg-white p-[12px_20px_28px] shadow-xl">
            <div className="w-[44px] h-[5px] rounded-[999px] bg-[#CFCBA8] mx-auto mb-16" />
            <h2 className="font-display text-[22px] font-extrabold text-[#17330A] mb-6 text-center">
              Discount code
            </h2>
            <div className="lbl text-center">ENTER YOUR CODE</div>
            <input
              type="text"
              value={codigoDescuento}
              onChange={(e) => {
                setCodigoDescuento(e.target.value);
                setErrorCodigo("");
              }}
              onKeyDown={(e) => e.key === "Enter" && aplicarCodigoDescuento()}
              placeholder="e.g. [CÓDIGO]"
              className="w-full min-h-[48px] px-0 py-0 bg-transparent border-none text-[#5B6150] text-[15px] outline-none placeholder:text-[#5B6150] text-center"
            />
            {errorCodigo && (
              <p className="text-xs text-error font-sans mt-2 text-center">
                {errorCodigo}
              </p>
            )}
            <button
              type="button"
              onClick={aplicarCodigoDescuento}
              disabled={validandoCodigo || !codigoDescuento.trim()}
              className="w-full min-h-[52px] rounded-[999px] bg-[#FDC305] hover:bg-[#FFD43B] text-[#17330A] font-poppins font-bold text-[17px] flex items-center justify-center mt-4 transition-all active:scale-95 disabled:bg-[#D9D5B8] disabled:text-[#3F4635] disabled:cursor-not-allowed cursor-pointer"
            >
              {validandoCodigo ? "Checking..." : "Apply code"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarModalDescuento(false)}
              className="w-full text-center mt-[12px] min-h-[44px] font-medium text-[#17330A] flex items-center justify-center cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function PasoSetup({
  cantidad,
  modo,
  onCambiarCantidad,
  onCambiarModo,
}: {
  cantidad: number;
  modo: ModoPedido;
  onCambiarCantidad: (n: number) => void;
  onCambiarModo: (m: ModoPedido) => void;
}) {
  return (
    <div className="pb-8 animate-in fade-in duration-200">
      <h2 className="font-poppins text-[30px] font-extrabold text-[#17330A] mt-4 sm:mt-6 tracking-tight leading-tight">
        Build your order
      </h2>

      {/* Meals count */}
      <div className="text-xs font-bold tracking-[0.08em] text-[#4A5A3C] uppercase mt-7 mb-2">
        HOW MANY MEALS DO YOU WANT?
      </div>
      <div className="flex items-center justify-center gap-8 my-3">
        <button
          type="button"
          onClick={() => onCambiarCantidad(cantidad - 1)}
          disabled={cantidad <= 1}
          aria-label="Decrease meals"
          className="w-14 h-14 rounded-full border-[1.5px] border-[#CFCBA8] bg-white flex items-center justify-center text-[28px] text-[#17330A] disabled:opacity-30 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed shadow-2xs select-none"
        >
          −
        </button>
        <span className="font-poppins font-extrabold text-[56px] text-[#2F6E00] w-20 text-center select-none leading-none">
          {cantidad}
        </span>
        <button
          type="button"
          onClick={() => onCambiarCantidad(cantidad + 1)}
          aria-label="Increase meals"
          className="w-14 h-14 rounded-full bg-[#2F6E00] text-white flex items-center justify-center text-[28px] hover:bg-[#255700] active:scale-95 transition-all cursor-pointer shadow-xs select-none"
        >
          +
        </button>
      </div>

      {/* How do you want your meals */}
      <div className="text-xs font-bold tracking-[0.08em] text-[#4A5A3C] uppercase mt-7 mb-1">
        HOW DO YOU WANT YOUR MEALS?
      </div>
      <p className="font-sans text-sm text-[#17330A]/80 m-0 mb-3 leading-relaxed">
        This applies to every meal in this order.
      </p>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => onCambiarModo("racion")}
          className={`w-full text-left p-4 rounded-[16px] transition-all cursor-pointer flex items-center justify-between ${
            modo === "racion"
              ? "border-2 border-[#2F6E00] bg-[#EAF4DC]"
              : "border-[1.5px] border-[#CFCBA8] bg-white hover:border-[#2F6E00]/60"
          }`}
        >
          <div>
            <div className="font-sans font-bold text-[17px] text-[#17330A]">
              By Portion
            </div>
            <div className="text-sm text-[#4A5A3C] mt-1">
              Standard portion of protein, carb, and veggie.
            </div>
          </div>
          {modo === "racion" && (
            <span className="text-[#2F6E00] font-extrabold text-xl ml-3">✓</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onCambiarModo("macro")}
          className={`w-full text-left p-4 rounded-[16px] transition-all cursor-pointer flex items-center justify-between ${
            modo === "macro"
              ? "border-2 border-[#2F6E00] bg-[#EAF4DC]"
              : "border-[1.5px] border-[#CFCBA8] bg-white hover:border-[#2F6E00]/60"
          }`}
        >
          <div>
            <div className="font-sans font-bold text-[17px] text-[#17330A]">
              Macro
            </div>
            <div className="text-sm text-[#4A5A3C] mt-1">
              Adjustable protein amount for your macros.
            </div>
          </div>
          {modo === "macro" && (
            <span className="text-[#2F6E00] font-extrabold text-xl ml-3">✓</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onCambiarModo("keto")}
          className={`w-full text-left p-4 rounded-[16px] transition-all cursor-pointer flex items-center justify-between ${
            modo === "keto"
              ? "border-2 border-[#2F6E00] bg-[#EAF4DC]"
              : "border-[1.5px] border-[#CFCBA8] bg-white hover:border-[#2F6E00]/60"
          }`}
        >
          <div>
            <div className="font-sans font-bold text-[17px] text-[#17330A]">
              Keto
            </div>
            <div className="text-sm text-[#4A5A3C] mt-1">
              Low-carb protein and keto-friendly meals.
            </div>
          </div>
          {modo === "keto" && (
            <span className="text-[#2F6E00] font-extrabold text-xl ml-3">✓</span>
          )}
        </button>
      </div>

      {/* Note */}
      <div className="mt-5 p-4 rounded-[16px] bg-[#EAF4DC] text-[#17330A] text-[15px] font-medium leading-relaxed border border-[#CFCBA8]/40">
        Orders open Tuesday through Friday 6pm for that week.
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
  const platosFiltrados = modo === "keto"
    ? (platos ?? []).filter((o) => o.es_keto)
    : platos;
  const sencillas = modo === "keto"
    ? proteinas.filter((p) => p.es_keto && p.nivel === "sencilla")
    : proteinas.filter((p) => p.nivel === "sencilla");
  const premium = modo === "keto"
    ? proteinas.filter((p) => p.es_keto && p.nivel === "premium")
    : proteinas.filter((p) => p.nivel === "premium");

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
              {platosFiltrados.map((o) => {
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

      <div className="space-y-2">
        <label className="font-sans text-xs font-bold text-on-surface-variant uppercase">
          Notes for this meal (optional)
        </label>
        <textarea
          value={comida.comentario}
          onChange={(e) => onCambiar({ comentario: e.target.value })}
          placeholder="e.g., no onions, sauce on the side..."
          rows={2}
          className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-sans text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      </div>
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
  const extrasActuales = comida.extras ?? [];

  function toggleExtra(nombre: string) {
    const yaExiste = extrasActuales.includes(nombre);
    const nuevos = yaExiste
      ? extrasActuales.filter((e) => e !== nombre)
      : [...extrasActuales, nombre];
    onCambiar({ extras: nuevos });
  }

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
            onCambiar({ extraActivo: e.target.checked, extras: [] })
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
                    selected={extrasActuales.includes(p.nombre)}
                    onClick={() => toggleExtra(p.nombre)}
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
                    selected={extrasActuales.includes(c.nombre)}
                    onClick={() => toggleExtra(c.nombre)}
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
                    selected={extrasActuales.includes(v.nombre)}
                    onClick={() => toggleExtra(v.nombre)}
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
  const lblTitulo = tipoEntrega === "delivery" ? "DELIVERY ADDRESS" : "PICKUP LOCATION";
  const lblDia = tipoEntrega === "delivery" ? "DELIVERY DAY" : "PICKUP DAY";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-[30px] font-extrabold text-[#17330A] mt-4 leading-tight">
          {tipoEntrega === "delivery" ? "Delivery details" : "Pickup details"}
        </h2>
        <p className="sub">
          We need these to coordinate your {tipoEntrega === "delivery" ? "delivery" : "pickup"}.
        </p>
      </div>

      {bienvenidaClienta && (
        <p className="text-sm font-sans text-primary bg-primary/10 rounded-xl px-4 py-3">
          Welcome back, {bienvenidaClienta}! We&apos;ve filled in your info.
        </p>
      )}

      <div className="mt-4 flex gap-[4px] rounded-[999px] bg-[#EDE9CF] p-[4px]">
        <button
          type="button"
          onClick={() => onTipoEntregaChange("pickup")}
          className={`flex-1 min-h-[44px] rounded-[999px] text-[15px] font-medium transition-colors ${
            tipoEntrega === "pickup"
              ? "bg-[#2F6E00] text-white"
              : "bg-transparent text-[#17330A]"
          }`}
        >
          Pickup
        </button>
        <button
          type="button"
          onClick={() => onTipoEntregaChange("delivery")}
          className={`flex-1 min-h-[44px] rounded-[999px] text-[15px] font-medium transition-colors ${
            tipoEntrega === "delivery"
              ? "bg-[#2F6E00] text-white"
              : "bg-transparent text-[#17330A] font-medium"
          }`}
        >
          Delivery
        </button>
      </div>

      <div className="mt-4 rounded-[16px] bg-[#EAF4DC] p-[14px_16px] text-[15px]">
        Orders open Tuesday through Friday 6pm for that week.
      </div>

      <div className="lbl">{
        lblTitulo
      }</div>

      {tipoEntrega === "delivery" ? (
        <div className="space-y-2">
          <div
            className="in mt-[8px]"
          >
            <input
              type="text"
              value={direccionEntrega}
              onChange={(e) => onDireccionEntregaChange(e.target.value)}
              placeholder="Street address"
              className="w-full h-full px-0 bg-transparent border-none text-[#5B6150] text-[15px] outline-none placeholder:text-[#5B6150]"
            />
          </div>
          <div
            className="in"
          >
            <input
              type="text"
              placeholder="Apt / unit (optional)"
              className="w-full h-full px-0 bg-transparent border-none text-[#5B6150] text-[15px] outline-none placeholder:text-[#5B6150]"
            />
          </div>
          <div className="note mt-4 p-[14px_16px] bg-[#EAF4DC] text-[15px]">
            [TARIFA O ZONA DE ENTREGA]
          </div>
        </div>
      ) : sedes.length > 1 ? (
        <div className="space-y-3">
          {sedes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSedeChange(s.id)}
              className={`opt flex items-center gap-12 min-h-[56px] px-4 py-[10px_14px] rounded-[16px] border-[1.5px] text-[15px] transition-colors ${
                sedeId === s.id
                  ? "border-[#2F6E00] bg-[#EAF4DC]"
                  : "border-[#CFCBA8] bg-white hover:border-[#2F6E00]/60"
              }`}
            >
              <div className="th flex-none w-[56px] h-[56px] rounded-[12px] bg-[#FFF1B8]" />
              <div className="flex-1">
                <div className="font-bold">{s.direccion}</div>
              </div>
              {sedeId === s.id && <span className="text-[#2F6E00] font-extrabold">✓</span>}
            </button>
          ))}
        </div>
      ) : (
        sedeElegida && (
          <div className="opt flex items-center gap-12 min-h-[56px] px-4 py-[10px_14px] rounded-[16px] border-[1.5px] border-[#2F6E00] bg-[#EAF4DC] text-[15px]">
            <div className="th flex-none w-[56px] h-[56px] rounded-[12px] bg-[#FFF1B8]" />
            <div className="flex-1">
              <div className="font-bold">{sedeElegida.direccion}</div>
            </div>
            <span className="text-[#2F6E00] font-extrabold">✓</span>
          </div>
        )
      )}

      <div className="lbl mt-[20px]">PHONE</div>
      <div className="in relative">
        <input
          type="tel"
          value={telefono}
          onChange={(e) => onTelefonoChange(e.target.value)}
          onBlur={onTelefonoBlur}
          placeholder="(555) 123-4567"
          className="w-full h-full px-0 py-0 bg-transparent border-none text-[#5B6150] text-[15px] outline-none placeholder:text-[#5B6150]"
        />
        {telefonoInvalido && (
          <p className="text-xs text-error font-sans mt-2">
            Please enter a valid US phone number.
          </p>
        )}
      </div>

      <div className="lbl mt-[20px]">NAME</div>
      <div className="in">
        <input
          type="text"
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
          placeholder="Your full name"
          className="w-full h-full px-0 py-0 bg-transparent border-none text-[#5B6150] text-[15px] outline-none placeholder:text-[#5B6150]"
        />
      </div>

      <div className="lbl mt-[20px]">ADDITIONAL DETAILS (OPTIONAL)</div>
      <div
        className="in min-h-[72px] mt-[8px] align-[flex-start] pt-[12px] relative"
      >
        <textarea
          value={detalles}
          onChange={(e) => onDetallesChange(e.target.value)}
          placeholder={`Anything we should know about your ${tipoEntrega === "delivery" ? "delivery" : "pickup"}?`}
          rows={2}
          className="w-full h-full px-0 py-0 bg-transparent border-none text-[#5B6150] text-[15px] outline-none resize-none placeholder:text-[#5B6150]"
        />
      </div>

      <div className="lbl mt-[20px]">{lblDia}</div>
      {forzarProximaSemana && (
        <p className="text-[12px] font-bold text-secondary bg-secondary/10 rounded-lg px-3 py-[1.5px] mt-[8px]">
          Scheduling for next week
        </p>
      )}
      <div className="row mt-[8px] flex gap-8 flex-wrap">
        <Chip
          label={etiquetaFecha(proximaFecha(0, forzarProximaSemana))}
          selected={diaEntrega === "domingo"}
          onClick={() => onDiaChange("domingo")}
          classNameOverride={`${
            diaEntrega === "domingo"
              ? "bg-[#2F6E00] border-[#2F6E00] text-white font-bold"
              : "bg-white border-[#CFCBA8] text-[#17330A] font-medium"
          }`}
        />
        <Chip
          label={etiquetaFecha(proximaFecha(1, forzarProximaSemana))}
          selected={diaEntrega === "lunes"}
          onClick={() => onDiaChange("lunes")}
          classNameOverride={`${
            diaEntrega === "lunes"
              ? "bg-[#2F6E00] border-[#2F6E00] text-white font-bold"
              : "bg-white border-[#CFCBA8] text-[#17330A] font-medium"
          }`}
        />
      </div>

      <div className="chk mt-[24px] flex items-center justify-between">
        <span className="font-bold text-[13px] tracking-[0.06em] text-[#17330A]">
          REMEMBER MY DETAILS FOR NEXT TIME
        </span>
        <div className="box w-[28px] h-[28px] rounded-[8px] border-[2px] border-[#17330A] bg-white flex items-center justify-center" />
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
  diaEntrega,
  sede,
  tipoEntrega,
  direccionEntrega,
  subtotal,
  descuentoPct,
  total,
  onEditarPaso,
  onCambiarCodigo,
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
  diaEntrega: DiaEntrega | "";
  sede: SedeRetiro | null;
  tipoEntrega: TipoEntrega;
  direccionEntrega: string;
  subtotal: number;
  descuentoPct: number;
  total: number;
  onEditarPaso: (paso: number) => void;
  onCambiarCodigo: () => void;
  extrasConfig?: ExtrasConfig;
  platos?: OpcionMenu[];
  carbohidratosFull?: OpcionMenu[];
  vegetalesFull?: OpcionMenu[];
  forzarProximaSemana?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-[30px] font-extrabold text-[#17330A] mt-4 leading-tight">
          Your order summary
        </h2>
        <p className="sub">
          Review everything before sending it via WhatsApp. Tap any card to
          edit it.
        </p>
      </div>

      {/* Setup summary */}
      <button
        type="button"
        onClick={() => onEditarPaso(0)}
        className="w-full text-left p-[16px] rounded-[16px] border-[1.5px] border-[#CFCBA8] bg-white text-on-surface hover:border-[#2F6E00]/60 transition-colors flex items-center gap-12"
      >
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-bold tracking-[0.08em] text-[#2F6E00] uppercase">
              ORDER SETUP · EDIT
            </span>
            <span className="font-bold text-[17px]">{formatearMoneda(subtotal)}</span>
          </div>
          <div className="mt-2 text-sm text-[#17330A]">
            {comidas.length} meal{comidas.length > 1 ? "s" : ""} ·{" "}
            {modo === "macro" ? "Macro" : "By Portion"}
          </div>
        </div>
      </button>

      <div className="space-y-3">
        {comidas.map((c, i) => {
          const proteina = proteinas.find((p) => p.id === c.proteinaId);
          const platoItem = platos?.find((p) => p.id === c.proteinaId);
          const precio = precioComida(c, modo, proteinas, opcionesDesayuno, extrasConfig, platos, carbohidratosFull, vegetalesFull);
          const tipoLabel =
            c.tipo === "desayuno"
              ? "Breakfast"
              : c.tipo === "plato"
                ? "Plato"
                : "Regular Meal";
          return (
            <button
              key={i}
              type="button"
              onClick={() => onEditarPaso(i + 1)}
              className="w-full text-left p-[16px] rounded-[16px] border-[1.5px] border-[#CFCBA8] bg-white flex flex-col gap-2 transition-colors hover:border-[#2F6E00]/60"
            >
              <div className="flex justify-between items-start">
                <span className="text-[12px] font-bold tracking-[0.08em] text-[#2F6E00] uppercase">
                  MEAL {i + 1} · {tipoLabel} · EDIT
                </span>
                <span className="font-bold text-[17px]">{formatearMoneda(precio)}</span>
              </div>
              <div className="mt-1 text-sm leading-relaxed text-[#17330A]">
                {c.tipo === "desayuno"
                  ? c.carbohidrato
                  : c.tipo === "plato"
                    ? platoItem?.nombre ?? ""
                    : `${proteina?.nombre} + ${c.carbohidrato}${
                        c.vegetal ? ` + ${c.vegetal}` : ""
                      }`}
                {c.extraActivo && c.extras && c.extras.length > 0
                  ? ` + ${c.extras.join(", ")}`
                  : ""}
                {modo === "macro" && c.tipo !== "desayuno"
                  ? ` (${c.gramosProteina}g / ${c.gramosCarbohidrato}g)`
                  : ""}
              </div>
              {c.comentario && (
                <div className="mt-1 text-[11px] text-on-surface-variant italic">
                  Note: {c.comentario}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div
        className="flex justify-between items-center p-[16px] rounded-[16px] bg-[#EAF4DC] border border-[#CFCBA8]/40"
      >
        <span className="font-medium text-[#17330A]">Total</span>
        <span className="font-display font-extrabold text-[24px] text-[#2F6E00]">
          {formatearMoneda(total)}
        </span>
      </div>

      <button
        type="button"
        onClick={onCambiarCodigo}
        className="text-center text-[12px] font-bold tracking-[0.08em] text-[#2F6E00] underline min-h-[44px] flex items-center justify-center"
      >
        {descuentoPct > 0 ? "Change discount code" : "Have a discount code?"}
      </button>

      <div className="opt w-full p-[16px] rounded-[16px] border-[1.5px] border-[#CFCBA8] bg-white">
        <div className="text-[12px] font-bold tracking-[0.08em] text-[#2F6E00] uppercase">
          {tipoEntrega === "delivery" ? "DELIVERY" : "PICKUP"} · EDIT
        </div>
        <div className="mt-[8px] text-sm leading-relaxed text-[#17330A] whitespace-pre-line">
          {nombre}
          <br />
          {tipoEntrega === "delivery" ? (
            direccionEntrega && (
              <>
                <br />
                {direccionEntrega}
              </>
            )
          ) : (
            sede && (
              <>
                <br />
                {sede.direccion}
              </>
            )
          )}
          <br />
          {diaEntrega &&
            etiquetaFecha(
              proximaFecha(diaEntrega === "domingo" ? 0 : 1, forzarProximaSemana),
            )}
        </div>
      </div>
    </div>
  );
}

function PasoConfirmacion({
  comidas,
  modo,
  nombre,
  telefono,
  detalles,
  diaEntrega,
  sede,
  tipoEntrega,
  direccionEntrega,
  total,
  whatsappUrl,
  onStartNewOrder,
}: {
  comidas: ComidaSlot[];
  modo: ModoPedido;
  nombre: string;
  telefono: string;
  detalles: string;
  diaEntrega: DiaEntrega | "";
  sede: SedeRetiro | null;
  tipoEntrega: TipoEntrega;
  direccionEntrega: string;
  total: number;
  whatsappUrl: string;
  onStartNewOrder: () => void;
}) {
  const fecha = diaEntrega
    ? etiquetaFecha(proximaFecha(diaEntrega === "domingo" ? 0 : 1, false))
    : "";
  const modoTexto = tipoEntrega === "delivery" ? "Delivery" : "Pickup";
  const direccionMostrar =
    tipoEntrega === "delivery" ? direccionEntrega : sede?.direccion ?? "";

  const textoOrden = [
    "JJ Meals - Nueva orden",
    `${comidas.length} meals · ${formatearMoneda(total)}`,
    `${modoTexto} · ${fecha}`,
    direccionMostrar,
    nombre ? `Nombre: ${nombre}` : "",
    telefono ? `Tel: ${telefono}` : "",
    detalles ? `Detalles: ${detalles}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="space-y-6 pt-[40px] text-center">
      <div
        className="w-[84px] h-[84px] rounded-full bg-[#2F6E00] text-[#fff] text-[44px] flex items-center justify-center mx-auto"
      >
        ✓
      </div>
      <h2 className="font-display text-[30px] font-extrabold text-[#17330A] mt-4 leading-tight">
        Your order is ready
      </h2>
      <p className="sub mx-auto" style={{ maxWidth: 300 }}>
        Tap the button to send it via WhatsApp. We confirm it there.
      </p>
      <div
        className="opt w-full p-[16px] rounded-[16px] border-[1.5px] border-[#CFCBA8] bg-white mx-auto"
        style={{ maxWidth: 340 }}
      >
        <div className="flex justify-between items-start">
          <span className="font-bold">{comidas.length} meals</span>
          <span className="font-extrabold">{formatearMoneda(total)}</span>
        </div>
        <div className="mt-[8px] text-sm leading-relaxed text-[#4A5A3C]">
          {modoTexto} · {fecha}{" "}
          {direccionMostrar && <br />}
          {direccionMostrar}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (whatsappUrl) window.location.href = whatsappUrl;
        }}
        className="w-full max-w-[240px] mx-auto min-h-[52px] rounded-full bg-[#FDC305] text-[#17330A] font-poppins font-bold text-[17px] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
      >
        Open WhatsApp
      </button>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(textoOrden);
        }}
        className="w-full max-w-[240px] mx-auto min-h-[52px] rounded-full border-[2px] border-[#2F6E00] text-[#17330A] font-poppins font-bold text-[17px] flex items-center justify-center mt-[12px] active:scale-95 transition-all cursor-pointer"
      >
        Didn’t open? Copy order text
      </button>
      <button
        type="button"
        onClick={onStartNewOrder}
        className="text-center font-bold text-[#2F6E00] underline min-h-[44px] mx-auto mt-[12px] cursor-pointer active:scale-95 transition-all"
      >
        Start a new order
      </button>
    </div>
  );
}





