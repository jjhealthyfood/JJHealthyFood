"use client";

import { useActionState, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Star } from "lucide-react";
import { login, type LoginState } from "@/controllers/auth.actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex flex-col md:items-center md:justify-center md:p-4 bg-surface">
      <div className="w-full md:max-w-[1100px] bg-surface-container-lowest md:rounded-3xl overflow-hidden flex flex-col md:flex-row md:min-h-[650px] md:shadow-2xl md:shadow-primary/10">
        {/* Imagen destacada (solo en movil) */}
        <div className="relative w-full h-[30vh] md:hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/10 to-surface" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 px-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/jj-meals-mark.png" alt="JJ Healthy Food" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-primary tracking-tight">
              JJ Healthy Food
            </h1>
            <p className="font-sans text-xs font-bold text-outline uppercase tracking-widest mt-1">
              Administración
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center">
          {/* Marca (solo en desktop) */}
          <div className="hidden md:block mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white border border-outline-variant rounded-xl flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/jj-meals-mark.png" alt="JJ Healthy Food" className="w-10 h-10 object-contain" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-primary tracking-tight">
                JJ Healthy Food
              </h1>
            </div>
            <p className="font-sans text-base text-on-surface-variant/80 ml-[60px]">
              Administración
            </p>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl md:text-[32px] font-semibold text-on-surface mb-2">
              Bienvenido de nuevo
            </h2>
            <p className="font-sans text-base text-on-surface-variant">
              Ingrese sus credenciales para gestionar el servicio.
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <label
                className="block font-sans text-xs font-bold text-on-surface-variant"
                htmlFor="email"
              >
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

            <div className="space-y-2">
              <label
                className="block font-sans text-xs font-bold text-on-surface-variant"
                htmlFor="password"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  className="block w-full h-14 pl-12 pr-12 bg-surface-container-lowest border border-outline-variant rounded-2xl font-sans text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {state?.error && (
              <p className="text-sm text-error font-sans" role="alert">
                {state.error}
              </p>
            )}

            <div className="flex items-center justify-end">
              <a
                href="/reset-password"
                className="font-sans text-sm font-semibold text-secondary hover:underline underline-offset-4"
              >
                ¿Olvidó su contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-primary text-on-primary font-sans text-sm font-semibold py-4 rounded-2xl hover:bg-primary/90 active:scale-95 disabled:opacity-70 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
            >
              <span>{pending ? "Entrando..." : "Entrar"}</span>
              {!pending && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-10 md:mt-12 text-center">
            <p className="font-sans text-xs text-on-surface-variant/60">
              © 2026 JJ Healthy Food. Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Imagen + testimonio (solo en desktop) */}
        <div className="hidden md:block w-1/2 relative bg-surface-container-high overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1604909052743-94e838986d24?w=900&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary via-primary/50 to-primary/20" />
          <div className="absolute bottom-16 left-12 right-12 z-30 p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Star className="text-secondary-container" size={18} fill="currentColor" />
                <span className="font-sans text-xs font-bold text-white uppercase tracking-widest">
                  Compromiso Saludable
                </span>
              </div>
              <p className="font-display text-2xl text-white">
                &ldquo;La excelencia en cada bocado comienza con la organización
                impecable.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
