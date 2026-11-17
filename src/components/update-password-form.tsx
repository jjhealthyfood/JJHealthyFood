"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("No pudimos actualizar la contraseña. Intenta de nuevo.");
      setPending(false);
      return;
    }

    router.push("/login");
  }

  return (
    <main className="min-h-screen flex flex-col md:items-center md:justify-center md:p-4 bg-surface">
      <div className="w-full md:max-w-md bg-surface-container-lowest md:rounded-3xl overflow-hidden">
        <div className="p-6 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white border border-outline-variant rounded-xl flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/jj-meals-mark.png" alt="JJ Healthy Food" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-primary">
              JJ Healthy Food
            </h1>
          </div>

          <h2 className="font-display text-2xl font-semibold text-on-surface mb-2">
            Nueva contraseña
          </h2>
          <p className="font-sans text-sm text-on-surface-variant mb-8">
            Ingresa tu nueva contraseña abaixo.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-sans text-xs font-bold text-on-surface-variant" htmlFor="password">
                Nueva contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  className="block w-full h-14 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-2xl font-sans text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-sans text-xs font-bold text-on-surface-variant" htmlFor="confirmPassword">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                  <Lock size={20} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  className="block w-full h-14 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-2xl font-sans text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-error font-sans" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-primary text-on-primary font-sans text-sm font-semibold py-4 rounded-2xl hover:bg-primary/90 active:scale-95 disabled:opacity-70 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
            >
              <span>{pending ? "Guardando..." : "Guardar contraseña"}</span>
              {!pending && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
