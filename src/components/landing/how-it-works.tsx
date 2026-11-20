"use client";

import { useLanguage } from "@/lib/i18n";
import { Microwave } from "lucide-react";

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how" className="max-w-[1160px] mx-auto px-5 sm:px-6 pt-20 pb-10">
      <div className="mb-8">
        <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-[#17330A] mb-2 tracking-tight">
          {t.how.title}
        </h2>
        <p className="font-sans text-base sm:text-lg text-[#17330A]/80">
          {t.how.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {t.how.steps.map((step, i) => (
          <div
            key={i}
            className="bg-white border-[1.5px] border-[#E6E2C8] rounded-[24px] p-7 transition-all duration-200 hover:shadow-md motion-safe:hover:-translate-y-1 flex flex-col justify-start"
          >
            <div className="w-11 h-11 rounded-full bg-[#FDC305] text-[#17330A] flex items-center justify-center font-poppins font-extrabold text-xl mb-4 shadow-2xs">
              {i + 1}
            </div>
            <h3 className="font-poppins font-bold text-lg text-[#17330A] mb-2">
              {step.title}
            </h3>
            <p className="font-sans text-sm text-[#17330A]/85 leading-relaxed m-0">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-4 rounded-[24px] border-[1.5px] border-[#D7E3C0] bg-[#EAF4DC] p-5 sm:p-6">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#2F6E00] text-white shadow-2xs">
          <Microwave size={22} />
        </span>
        <div>
          <h3 className="font-poppins text-base sm:text-lg font-extrabold text-[#17330A]">
            {t.how.microwaveTitle}
          </h3>
          <p className="font-sans text-sm sm:text-base text-[#17330A]/80 leading-relaxed">
            {t.how.microwaveText}
          </p>
        </div>
      </div>
    </section>
  );
}
