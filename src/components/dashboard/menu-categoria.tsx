"use client";

import { useState, useTransition } from "react";
import { Plus, X, Pencil, AlertTriangle } from "lucide-react";
import {
  crearOpcionMenu,
  borrarOpcionMenu,
  cambiarPrecioMacroGramo,
  cambiarPrecioRacion,
  cambiarSoloExtra,
} from "@/controllers/dashboard-menu.actions";
import type { CategoriaMenu, NivelProteina, OpcionMenu } from "@/models/types";

function formatearMoneda(valor: number) {
  if (isNaN(valor) || valor === null || valor === undefined) return "$—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(valor);
}

function PrecioMacroEditor({ opcion }: { opcion: OpcionMenu }) {
  const [editando, setEditando] = useState(false);
  const precioBD = Number(opcion.precio_macro_gramo);
  const tienePrecio = !isNaN(precioBD) && precioBD > 0;
  const precioDefault = opcion.nivel === "premium" ? 14 : 12;
  const precioVisible = tienePrecio ? precioBD : precioDefault;
  const [valor, setValor] = useState(String(precioVisible));
  const [pending, startTransition] = useTransition();

  function guardar() {
    const numero = Number(valor);
    setEditando(false);
    if (Number.isNaN(numero) || numero < 0) return;
    startTransition(async () => {
      await cambiarPrecioMacroGramo(opcion.id, numero);
    });
  }

  if (editando) {
    return (
      <input
        type="number"
        min={0}
        step="1"
        autoFocus
        value={valor}
        disabled={pending}
        onChange={(e) => setValor(e.target.value)}
        onBlur={guardar}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="w-16 px-2 py-1 rounded-lg border border-primary font-sans text-sm outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditando(true)}
      disabled={pending}
      title="Editar precio macro"
      className="inline-flex items-center gap-1 hover:opacity-80"
    >
      <span className="font-mono text-sm text-on-surface">
        {formatearMoneda(precioVisible)}
      </span>
      <Pencil size={10} className="text-on-surface-variant" />
    </button>
  );
}

function PrecioRacionEditor({ opcion }: { opcion: OpcionMenu }) {
  const [editando, setEditando] = useState(false);
  const precioBD = Number(opcion.precio_racion);
  const tienePrecio = !isNaN(precioBD) && precioBD > 0;
  const precioDefault = opcion.nivel === "premium" ? 12 : 9;
  const precioVisible = tienePrecio ? precioBD : precioDefault;
  const [valor, setValor] = useState(String(precioVisible));
  const [pending, startTransition] = useTransition();

  function guardar() {
    const numero = Number(valor);
    setEditando(false);
    if (Number.isNaN(numero) || numero < 0) return;
    startTransition(async () => {
      await cambiarPrecioRacion(opcion.id, numero);
    });
  }

  if (editando) {
    return (
      <input
        type="number"
        min={0}
        step="1"
        autoFocus
        value={valor}
        disabled={pending}
        onChange={(e) => setValor(e.target.value)}
        onBlur={guardar}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="w-16 px-2 py-1 rounded-lg border border-primary font-sans text-sm outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditando(true)}
      disabled={pending}
      title="Editar precio ración"
      className="inline-flex items-center gap-1 hover:opacity-80"
    >
      <span className="font-mono text-sm text-on-surface">
        {formatearMoneda(precioVisible)}
      </span>
      <Pencil size={10} className="text-on-surface-variant" />
    </button>
  );
}

function ChipRacion({
  opcion,
  onQuitar,
  pending,
}: {
  opcion: OpcionMenu;
  onQuitar: () => void;
  pending: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2 pl-3 pr-1.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant">
      <span className="font-sans text-sm text-on-surface font-medium">
        {opcion.nombre}
      </span>
      <PrecioRacionEditor opcion={opcion} />
      <button
        type="button"
        onClick={onQuitar}
        disabled={pending}
        title={`Quitar ${opcion.nombre}`}
        className="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors disabled:opacity-50"
      >
        <X size={12} />
      </button>
    </div>
  );
}

function ChipMacro({
  opcion,
  onQuitar,
  pending,
}: {
  opcion: OpcionMenu;
  onQuitar: () => void;
  pending: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2 pl-3 pr-1.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant">
      <span className="font-sans text-sm text-on-surface font-medium">
        {opcion.nombre}
      </span>
      <PrecioMacroEditor opcion={opcion} />
      <button
        type="button"
        onClick={onQuitar}
        disabled={pending}
        title={`Quitar ${opcion.nombre}`}
        className="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors disabled:opacity-50"
      >
        <X size={12} />
      </button>
    </div>
  );
}

function ChipSimple({
  opcion,
  onQuitar,
  pending,
  esDesayuno = false,
  esPlato = false,
}: {
  opcion: OpcionMenu;
  onQuitar: () => void;
  pending: boolean;
  esDesayuno?: boolean;
  esPlato?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2 pl-3 pr-1.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant">
      <span className="font-sans text-sm text-on-surface font-medium">
        {opcion.nombre}
      </span>
      {esDesayuno && <PrecioRacionEditor opcion={opcion} />}
      {esPlato && (
        <>
          <PrecioRacionEditor opcion={opcion} />
          <PrecioMacroEditor opcion={opcion} />
        </>
      )}
      <button
        type="button"
        onClick={onQuitar}
        disabled={pending}
        title={`Quitar ${opcion.nombre}`}
        className="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors disabled:opacity-50"
      >
        <X size={12} />
      </button>
    </div>
  );
}

type TabTipo = "racion" | "macro";

export function MenuCategoria({
  categoria,
  titulo,
  opciones,
  todosLosNombres,
  esProteina = false,
  esPlato = false,
}: {
  categoria: CategoriaMenu;
  titulo: string;
  opciones: OpcionMenu[];
  todosLosNombres?: string[];
  esProteina?: boolean;
  esPlato?: boolean;
}) {
  const [tab, setTab] = useState<TabTipo>("racion");
  const [nuevo, setNuevo] = useState("");
  const [nivel, setNivel] = useState<NivelProteina>("sencilla");
  const [precioRacion, setPrecioRacion] = useState(esPlato ? "9" : "9");
  const [precioMacro, setPrecioMacro] = useState(esPlato ? "12" : "12");
  const [precioDesayuno, setPrecioDesayuno] = useState("7");
  const [pending, startTransition] = useTransition();
  const [errorNombre, setErrorNombre] = useState("");
  const [eliminados, setEliminados] = useState<string[]>([]);
  const [opcionesLocales, setOpcionesLocales] = useState<OpcionMenu[]>(opciones);

  const opcionesVisibles = opcionesLocales.filter((o) =>
    !eliminados.includes(o.id) && !(categoria === "vegetal" && o.solo_extra)
  );

  const sencillas = opcionesVisibles.filter((o) => o.nivel === "sencilla");
  const premium = opcionesVisibles.filter((o) => o.nivel === "premium");

  const preciosDefault: Record<NivelProteina, { racion: string; macro: string }> = {
    sencilla: { racion: "9", macro: "12" },
    premium: { racion: "12", macro: "14" },
  };

  function cambiarNivel(n: NivelProteina) {
    setNivel(n);
    setPrecioRacion(preciosDefault[n].racion);
    setPrecioMacro(preciosDefault[n].macro);
  }

  function agregar() {
    const nombre = nuevo.trim();
    if (!nombre) return;

    const nombresAComparar = opcionesVisibles.map((o) => o.nombre);
    const existe = nombresAComparar.some(
      (n) => n.toLowerCase() === nombre.toLowerCase()
    );
    if (existe) {
      setErrorNombre(`"${nombre}" ya existe en el menú`);
      return;
    }

    setErrorNombre("");
    setNuevo("");
    startTransition(async () => {
      if (esProteina) {
        const precio = tab === "racion" ? Number(precioRacion) : Number(precioMacro);
        await crearOpcionMenu(categoria, nombre, {
          nivel,
          precioRacion: tab === "racion" ? precio || 0 : Number(preciosDefault[nivel].racion),
          precioMacroGramo: tab === "macro" ? precio || 0 : Number(preciosDefault[nivel].macro),
        });
      } else if (esPlato) {
        await crearOpcionMenu(categoria, nombre, {
          precioRacion: Number(precioRacion) || 9,
          precioMacroGramo: Number(precioMacro) || 12,
        });
      } else if (categoria === "desayuno") {
        await crearOpcionMenu(categoria, nombre, {
          precioRacion: Number(precioDesayuno) || 7,
        });
      } else {
        await crearOpcionMenu(categoria, nombre);
      }
    });
  }

  function quitar(id: string) {
    startTransition(async () => {
      await borrarOpcionMenu(id);
      setEliminados((prev) => [...prev, id]);
    });
  }

  function toggleSoloExtra(id: string, soloExtra: boolean) {
    startTransition(async () => {
      await cambiarSoloExtra(id, soloExtra);
      setOpcionesLocales((prev) =>
        prev.map((o) => (o.id === id ? { ...o, solo_extra: soloExtra } : o))
      );
    });
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 md:p-6">
      <h3 className="font-display text-lg font-semibold text-on-surface mb-4">
        {titulo}
      </h3>

      {esProteina ? (
        <>
          {/* Pestañas */}
          <div className="flex gap-1 mb-4 bg-surface-container rounded-xl p-1">
            <button
              type="button"
              onClick={() => setTab("racion")}
              className={`flex-1 py-2 px-3 rounded-lg font-sans text-sm font-semibold transition-colors ${
                tab === "racion"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              Regular
            </button>
            <button
              type="button"
              onClick={() => setTab("macro")}
              className={`flex-1 py-2 px-3 rounded-lg font-sans text-sm font-semibold transition-colors ${
                tab === "macro"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              Macro
            </button>
          </div>

          {/* Contenido según pestaña */}
          {tab === "racion" ? (
            <div className="space-y-3 mb-5">
              <p className="text-[11px] font-sans text-on-surface-variant">
                Precio por porción estándar.
              </p>
              <div>
                <p className="font-sans text-xs font-bold text-secondary uppercase mb-2">
                  Sencillas
                </p>
                <div className="flex flex-wrap gap-2">
                  {sencillas.length === 0 && (
                    <p className="text-sm text-on-surface-variant font-sans italic">
                      Sin opciones todavía.
                    </p>
                  )}
                  {sencillas.map((o) => (
                    <ChipRacion
                      key={o.id}
                      opcion={o}
                      onQuitar={() => quitar(o.id)}
                      pending={pending}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="font-sans text-xs font-bold text-secondary uppercase mb-2">
                  Premium
                </p>
                <div className="flex flex-wrap gap-2">
                  {premium.length === 0 && (
                    <p className="text-sm text-on-surface-variant font-sans italic">
                      Sin opciones todavía.
                    </p>
                  )}
                  {premium.map((o) => (
                    <ChipRacion
                      key={o.id}
                      opcion={o}
                      onQuitar={() => quitar(o.id)}
                      pending={pending}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-5">
              <p className="text-[11px] font-sans text-on-surface-variant">
                Precio fijo en modo macro (el cliente elige gramos).
              </p>
              <div>
                <p className="font-sans text-xs font-bold text-secondary uppercase mb-2">
                  Sencillas
                </p>
                <div className="flex flex-wrap gap-2">
                  {sencillas.length === 0 && (
                    <p className="text-sm text-on-surface-variant font-sans italic">
                      Sin opciones todavía.
                    </p>
                  )}
                  {sencillas.map((o) => (
                    <ChipMacro
                      key={o.id}
                      opcion={o}
                      onQuitar={() => quitar(o.id)}
                      pending={pending}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="font-sans text-xs font-bold text-secondary uppercase mb-2">
                  Premium
                </p>
                <div className="flex flex-wrap gap-2">
                  {premium.length === 0 && (
                    <p className="text-sm text-on-surface-variant font-sans italic">
                      Sin opciones todavía.
                    </p>
                  )}
                  {premium.map((o) => (
                    <ChipMacro
                      key={o.id}
                      opcion={o}
                      onQuitar={() => quitar(o.id)}
                      pending={pending}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Formulario agregar */}
          <div className="border-t border-outline-variant/50 pt-4 space-y-3">
            <p className="font-sans text-xs font-bold text-on-surface-variant uppercase">
              Agregar proteína
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                value={nuevo}
                onChange={(e) => {
                  setNuevo(e.target.value);
                  setErrorNombre("");
                }}
                placeholder="Nombre..."
                disabled={pending}
                className="flex-1 min-w-[140px] h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl font-sans text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <select
                value={nivel}
                onChange={(e) => cambiarNivel(e.target.value as NivelProteina)}
                disabled={pending}
                className="h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl font-sans text-sm outline-none"
              >
                <option value="sencilla">Sencilla</option>
                <option value="premium">Premium</option>
              </select>
              <div className="flex items-center gap-1">
                <span className="text-xs text-on-surface-variant font-sans">precio</span>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={tab === "racion" ? precioRacion : precioMacro}
                  onChange={(e) =>
                    tab === "racion"
                      ? setPrecioRacion(e.target.value)
                      : setPrecioMacro(e.target.value)
                  }
                  disabled={pending}
                  className="w-20 h-10 px-2 bg-surface-container-low border border-outline-variant rounded-xl font-sans text-sm outline-none"
                />
              </div>
              <button
                type="button"
                onClick={agregar}
                disabled={pending || !nuevo.trim()}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary disabled:opacity-40 active:scale-95 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            {errorNombre && (
              <span className="flex items-center gap-1 text-xs text-error font-sans mt-1">
                <AlertTriangle size={11} />
                {errorNombre}
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            {opcionesVisibles.length === 0 && (
              <p className="text-sm text-on-surface-variant font-sans italic">
                Sin opciones todavía.
              </p>
            )}
            {opcionesVisibles.map((o) => (
              <ChipSimple
                key={o.id}
                opcion={o}
                onQuitar={() => quitar(o.id)}
                pending={pending}
                esDesayuno={categoria === "desayuno"}
                esPlato={esPlato}
              />
            ))}
          </div>

          <div className="border-t border-outline-variant/50 pt-4">
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                value={nuevo}
                onChange={(e) => {
                  setNuevo(e.target.value);
                  setErrorNombre("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") agregar();
                }}
                placeholder={esPlato ? "Nombre del plato..." : "Nueva opción..."}
                disabled={pending}
                className="flex-1 min-w-[140px] h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl font-sans text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              {categoria === "desayuno" && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-on-surface-variant font-sans">precio</span>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={precioDesayuno}
                    onChange={(e) => setPrecioDesayuno(e.target.value)}
                    disabled={pending}
                    className="w-20 h-10 px-2 bg-surface-container-low border border-outline-variant rounded-xl font-sans text-sm outline-none"
                  />
                </div>
              )}
              {esPlato && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-on-surface-variant font-sans">ración</span>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={precioRacion}
                      onChange={(e) => setPrecioRacion(e.target.value)}
                      disabled={pending}
                      className="w-20 h-10 px-2 bg-surface-container-low border border-outline-variant rounded-xl font-sans text-sm outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-on-surface-variant font-sans">macro</span>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={precioMacro}
                      onChange={(e) => setPrecioMacro(e.target.value)}
                      disabled={pending}
                      className="w-20 h-10 px-2 bg-surface-container-low border border-outline-variant rounded-xl font-sans text-sm outline-none"
                    />
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={agregar}
                disabled={pending || !nuevo.trim()}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary disabled:opacity-40 active:scale-95 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            {errorNombre && (
              <span className="flex items-center gap-1 text-xs text-error font-sans mt-1">
                <AlertTriangle size={11} />
                {errorNombre}
              </span>
            )}
            {(categoria === "carbohidrato" || categoria === "vegetal") && (
              <p className="text-[11px] text-on-surface-variant font-sans mt-2">
                Incluido sin costo extra.
              </p>
            )}
            {esPlato && (
              <p className="text-[11px] text-on-surface-variant font-sans mt-2">
                Plato completo. Precio ración y precio macro.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
