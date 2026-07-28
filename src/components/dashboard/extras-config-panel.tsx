"use client";

import { useState, useTransition } from "react";
import { DollarSign, Save, Pencil, X, Plus, AlertTriangle } from "lucide-react";
import {
  guardarExtrasConfig,
  borrarOpcionMenu,
  cambiarExtraPriceOverride,
  crearOpcionMenu,
} from "@/controllers/dashboard-menu.actions";
import type { ExtrasConfig } from "@/models/menu.model";
import type { OpcionMenu } from "@/models/types";

function formatearMoneda(valor: number) {
  if (isNaN(valor) || valor === null || valor === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(valor);
}

function PrecioExtraItemEditor({
  opcion,
  precioCategoria,
  onActualizar,
  disabled,
}: {
  opcion: OpcionMenu;
  precioCategoria: number;
  onActualizar: (id: string, precio: number | null) => void;
  disabled: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const valorActual = opcion.extra_price_override ?? precioCategoria;
  const [tmp, setTmp] = useState(String(valorActual));
  const [pending, startTransition] = useTransition();

  function guardar(nuevoTmp: string) {
    setEditando(false);
    const num = Number(nuevoTmp);
    if (isNaN(num) || num < 0) return;
    startTransition(async () => {
      await cambiarExtraPriceOverride(opcion.id, num);
      onActualizar(opcion.id, num);
    });
  }

  if (editando) {
    return (
      <input
        type="number"
        min={0}
        step="0.50"
        autoFocus
        value={tmp}
        disabled={disabled || pending}
        onChange={(e) => setTmp(e.target.value)}
        onBlur={() => guardar(tmp)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") setEditando(false);
        }}
        className="w-16 px-2 py-1 rounded-lg border border-primary font-sans text-sm outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setTmp(String(valorActual));
        setEditando(true);
      }}
      disabled={disabled || pending}
      title="Editar precio individual"
      className="inline-flex items-center gap-1 hover:opacity-80"
    >
      <span className="font-mono text-sm text-on-surface">
        {formatearMoneda(valorActual)}
      </span>
      <Pencil size={10} className="text-on-surface-variant" />
    </button>
  );
}

function ChipExtra({
  opcion,
  precioCategoria,
  onEliminar,
  onActualizarPrecio,
  disabled,
}: {
  opcion: OpcionMenu;
  precioCategoria: number;
  onEliminar: (id: string) => void;
  onActualizarPrecio: (id: string, precio: number | null) => void;
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function eliminar() {
    startTransition(async () => {
      await borrarOpcionMenu(opcion.id);
      onEliminar(opcion.id);
    });
  }

  return (
    <div className="inline-flex items-center gap-2 pl-3 pr-1.5 py-2 rounded-xl border bg-surface-container-low border-outline-variant transition-colors">
      <span className="font-sans text-sm font-medium text-on-surface">
        {opcion.nombre}
      </span>
      <PrecioExtraItemEditor
        opcion={opcion}
        precioCategoria={precioCategoria}
        onActualizar={onActualizarPrecio}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={eliminar}
        disabled={disabled || pending}
        title="Eliminar extra"
        className="ml-1 w-5 h-5 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 text-on-surface-variant hover:bg-error-container hover:text-error"
      >
        <X size={12} />
      </button>
    </div>
  );
}

function AgregarExtraBoton({
  categoria,
  nivel,
  nombresExistentes,
  onAgregar,
  disabled,
}: {
  categoria: "proteina" | "carbohidrato" | "vegetal";
  nivel?: "sencilla" | "premium";
  nombresExistentes: string[];
  onAgregar: (nueva: OpcionMenu) => void;
  disabled: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function agregar() {
    const limpio = nombre.trim();
    if (!limpio) return;

    const existe = nombresExistentes.some(
      (n) => n.toLowerCase() === limpio.toLowerCase()
    );
    if (existe) {
      setError(`"${limpio}" ya existe en el menú`);
      return;
    }

    setError("");
    startTransition(async () => {
      const nueva = await crearOpcionMenu(categoria, limpio, { nivel });
      if (!nueva) return;
      setNombre("");
      setEditando(false);
      onAgregar(nueva);
    });
  }

  if (editando) {
    return (
      <div className="inline-flex flex-col gap-1">
        <div className="inline-flex items-center gap-1">
          <input
            type="text"
            autoFocus
            value={nombre}
            disabled={pending}
            onChange={(e) => {
              setNombre(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") agregar();
              if (e.key === "Escape") {
                setEditando(false);
                setNombre("");
                setError("");
              }
            }}
            placeholder="Nombre del extra..."
            className="w-40 px-2 py-1 rounded-lg border border-primary font-sans text-sm outline-none"
          />
          <button
            type="button"
            onClick={agregar}
            disabled={pending || !nombre.trim()}
            className="px-2 py-1 rounded-lg bg-primary text-on-primary font-sans text-xs font-semibold disabled:opacity-50"
          >
            {pending ? "..." : "OK"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditando(false);
              setNombre("");
              setError("");
            }}
            className="px-2 py-1 rounded-lg bg-surface-container font-sans text-xs text-on-surface-variant"
          >
            Cancelar
          </button>
        </div>
        {error && (
          <span className="flex items-center gap-1 text-xs text-error font-sans ml-1">
            <AlertTriangle size={11} />
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditando(true)}
      disabled={disabled}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors text-xs font-sans"
    >
      <Plus size={12} />
      Agregar
    </button>
  );
}

export function ExtrasConfigPanel({
  config,
  proteinas,
  carbohidratos,
  vegetales,
}: {
  config: ExtrasConfig;
  proteinas: OpcionMenu[];
  carbohidratos: OpcionMenu[];
  vegetales: OpcionMenu[];
}) {
  const valores = config;
  const [items, setItems] = useState<OpcionMenu[]>([
    ...proteinas,
    ...carbohidratos,
    ...vegetales,
  ]);
  const [pending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  function guardar() {
    setGuardado(false);
    startTransition(async () => {
      await guardarExtrasConfig(valores);
      setGuardado(true);
    });
  }

  function eliminarItemLocal(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function actualizarPrecioLocal(id: string, precio: number | null) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, extra_price_override: precio } : i
      )
    );
  }

  function agregarItemLocal(nueva: OpcionMenu) {
    setItems((prev) => [...prev, nueva]);
  }

  const proteinasItems = items.filter((i) => i.categoria === "proteina");
  const sencillas = proteinasItems.filter((p) => p.nivel === "sencilla");
  const premium = proteinasItems.filter((p) => p.nivel === "premium");
  const carbsItems = items.filter((i) => i.categoria === "carbohidrato");
  const vegItems = items.filter((i) => i.categoria === "vegetal");
  const todosLosNombres = items.map((i) => i.nombre);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 md:p-6">
      <h3 className="font-display text-lg font-semibold text-on-surface mb-1 flex items-center gap-2">
        <DollarSign size={20} />
        Precios de Extras
      </h3>
      <p className="font-sans text-sm text-on-surface-variant mb-5">
        Precio individual por cada extra. Presiona la X para eliminar un item.
      </p>

      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-sans font-bold text-secondary uppercase mb-2">
            Sencillas{" "}
            <span className="text-on-surface-variant normal-case">
              · default {formatearMoneda(valores.proteina_regular)}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {sencillas.map((p) => (
              <ChipExtra
                key={p.id}
                opcion={p}
                precioCategoria={valores.proteina_regular}
                onActualizarPrecio={actualizarPrecioLocal}
                onEliminar={eliminarItemLocal}
                disabled={pending}
              />
            ))}
            <AgregarExtraBoton
              categoria="proteina"
              nivel="sencilla"
              nombresExistentes={todosLosNombres}
              onAgregar={agregarItemLocal}
              disabled={pending}
            />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-sans font-bold text-secondary uppercase mb-2">
            Premium{" "}
            <span className="text-on-surface-variant normal-case">
              · default {formatearMoneda(valores.proteina_premium)}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {premium.map((p) => (
              <ChipExtra
                key={p.id}
                opcion={p}
                precioCategoria={valores.proteina_premium}
                onActualizarPrecio={actualizarPrecioLocal}
                onEliminar={eliminarItemLocal}
                disabled={pending}
              />
            ))}
            <AgregarExtraBoton
              categoria="proteina"
              nivel="premium"
              nombresExistentes={todosLosNombres}
              onAgregar={agregarItemLocal}
              disabled={pending}
            />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-sans font-bold text-secondary uppercase mb-2">
            Carbohidratos{" "}
            <span className="text-on-surface-variant normal-case">
              · default {formatearMoneda(valores.carbohidrato)}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {carbsItems.map((c) => (
              <ChipExtra
                key={c.id}
                opcion={c}
                precioCategoria={valores.carbohidrato}
                onActualizarPrecio={actualizarPrecioLocal}
                onEliminar={eliminarItemLocal}
                disabled={pending}
              />
            ))}
            <AgregarExtraBoton
              categoria="carbohidrato"
              nombresExistentes={todosLosNombres}
              onAgregar={agregarItemLocal}
              disabled={pending}
            />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-sans font-bold text-secondary uppercase mb-2">
            Vegetales{" "}
            <span className="text-on-surface-variant normal-case">
              · default {formatearMoneda(valores.vegetal)}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {vegItems.map((v) => (
              <ChipExtra
                key={v.id}
                opcion={v}
                precioCategoria={valores.vegetal}
                onActualizarPrecio={actualizarPrecioLocal}
                onEliminar={eliminarItemLocal}
                disabled={pending}
              />
            ))}
            <AgregarExtraBoton
              categoria="vegetal"
              nombresExistentes={todosLosNombres}
              onAgregar={agregarItemLocal}
              disabled={pending}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-outline-variant/50">
        <button
          type="button"
          onClick={guardar}
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-sans text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
        >
          <Save size={16} />
          {pending ? "Guardando..." : "Guardar precios default"}
        </button>
        {guardado && (
          <span className="font-sans text-sm text-secondary">
            Guardado correctamente
          </span>
        )}
      </div>
    </div>
  );
}
