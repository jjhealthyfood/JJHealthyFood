"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReceiptText, Users, UtensilsCrossed, MessageSquare, LogOut } from "lucide-react";
import { logout } from "@/controllers/auth.actions";

const links = [
  { href: "/dashboard", label: "Pedidos", icon: ReceiptText },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/menu", label: "Menú semanal", icon: UtensilsCrossed },
  { href: "/dashboard/sugerencias", label: "Buzón de sugerencias", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-[280px] bg-primary flex-col py-6 z-50">
      <Link href="/dashboard" className="px-6 mb-10 flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-12 h-12 shrink-0 rounded-xl bg-white flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/jj-meals-mark.png" alt="JJ Healthy Food" className="w-10 h-10 object-contain" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold text-on-primary leading-tight">
            JJ Healthy Food
          </h1>
          <p className="font-sans text-xs font-bold text-on-primary/60 uppercase tracking-widest mt-0.5">
            Administración
          </p>
        </div>
      </Link>

      <nav className="flex-1 flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-3 transition-colors duration-200 ${
                active
                  ? "bg-white/15 border-l-4 border-secondary text-on-primary"
                  : "text-on-primary/70 hover:bg-white/10 border-l-4 border-transparent"
              }`}
            >
              <Icon size={20} />
              <span className="font-sans text-sm font-semibold">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto flex flex-col gap-6">
        <form action={logout} className="pt-6 border-t border-white/10">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-2 py-3 text-on-primary/70 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="font-sans text-sm font-semibold">Salir</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
