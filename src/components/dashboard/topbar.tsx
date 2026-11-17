"use client";
import Link from "next/link";
import { Settings } from "lucide-react";
import { NotificationsDropdown } from "./notifications-dropdown";
import { AdminProfileDropdown } from "./admin-profile-dropdown";
import { logout } from "@/controllers/auth.actions";

interface PedidoNotificacion {
  id: string;
  clienta_nombre: string;
  dia_entrega: string;
  precio_total: number;
  fecha_pedido: string;
}

export function Topbar({
  adminEmail,
  pedidosPendientes,
}: {
  adminEmail: string;
  pedidosPendientes: PedidoNotificacion[];
}) {
  return (
    <>
      {/* Barra superior de escritorio */}
      <header className="hidden md:flex fixed top-0 left-[280px] w-[calc(100%-280px)] h-16 bg-surface border-b border-outline-variant items-center justify-end px-6 z-40">
        <div className="flex items-center gap-4">
          <NotificationsDropdown pedidosIniciales={pedidosPendientes} />
          <div className="h-8 w-px bg-outline-variant mx-2" />
          <AdminProfileDropdown adminEmail={adminEmail} logout={logout} />
        </div>
      </header>

      {/* Barra superior movil */}
      <header className="md:hidden flex justify-between items-center w-full px-4 h-16 bg-surface sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/jj-meals-mark.png" alt="JJ Healthy Food" className="w-10 h-10 object-contain" />
          <h1 className="font-display text-lg font-bold text-primary">
            JJ Healthy Food
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationsDropdown pedidosIniciales={pedidosPendientes} />
          <Link
            href="/dashboard/configuracion"
            className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors"
          >
            <Settings size={20} />
          </Link>
        </div>
      </header>
    </>
  );
}
