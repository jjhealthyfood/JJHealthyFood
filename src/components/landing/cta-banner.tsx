"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

const FOCUS =
  "focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-current";

export function CtaBanner() {
  const { t } = useLanguage();

  return (
    <section id="final-cta" className="bg-[#FDC305]">
      <div className="mx-auto flex max-w-[1160px] flex-col items-start gap-6 px-5 py-12 sm:px-6 sm:py-14 md:flex-row md:items-center md:justify-between">
        <h2 className="max-w-[560px] font-poppins text-3xl font-extrabold leading-tight tracking-tight text-[#17330A] sm:text-4xl">
          {t.cta.title}
        </h2>
        <Link
          href="/pedido"
          className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#17330A] px-8 font-poppins text-base font-bold text-white shadow-md transition-all hover:bg-[#255011] hover:shadow-lg active:scale-95 sm:w-auto ${FOCUS}`}
        >
          {t.cta.button}
        </Link>
      </div>
    </section>
  );
}
