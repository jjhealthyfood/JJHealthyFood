/**
 * Precios de las comidas keto.
 *
 * En keto la proteína va incluida en el precio del plato, pero algunos platos
 * cambian de precio según la proteína elegida. Estas reglas son la única
 * fuente de verdad: se usan tanto en el wizard (cliente) como al guardar el
 * pedido (servidor), para que el total siempre coincida.
 *
 * Si se agrega un plato keto nuevo sin regla aquí, se usa su `precio_racion`
 * de la base de datos.
 */

type ReglaKeto = {
  base: number;
  porProteina?: Record<string, number>;
};

const REGLAS_KETO: Record<string, ReglaKeto> = {
  "lasagna berenjena": { base: 12 },
  // La salsa de tomate no tiene acento en algunos nombres viejos.
  "lasana berenjena": { base: 12 },
  "spaghetti zucchini": {
    base: 12,
    porProteina: { pollo: 10, carne: 12, salmon: 12 },
  },
  "salmon bowl": {
    base: 12,
    porProteina: { salmon: 12 },
  },
};

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Precio de un plato keto para la proteína elegida. */
export function precioKeto(
  plato: string,
  proteina?: string | null,
  precioBD?: number | string | null
): number {
  const regla = REGLAS_KETO[normalizar(plato)];
  if (!regla) {
    const precio = Number(precioBD);
    return Number.isFinite(precio) && precio > 0 ? precio : 0;
  }

  if (proteina) {
    const precioProteina = regla.porProteina?.[normalizar(proteina)];
    if (precioProteina !== undefined) return precioProteina;
  }

  return regla.base;
}

/** Todos los precios posibles de un plato keto (para mostrar un rango). */
export function preciosKetoPlato(
  plato: string,
  precioBD?: number | string | null
): number[] {
  const regla = REGLAS_KETO[normalizar(plato)];
  if (!regla) {
    const precio = Number(precioBD);
    return Number.isFinite(precio) && precio > 0 ? [precio] : [];
  }

  const valores = [regla.base, ...Object.values(regla.porProteina ?? {})];
  return [...new Set(valores)].sort((a, b) => a - b);
}

/** Etiqueta compacta: "$12" o "$10–$12" si el precio depende de la proteína. */
export function etiquetaPrecioKeto(
  plato: string,
  precioBD?: number | string | null
): string {
  const precios = preciosKetoPlato(plato, precioBD);
  if (precios.length === 0) return "";
  if (precios.length === 1) return `$${precios[0]}`;
  return `$${precios[0]}–$${precios[precios.length - 1]}`;
}
