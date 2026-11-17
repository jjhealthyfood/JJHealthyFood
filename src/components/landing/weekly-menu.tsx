"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

type MenuItem = {
  src: string;
  alt: string;
  description: string;
  name: string;
  ingredients: string;
  price: string;
};

const items: MenuItem[] = [
  {
    src: "/carrusel/mexican-bowl.jpeg",
    alt: "Mexican Bowl",
    description: "Mexican bowl with ground beef, black beans, rice and pico de gallo",
    name: "Mexican Bowl",
    ingredients: "Ground beef · black beans · rice · pico de gallo",
    price: "$9.00",
  },
  {
    src: "/carrusel/res-batata-esparragos.jpeg",
    alt: "Steak, Sweet Potato & Asparagus",
    description: "Seared steak with roasted sweet potato and asparagus",
    name: "Steak, Sweet Potato & Asparagus",
    ingredients: "Seared steak · roasted sweet potato · asparagus",
    price: "$12.00",
  },
  {
    src: "/carrusel/salmon-quinoa-ensalada.jpeg",
    alt: "Salmon, Quinoa & Salad",
    description: "Salmon fillet with quinoa and a fresh green salad",
    name: "Salmon, Quinoa & Salad",
    ingredients: "Salmon · quinoa · fresh green salad",
    price: "$12.00",
  },
  {
    src: "/carrusel/pescado-arroz-vainitas.jpeg",
    alt: "Grilled Fish, Rice & Green Beans",
    description: "Grilled fish with rice and green beans",
    name: "Grilled Fish, Rice & Green Beans",
    ingredients: "Grilled white fish · rice · green beans",
    price: "$12.00",
  },
];

export function WeeklyMenu() {
  const { t } = useLanguage();

  return (
    <section id="week-menu" className="bg-[#FFFBEA] py-10 sm:py-16">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center rounded-full bg-[#FDC305] px-3 py-1 font-poppins text-[11px] font-bold uppercase tracking-[0.08em] text-[#17330A] sm:text-xs">
            This week menu
          </span>
          <h2 className="mt-4 font-poppins text-3xl sm:text-4xl font-extrabold leading-tight text-[#17330A]">
            Swipe to explore
          </h2>
        </div>

        <div
          className="flex items-stretch gap-6 overflow-x-auto scroll-snap-type-x-mandatory pb-10 scrollbar-hide sm:gap-8 sm:pb-14"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-[210px] sm:w-[260px] flex flex-col h-full"
            >
              <div className="relative h-[170px] sm:h-[200px] w-full rounded-[20px] overflow-hidden border border-[#E6E2C8] bg-[#FFF1B8] shadow-sm mb-4 shrink-0">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 210px, 260px"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <div className="flex-1">
                  <p className="font-sans text-[13px] leading-[1.4] text-[#4A5A3C] line-clamp-2 min-h-[calc(1.4rem*2.8)] mb-1">
                    {item.description}
                  </p>
                  <h3 className="font-poppins text-[16px] font-bold leading-[1.25] text-[#17330A] line-clamp-2 min-h-[calc(1.25rem*2.5)]">
                    {item.name}
                  </h3>
                  <p className="font-sans text-xs text-[#4A5A3C]/80 leading-relaxed line-clamp-2 min-h-[calc(1.25rem*2.5)] mt-1">
                    {item.ingredients}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-[#2F6E00]">
                    Price
                  </span>
                  <span className="font-poppins text-[18px] font-extrabold text-[#17330A]">
                    {item.price}
                  </span>
                </div>

                <Link
                  href="/pedido"
                  className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#FDC305] px-5 font-poppins font-bold text-[13px] text-[#17330A] shadow-sm transition-all hover:bg-[#FFD43B] hover:shadow-md active:scale-95 sm:px-6 sm:text-sm"
                >
                  {t.hero.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
