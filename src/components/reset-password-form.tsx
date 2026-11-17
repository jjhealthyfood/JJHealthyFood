"use client";

import { useActionState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { sendPasswordReset, type ResetState } from "@/controllers/auth.actions";

const initialState: ResetState = { error: null, success: false };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(sendPasswordReset, initialState);

  if (state.success) {
    return (
      <main className="min-h-screen flex flex-col md:items-center md:justify-center md:p-4 bg-surface">
        <div className="w-full md:max-w-md bg-surface-container-lowest md:rounded-3xl p-6 md:p-12 text-center">
          <div className="w-16 h-16 bg-tertiary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-tertiary" size={32} />
          </div>
          <h2 className="font-display text-2xl font-semibold text-on-surface mb-3">
            Correo enviado
          </h2>
          <p className="font-sans text-on-surface-variant mb-8">
            Revisa tu bandeja de entrada y sigue el enlace para crear una nueva contraseña.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-secondary hover:underline"
          >
            Volver al login
          </a>
        </div>
      </main>
    );
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
            Recuperar contraseña
          </h2>
          <p className="font-sans text-sm text-on-surface-variant mb-8">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-sans text-xs font-bold text-on-surface-variant" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="jjhealthyfood@gmail.com"
                  className="block w-full h-14 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-2xl font-sans text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {state?.error && (
              <p className="text-sm text-error font-sans" role="alert">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-primary text-on-primary font-sans text-sm font-semibold py-4 rounded-2xl hover:bg-primary/90 active:scale-95 disabled:opacity-70 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
            >
              <span>{pending ? "Enviando..." : "Enviar enlace"}</span>
              {!pending && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <a
              href="/login"
              className="font-sans text-sm font-semibold text-secondary hover:underline underline-offset-4"
            >
              Volver al login
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
