"use client";

import { Leaf } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const REPETICIONES = 10;
const GRUPOS = [0, 1];

/**
 * Franja de marca para dividir secciones.
 * Por defecto es decorativa (aria-hidden) porque repite texto; si el mensaje
 * aporta información (p. ej. "Free delivery"), pasa decorative={false}.
 */
export function BrandRibbon({
  className = "",
  text = "JJ Meals",
  decorative = true,
}: {
  className?: string;
  text?: string;
  decorative?: boolean;
}) {
  return (
    <div
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : text}
      role={decorative ? undefined : "note"}
      className={`overflow-hidden border-y border-[#2F6E00]/40 bg-[#17330A] py-2.5 ${className}`}
    >
      <div
        aria-hidden={decorative ? undefined : true}
        className="jj-marquee flex w-max items-center"
      >
        {GRUPOS.map((grupo) => (
          <div key={grupo} className="flex items-center">
            {Array.from({ length: REPETICIONES }).map((_, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-4 whitespace-nowrap px-5 font-poppins text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#FFFBEA]"
              >
                {text}
                <Leaf size={13} className="text-[#FDC305]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Franja con el mensaje de delivery gratis, bilingüe. */
export function DeliveryRibbon({ className = "" }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <BrandRibbon text={t.ribbon.delivery} className={className} decorative={false} />
  );
}
