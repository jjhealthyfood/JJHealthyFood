"use client";

import { useLanguage } from "@/lib/i18n";

export function Reviews() {
  const { t } = useLanguage();

  const reviews = t.reviews.items;

  return (
    <section id="reviews" className="bg-[#EAF4DC] mt-16">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <h2 className="font-poppins text-3xl sm:text-4xl font-extrabold text-[#17330A] text-center mb-10 tracking-tight">
          {t.reviews.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="bg-white border-[1.5px] border-[#E6E2C8] rounded-[24px] p-7 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-poppins font-bold text-base text-[#17330A] m-0">
                  {r.name}{" "}
                  {r.handle && (
                    <span className="font-sans font-normal text-xs text-[#4A5A3C] block sm:inline">
                      {r.handle}
                    </span>
                  )}
                </p>
              </div>

              {/* 5 Stars */}
              <div
                className="text-[#B26A00] tracking-[2px] text-lg font-bold mb-3 select-none"
                aria-label="5 out of 5 stars"
              >
                ★★★★★
              </div>

              <p className="font-sans text-sm text-[#17330A]/90 leading-relaxed m-0 italic">
                &ldquo;{r.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
