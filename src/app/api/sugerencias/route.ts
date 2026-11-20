import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, anonimo, mensaje } = body;

    if (!mensaje || !mensaje.trim()) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("sugerencias").insert({
      nombre: anonimo ? null : (nombre?.trim() || null),
      anonimo: Boolean(anonimo),
      mensaje: mensaje.trim(),
    });

    if (error) {
      console.error("Error insertando sugerencia:", error);
      return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
