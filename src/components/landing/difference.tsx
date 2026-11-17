"use client";

import { useLanguage } from "@/lib/i18n";

export function Difference() {
  const { t } = useLanguage();

  return (
    <section className="max-w-[1160px] mx-auto px-5 sm:px-6 pt-20 pb-10">
      <div className="mb-8">
        <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-[#17330A] mb-2 tracking-tight">
          {t.difference.title}
        </h2>
        <p className="font-sans text-base sm:text-lg text-[#17330A]/80 max-w-[640px] leading-relaxed">
          {t.difference.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {t.difference.items.map((item, i) => (
          <div
            key={i}
            className="bg-white border-[1.5px] border-[#E6E2C8] rounded-[24px] p-7 transition-all duration-200 hover:shadow-md motion-safe:hover:-translate-y-1 flex flex-col justify-start"
          >
            {/* Custom organic leaf shape: rounded-tr-full rounded-bl-full */}
            <div className="w-9 h-9 bg-[#2F6E00] rounded-tr-[100%] rounded-bl-[100%] mb-4 shadow-2xs" />
            <h3 className="font-poppins font-bold text-lg text-[#17330A] mb-2">
              {item.title}
            </h3>
            <p className="font-sans text-sm text-[#17330A]/85 leading-relaxed m-0">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
