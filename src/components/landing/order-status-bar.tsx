"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

/**
 * Horario de pedidos. Edita aquí los días y la hora de cierre.
 * openDays usa el formato de Date#getDay(): 0 = domingo … 6 = sábado.
 */
export const ORDERS_CONFIG = {
  openDays: [1, 2, 3, 4, 5], // lunes a viernes
  closeHour: 18, // 6:00 PM
  timezone: "America/New_York",
};

const DAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function estaAbierto(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ORDERS_CONFIG.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const day = DAY_INDEX[parts.find((p) => p.type === "weekday")?.value ?? ""] ?? -1;
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);

  if (!ORDERS_CONFIG.openDays.includes(day)) return false;
  return hour * 60 + minute < ORDERS_CONFIG.closeHour * 60;
}

export function OrderStatusBar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOpen(estaAbierto());
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  // Evita parpadeos y desajustes de hidratación: el estado se calcula en el cliente.
  if (open === null) {
    return <div className="h-8 bg-[#17330A]" aria-hidden="true" />;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.08em] sm:text-xs ${
        open ? "bg-[#2F6E00] text-white" : "bg-[#FDC305] text-[#17330A]"
      }`}
    >
      <span className="inline-flex items-center justify-center gap-2">
        <span
          aria-hidden="true"
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            open ? "bg-[#FDC305]" : "bg-[#17330A]"
          }`}
        />
        {open ? t.status.open : t.status.closed}
      </span>
    </div>
  );
}
