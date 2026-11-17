"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export function StickyOrderButton() {
  const { t } = useLanguage();
  const [oculto, setOculto] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const objetivo = document.getElementById("final-cta");
    const footer = document.querySelector("footer");
    const objetivos = [hero, objetivo, footer].filter(Boolean) as Element[];

    if (!objetivos.length || !("IntersectionObserver" in window)) return;

    const visibles = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibles.add(entry.target);
          else visibles.delete(entry.target);
        }
        setOculto(visibles.size > 0);
      },
      { threshold: 0.12 }
    );

    objetivos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      href="/pedido"
      tabIndex={oculto ? -1 : 0}
      aria-hidden={oculto}
      className={`fixed bottom-4 left-4 right-4 z-50 inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#17330A] px-6 font-poppins text-base font-bold text-white shadow-[0_14px_34px_rgba(23,51,10,0.35)] transition-all duration-200 hover:bg-[#255011] active:scale-[0.98] sm:bottom-6 sm:left-auto sm:right-6 sm:min-h-[48px] sm:w-auto sm:px-7 sm:text-sm motion-reduce:transition-none ${
        oculto
          ? "pointer-events-none translate-y-6 opacity-0"
          : "pointer-events-auto translate-y-0 opacity-100"
      }`}
    >
      {t.nav.order}
    </Link>
  );
}
