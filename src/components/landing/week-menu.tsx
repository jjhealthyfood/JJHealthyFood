"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const FOCUS =
  "focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-current";

/**
 * Platos reales del proyecto. Los precios salen de la tabla opciones_menu.
 * Si un plato no tiene precio confirmado, se muestra "—".
 */
const WEEK_MENU = [
  {
    name: "Mexican Bowl",
    detail: "Ground beef · black beans · rice · pico de gallo",
    price: 9,
    image: "/carrusel/mexican-bowl.jpeg",
    alt: "Mexican bowl with ground beef, black beans, rice and pico de gallo",
  },
  {
    name: "Steak, Sweet Potato & Asparagus",
    detail: "Seared steak · roasted sweet potato · asparagus",
    price: 12,
    image: "/carrusel/res-batata-esparragos.jpeg",
    alt: "Seared steak with roasted sweet potato and asparagus",
  },
  {
    name: "Salmon, Quinoa & Salad",
    detail: "Salmon · quinoa · fresh green salad",
    price: 12,
    image: "/carrusel/salmon-quinoa-ensalada.jpeg",
    alt: "Salmon fillet with quinoa and a fresh green salad",
  },
  {
    name: "Grilled Fish, Rice & Green Beans",
    detail: "Grilled white fish · rice · green beans",
    price: 12,
    image: "/carrusel/pescado-arroz-vainitas.jpeg",
    alt: "Grilled fish with rice and green beans",
  },
  {
    name: "Chicken Wrap",
    detail: "Chicken · fresh vegetables · tortilla",
    price: null,
    image: "/carrusel/wrap-pollo-vegetales.jpeg",
    alt: "Chicken wrap with fresh vegetables",
  },
];

function formatPrice(price: number | null, fallback: string) {
  if (price === null) return fallback;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function WeekMenu() {
  const { t } = useLanguage();

  return (
    <section id="week-menu" className="pt-14 sm:pt-20">
      <div className="mx-auto max-w-[1160px] px-5 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="mb-3 inline-flex items-center rounded-full bg-[#2F6E00] px-3.5 py-1.5 font-poppins text-[11px] font-extrabold uppercase tracking-[0.08em] text-white">
              {t.week.badge}
            </span>
            <h2 className="font-poppins text-3xl font-extrabold tracking-tight text-[#17330A] sm:text-4xl">
              {t.week.title}
            </h2>
            <p className="mt-2 max-w-[560px] font-sans text-base leading-relaxed text-[#17330A]/80 sm:text-lg">
              {t.week.subtitle}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 font-sans text-sm font-semibold text-[#4A5A3C] sm:inline-flex">
            {t.week.swipe}
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </div>

        {/* Carrusel horizontal con snap */}
        <div className="relative">
          <div className="no-scrollbar -mx-5 snap-x snap-mandatory overflow-x-auto px-5 pb-3 sm:-mx-6 sm:px-6">
            <ul className="flex w-max gap-4">
              {WEEK_MENU.map((dish) => (
                <li
                  key={dish.name}
                  className="w-[264px] shrink-0 snap-start sm:w-[300px]"
                >
                  <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border-[1.5px] border-[#E6E2C8] bg-white shadow-xs transition-shadow hover:shadow-lg motion-reduce:transition-none">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FFF1B8]">
                      <Image
                        src={dish.image}
                        alt={dish.alt}
                        fill
                        sizes="(max-width: 640px) 264px, 300px"
                        className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105 motion-reduce:transition-none"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-poppins text-[17px] font-bold leading-snug text-[#17330A]">
                        {dish.name}
                      </h3>
                      <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-[#4A5A3C]">
                        {dish.detail}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#F0ECD9] pt-3">
                        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-[#4A5A3C]">
                          {t.week.price}
                        </span>
                        <span className="font-poppins text-xl font-extrabold text-[#2F6E00]">
                          {formatPrice(dish.price, t.week.pricePending)}
                        </span>
                      </div>

                      <Link
                        href="/pedido"
                        className={`mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#FDC305] px-4 font-poppins text-sm font-bold text-[#17330A] transition-all hover:bg-[#FFD43B] active:scale-95 ${FOCUS}`}
                      >
                        {t.week.cta}
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>

          {/* Pista visual de scroll en móvil */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#FFFBEA] to-transparent sm:hidden"
          />
        </div>

        <div className="mt-2 flex items-center gap-1.5 font-sans text-xs font-semibold text-[#4A5A3C] sm:hidden">
          {t.week.swipe}
          <ArrowRight size={14} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
