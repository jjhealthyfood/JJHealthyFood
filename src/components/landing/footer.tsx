"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#17330A] text-[#E8F3D6]">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-6 py-8 flex items-center justify-between gap-4 flex-wrap text-sm">
        <Link
          href="/"
          className="font-poppins font-extrabold text-xl text-[#FDC305] tracking-tight hover:opacity-90 transition-opacity"
        >
          JJ Meals
        </Link>

        <a
          href="https://instagram.com/jjhealthyfood13"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#FDC305] transition-colors font-medium flex items-center gap-1.5"
        >
          <span>Instagram:</span>
          <b>@jjhealthyfood13</b>
        </a>

        <span className="text-xs text-[#E8F3D6]/70">
          © {new Date().getFullYear()} JJ Meals. {t.footer.rights}
        </span>
      </div>
    </footer>
  );
}
