"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage, LanguageToggle } from "@/lib/i18n";

const FOCUS =
  "focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-current";

export function Navbar() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-[1.5px] border-[#E6E2C8] bg-white shadow-[0_2px_12px_rgba(23,51,10,0.06)]">
      <div className="mx-auto flex min-h-[68px] max-w-[1160px] items-center justify-between gap-2 px-4 sm:min-h-[76px] sm:gap-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="JJ Meals — home"
          className="group flex shrink-0 items-center gap-2 rounded-full sm:gap-3"
        >
          <Image
            src="/brand/jj-meals-mark.png"
            alt=""
            width={48}
            height={48}
            priority
            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          />
          <span className="font-poppins text-[19px] font-extrabold tracking-tight text-[#2F6E00] transition-colors group-hover:text-[#17330A] sm:text-[22px]">
            JJ Meals
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 text-[15px] font-medium text-[#17330A] md:flex">
          <Link
            href="#how"
            className={`rounded transition-colors hover:text-[#2F6E00] ${FOCUS}`}
          >
            {t.nav.how}
          </Link>
          <Link
            href="#menu"
            className={`rounded transition-colors hover:text-[#2F6E00] ${FOCUS}`}
          >
            {t.nav.menu}
          </Link>
          <Link
            href="#reviews"
            className={`rounded transition-colors hover:text-[#2F6E00] ${FOCUS}`}
          >
            {t.nav.reviews}
          </Link>
        </nav>

        {/* CTA + language + mobile menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline-flex">
            <LanguageToggle className="" />
          </span>
          <Link
            href="/pedido"
            className={`inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full bg-[#FDC305] px-3.5 font-poppins text-[12px] font-bold text-[#17330A] shadow-xs transition-all hover:bg-[#FFD43B] hover:shadow active:scale-95 sm:min-h-[48px] sm:px-6 sm:text-sm ${FOCUS}`}
          >
            {t.nav.order}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#17330A] transition-colors hover:bg-[#FFF3C4] md:hidden ${FOCUS}`}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-[#E6E2C8] bg-white px-5 py-4 md:hidden"
        >
          <nav className="flex flex-col">
            <Link
              href="#how"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded py-3 font-medium text-[#17330A] hover:text-[#2F6E00] ${FOCUS}`}
            >
              {t.nav.how}
            </Link>
            <Link
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded py-3 font-medium text-[#17330A] hover:text-[#2F6E00] ${FOCUS}`}
            >
              {t.nav.menu}
            </Link>
            <Link
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded py-3 font-medium text-[#17330A] hover:text-[#2F6E00] ${FOCUS}`}
            >
              {t.nav.reviews}
            </Link>
          </nav>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#E6E2C8] pt-4">
            <LanguageToggle className="" />
            <Link
              href="/pedido"
              onClick={() => setMobileMenuOpen(false)}
              className={`inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#FDC305] px-5 font-poppins text-sm font-bold text-[#17330A] shadow-xs ${FOCUS}`}
            >
              {t.nav.order}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
