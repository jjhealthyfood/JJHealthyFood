"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Leaf } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { BrandRibbon } from "./brand-ribbon";

const FOCUS =
  "focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-current";

type HeroPhotoProps = {
  src: string;
  alt: string;
  className: string;
  priority?: boolean;
};

function HeroPhoto({ src, alt, className, priority }: HeroPhotoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`aspect-square overflow-hidden rounded-full bg-[#FFF1B8] shadow-[0_18px_44px_rgba(23,51,10,0.22)] ring-4 ring-[#FFFBEA] ${className}`}
    >
      {failed ? (
        <div
          role="img"
          aria-label={alt}
          className="flex h-full w-full items-center justify-center text-[#2F6E00]"
        >
          <Leaf size={44} strokeWidth={1.5} aria-hidden="true" />
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 210px, 280px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-[#FFF1B8] via-[#FFFBEA] to-[#FFFBEA]"
    >
      {/* Decoración: alas de abeja + hojas, baja opacidad, sin capturar clics */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <svg
          className="absolute -right-24 -top-20 h-[320px] w-[320px] text-[#FDC305] opacity-[0.16] sm:-right-16 sm:-top-24 sm:h-[460px] sm:w-[460px]"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <ellipse cx="66" cy="72" rx="62" ry="33" transform="rotate(-24 66 72)" />
          <ellipse cx="132" cy="58" rx="44" ry="25" transform="rotate(28 132 58)" />
        </svg>
        <svg
          className="absolute -left-20 bottom-0 h-[240px] w-[240px] text-[#2F6E00] opacity-[0.08] sm:-left-10 sm:h-[320px] sm:w-[320px]"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M28 176C10 126 44 66 122 34c8 62-12 112-58 132-12 5-24 8-36 10Z" />
          <path d="M120 182c-2-52 30-96 78-110 0 56-32 96-78 110Z" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1160px] grid-cols-1 items-center gap-8 px-5 pb-12 pt-10 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
        {/* Left column */}
        <div className="flex flex-col items-start gap-5 lg:col-span-7 lg:gap-6">
          <span className="inline-flex items-center rounded-full bg-[#2F6E00] px-4 py-2 font-poppins text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-xs sm:text-xs">
            {t.hero.badge}
          </span>

          <h1 className="font-poppins text-[36px] font-extrabold leading-[1.08] tracking-tight text-[#17330A] sm:text-5xl lg:text-[56px]">
            {t.hero.title.split(" ").map((word, i) => {
              const clean = word.toLowerCase().replace(/[.,]/g, "");
              const resaltar = clean === "healthy" || clean === "saludables";
              return (
                <span key={i}>
                  {resaltar ? (
                    <span
                      className="px-0.5"
                      style={{
                        backgroundImage:
                          "linear-gradient(transparent calc(100% - 10px), #FDC305 calc(100% - 10px))",
                      }}
                    >
                      {word}
                    </span>
                  ) : (
                    word
                  )}{" "}
                </span>
              );
            })}
          </h1>

          <p className="max-w-[520px] font-sans text-[17px] leading-[1.55] text-[#17330A] sm:text-[19px]">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/pedido"
              className={`inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#FDC305] px-7 font-poppins text-base font-bold text-[#17330A] shadow-sm transition-all hover:bg-[#FFD43B] hover:shadow-md active:scale-95 sm:px-8 ${FOCUS}`}
            >
              {t.hero.cta}
            </Link>
            <Link
              href="#week-menu"
              className={`inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-[#2F6E00] bg-white px-6 font-poppins text-base font-bold text-[#17330A] transition-all hover:bg-[#FFF3C4] active:scale-95 sm:px-7 ${FOCUS}`}
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {t.hero.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex min-h-[40px] items-center rounded-full border-[1.5px] border-[#CFCBA8] bg-white px-4 font-sans text-[13px] font-medium text-[#17330A] shadow-2xs"
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Franja de marca: divide el texto de las fotos en móvil */}
          <div className="-mx-5 mt-1 sm:-mx-6 lg:hidden">
            <BrandRibbon />
          </div>
        </div>

        {/* Right column: overlapping plate photos with stickers */}
        <div className="lg:col-span-5">
          <div className="relative mx-auto h-[290px] w-full max-w-[360px] sm:h-[380px] sm:max-w-[440px] lg:h-[420px]">
            <HeroPhoto
              src="/images/hero-2.jpg"
              alt="Steak with sweet potato and asparagus"
              priority
              className="absolute right-[4%] top-[2%] z-20 w-[50%]"
            />
            <HeroPhoto
              src="/images/hero-1.jpg"
              alt="Salmon, quinoa and green salad"
              className="absolute left-[4%] top-[28%] z-10 w-[44%]"
            />
            <HeroPhoto
              src="/images/hero-3.jpg"
              alt="Chicken wrap with fresh vegetables"
              className="absolute bottom-[8%] left-1/2 z-30 w-[39%] -translate-x-1/2"
            />

            <span className="absolute -left-1 top-[3%] z-40 -rotate-[4deg] rounded-[14px] border-2 border-white bg-[#FDC305] px-3 py-1.5 font-poppins text-[11px] font-extrabold text-[#17330A] shadow-md sm:left-0 sm:text-xs">
              From $9
            </span>
            <span className="absolute right-0 top-[9%] z-40 rotate-[3deg] rounded-[14px] border-2 border-white bg-[#FDC305] px-3 py-1.5 font-poppins text-[11px] font-extrabold text-[#17330A] shadow-md sm:text-xs">
              NEW Keto
            </span>
            <span className="absolute bottom-[4%] right-[2%] z-40 -rotate-[3deg] rounded-[14px] border-2 border-white bg-[#FDC305] px-3 py-1.5 font-poppins text-[11px] font-extrabold text-[#17330A] shadow-md sm:text-xs">
              Pickup Sun/Mon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
