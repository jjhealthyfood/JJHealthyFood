"use client";

import { useEffect } from "react";
import { imprimirComanda } from "@/lib/imprimir-comanda";

export function AutoPrint() {
  useEffect(() => {
    imprimirComanda();
  }, []);

  return null;
}
