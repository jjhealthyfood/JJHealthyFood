"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

type TabKey = "regular" | "plato" | "keto" | "breakfast";

const FOCUS =
  "focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-current";

const STANDARD_PROTEINS = [
  "Ground Beef Stuffed Plantain",
  "Chicken soup 12oz",
  "Chicken soup 16oz",
  "Stuffed Peppers",
  "Turkey Stuffed Plantain",
  "Ground Beef + Tomato Sauce",
  "Ground Beef + Alfredo Sauce",
  "Chicken Breast",
  "Chicken Thigh",
  "Ground Turkey",
  "Meatballs",
  "Ground Beef",
  "Pork",
];

const PREMIUM_PROTEINS = [
  "Ground Beef Lasagna",
  "Eggplant Lasagna",
  "Steak",
  "Salmon",
  "Fish",
  "Grilled Shrimp",
];

const platoDishes = [
  {
    src: "/carrusel/mexican-bowl.jpeg",
    alt: "Mexican Bowl",
    name: "Mexican Bowl",
    ingredients: "Ground Beef, Black Beans, White Rice, Pico de Gallo",
    price: "$9.00",
  },
  {
    src: "/carrusel/pescado-arroz-vainitas.jpeg",
    alt: "Grilled Fish, Rice & Green Beans",
    name: "Grilled Fish, Rice & Green Beans",
    ingredients: "Grilled white fish, rice, green beans",
    price: "$12.00",
  },
  {
    src: "/carrusel/res-batata-esparragos.jpeg",
    alt: "Steak, Sweet Potato & Asparagus",
    name: "Steak, Sweet Potato & Asparagus",
    ingredients: "Seared steak, roasted sweet potato, asparagus",
    price: "$12.00",
  },
];

const breakfastItems = [
  "2 Egg + fruit",
  "Omelette, spinach, cheese + turkey bacon",
  "2 waffles + blueberry",
  "Omelette + bell peppers + onions + fruit",
  "Omelette",
  "Waffles + omelette + fruit",
  "2 Waffles + Eggs & Turkey Bacon",
  "2 waffles + omelette",
  "2 Waffles + Eggs",
  "2 Waffles + Blackberries",
];

export function MenuSection() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>("regular");

  return (
    <section id="menu" className="bg-[#17330A] text-white mt-10">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-6 py-16 sm:py-20">
        {/* Section Header */}
        <span className="inline-flex items-center bg-[#FDC305] text-[#17330A] font-poppins font-extrabold text-xs uppercase tracking-[0.08em] px-4 py-1.5 rounded-full mb-4">
          {t.menu.badge}
        </span>

        <h2 className="font-poppins text-3xl sm:text-4xl lg:text-[40px] font-extrabold leading-tight mb-3">
          {t.menu.title}
        </h2>

        <p className="font-sans text-base sm:text-lg text-[#E8F3D6] max-w-[560px] mb-8 leading-relaxed">
          {t.menu.subtitle}
        </p>

        {/* Tabs Bar — pills con borde verde (como referencia móvil) */}
        <div className="mb-8 flex flex-wrap items-center gap-2.5" role="tablist">
          {(
            [
              { key: "regular", label: t.menu.tabs.regular },
              { key: "plato", label: t.menu.tabs.plato },
              { key: "keto", label: t.menu.tabs.keto, isNew: true },
              { key: "breakfast", label: t.menu.tabs.breakfast },
            ] as const
          ).map((tab) => {
            const activo = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-5 text-sm transition-all ${FOCUS} ${
                  activo
                    ? "bg-[#FDC305] font-bold text-[#17330A] shadow-xs"
                    : "border-[1.5px] border-[#6F9A4A] text-white hover:border-[#FDC305] hover:text-[#FDC305]"
                }`}
              >
                {tab.label}
                {activo && (tab as any).isNew && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                      activo ? "bg-[#17330A] text-[#FDC305]" : "bg-[#FDC305] text-[#17330A]"
                    }`}
                  >
                    {t.menu.new}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Regular Meal */}
        {activeTab === "regular" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-[24px] bg-white p-5 text-[#17330A] shadow-sm sm:p-6">
              <div>
                <span className="mb-3 inline-block rounded-full bg-[#EAF4DC] px-3 py-1 text-xs font-bold text-[#2F6E00]">
                  {t.menu.regular.standardBadge}
                </span>
                <h3 className="mb-3 font-poppins text-lg font-bold">
                  {t.menu.regular.standardTitle}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {STANDARD_PROTEINS.map((protein) => (
                    <li
                      key={protein}
                      className="inline-flex min-h-[44px] items-center rounded-full border border-[#E6E2C8] bg-[#FFFBEA] px-3.5 text-[13px] font-semibold leading-tight text-[#17330A]"
                    >
                      {protein}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                <span className="text-xs font-semibold text-[#4A5A3C]">
                  {t.menu.regular.standardFooter}
                </span>
                <span className="font-poppins text-lg font-extrabold text-[#2F6E00]">
                  $9.00
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[24px] bg-white p-5 text-[#17330A] shadow-sm sm:p-6">
              <div>
                <span className="mb-3 inline-block rounded-full bg-[#FFF1B8] px-3 py-1 text-xs font-bold text-[#5B4A00]">
                  {t.menu.regular.premiumBadge}
                </span>
                <h3 className="mb-3 font-poppins text-lg font-bold">
                  {t.menu.regular.premiumTitle}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {PREMIUM_PROTEINS.map((protein) => (
                    <li
                      key={protein}
                      className="inline-flex min-h-[44px] items-center rounded-full border border-[#E6E2C8] bg-[#FFFBEA] px-3.5 text-[13px] font-semibold leading-tight text-[#17330A]"
                    >
                      {protein}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                <span className="text-xs font-semibold text-[#4A5A3C]">
                  {t.menu.regular.premiumFooter}
                </span>
                <span className="font-poppins text-lg font-extrabold text-[#2F6E00]">
                  $12.00
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[24px] bg-white p-5 text-[#17330A] shadow-sm sm:p-6">
              <div>
                <span className="mb-3 inline-block rounded-full bg-[#FFF1B8] px-3 py-1 text-xs font-bold text-[#5B4A00]">
                  {t.menu.regular.sides}
                </span>
                <h3 className="mb-2 font-poppins text-lg font-bold">
                  {t.menu.regular.sidesTitle}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-[#17330A]/80">
                  Mashed Potatoes, Half sweet potato, Sweet Potato Mash, Pasta regular, Protein Pasta, Quinoa, Malanga, Batata, Mangú, Rice, Yuca, Roasted Baby Potatoes, Roasted Sweet Potatoes, or No Carb. Veggies: Mixto or none. Each meal includes 1 protein, 1 carb and 1 veggie.
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                <span className="text-xs font-semibold text-[#4A5A3C]">
                  {t.menu.regular.sides}
                </span>
                <span className="font-poppins text-sm font-extrabold text-[#2F6E00]">
                  {t.menu.regular.included}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Plato — tarjetas con imagen 4/3 y tag precio en esquina */}
        {activeTab === "plato" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {platoDishes.map((dish) => (
                <div
                  key={dish.src}
                  className="bg-white text-[#17330A] rounded-[24px] overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-[#FFF1B8]">
                    <Image
                      src={dish.src}
                      alt={dish.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 300px"
                      className="object-cover"
                    />
                    <span className="absolute top-4 right-4 bg-[#FDC305] text-[#17330A] font-poppins font-extrabold text-[13px] px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm">
                      {dish.price}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-poppins font-bold text-lg mb-1 leading-tight">
                      {dish.name}
                    </h3>
                    <p className="font-sans text-sm text-[#17330A]/80 leading-relaxed">
                      {dish.ingredients}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/pedido";
                      }}
                      className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#FDC305] px-6 font-poppins font-bold text-[13px] text-[#17330A] shadow-sm hover:bg-[#FFD43B] active:scale-95 transition-all cursor-pointer ${FOCUS}"
                    >
                      {t.hero.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* More Platos */}
            <div className="mt-8 bg-white text-[#17330A] rounded-[24px] p-6 shadow-sm">
              <h3 className="font-poppins font-bold text-lg mb-3">
                {t.menu.plato.more}
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Ground Beef, Pasta & Green Beans",
                  "Steak, Rice & Asparagus",
                  "Tuna Ceviche with Quinoa",
                  "Stuffed Plantain with Cheese & Broccoli",
                  "Chicken Wrap",
                  "Shrimp Alfredo Pasta with Asparagus",
                  "Salmon, Quinoa & Salad",
                ].map((dish) => (
                  <span
                    key={dish}
                    className="inline-flex items-center min-h-[44px] px-3.5 rounded-full bg-[#FFFBEA] border border-[#E6E2C8] text-[#17330A] text-xs font-semibold"
                  >
                    {dish}
                  </span>
                ))}
              </div>
              <p className="font-sans text-xs text-[#17330A]/70 mt-4">
                {t.menu.plato.note}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Keto — tarjetas con título, precio y botón */}
        {activeTab === "keto" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(t.menu.keto.dishes as Array<{ name: string; ingredients: string; protein: string }>).map(
                (dish, i) => {
                  const ketoPrices = ["$12.00", "$10.00", "$10.00"];
                  const ketoImages = [
                    "/carrusel/res-batata-esparragos.jpeg",
                    "/carrusel/pescado-arroz-vainitas.jpeg",
                    "/carrusel/salmon-quinoa-ensalada.jpeg",
                  ];
                  return (
                    <div
                      key={i}
                      className="bg-white text-[#17330A] rounded-[24px] overflow-hidden shadow-sm flex flex-col"
                    >
                      <div className="relative aspect-[4/3] bg-[#FFF1B8]">
                        <Image
                          src={ketoImages[i]}
                          alt={dish.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 300px"
                          className="object-cover"
                        />
                        <span className="absolute top-4 right-4 bg-[#FDC305] text-[#17330A] font-poppins font-extrabold text-[13px] px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm">
                          {ketoPrices[i]}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-poppins font-bold text-lg mb-1 leading-tight">
                          {dish.name}
                        </h3>
                        <p className="font-sans text-sm text-[#17330A]/80 leading-relaxed">
                          {dish.ingredients}
                        </p>
                        <p className="font-sans text-xs font-semibold text-[#2F6E00] mb-4">
                          {t.menu.keto.protein}: {dish.protein}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = "/pedido";
                          }}
                          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#FDC305] px-6 font-poppins font-bold text-[13px] text-[#17330A] shadow-sm hover:bg-[#FFD43B] active:scale-95 transition-all cursor-pointer ${FOCUS}"
                        >
                          {t.hero.cta}
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <p className="font-sans text-sm text-[#E8F3D6]/80 max-w-[640px] mt-4">
              {t.menu.keto.note}
            </p>
          </div>
        )}

        {/* Tab 4: Breakfast — como referencia móvil */}
        {activeTab === "breakfast" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-[#17330A]/20">
              <div className="relative aspect-[4/3] bg-[#FFF1B8]">
                <Image
                  src="/carrusel/desayuno-waffle-fresas.jpeg"
                  alt="Breakfast Waffles and Berries"
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover"
                />
                <span className="absolute top-4 right-4 bg-[#FDC305] text-[#17330A] font-poppins font-extrabold text-[13px] px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm">
                  $9.00
                </span>
              </div>
              <div className="p-6">
                <span className="inline-block bg-[#FFF1B8] text-[#5B4A00] text-xs font-bold px-3 py-1 rounded-full mb-3">
                  {t.menu.breakfast.badge}
                </span>
                <h3 className="font-poppins font-bold text-xl sm:text-2xl mb-2 leading-tight">
                  {t.menu.breakfast.title}
                </h3>
                <p className="font-sans text-base text-[#17330A]/85 leading-relaxed mb-6">
                  {t.menu.breakfast.text}
                </p>
                <div className="flex flex-wrap gap-2">
                  {breakfastItems.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center min-h-[44px] px-3.5 rounded-full bg-[#FFFBEA] border border-[#E6E2C8] text-[#17330A] text-xs font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#4A5A3C]">
                    {t.menu.breakfast.startingAt}
                  </span>
                  <span className="font-poppins font-extrabold text-xl text-[#2F6E00]">
                    $9.00
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Builder CTA below menu */}
        <div className="mt-12 text-center">
          <Link
            href="/pedido"
            className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-[#FDC305] px-8 font-poppins font-bold text-base text-[#17330A] shadow-sm hover:bg-[#FFD43B] hover:shadow-md active:scale-95 transition-all cursor-pointer ${FOCUS}"
          >
            {t.menu.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
