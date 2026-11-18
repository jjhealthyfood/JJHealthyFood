"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

/** Icono de Instagram (SVG propio, hereda el color del texto). */
function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
          aria-label="Instagram: @jjhealthyfood13"
          className="group inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#E8F3D6]/25 px-3.5 font-medium transition-colors hover:border-[#FDC305] hover:text-[#FDC305] focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-current"
        >
          <InstagramIcon className="text-[#FDC305] transition-transform group-hover:scale-110 motion-reduce:transform-none" />
          <span>@jjhealthyfood13</span>
        </a>

        <span className="text-xs text-[#E8F3D6]/70">
          © {new Date().getFullYear()} JJ Meals. {t.footer.rights}
        </span>
      </div>
    </footer>
  );
}
