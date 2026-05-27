"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/derlis.png')" }}>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-[family-name:var(--font-oswald)] font-bold uppercase text-[#FFD60A] drop-shadow-lg">
            Bolão Copa do Mundo 2026
          </h1>
          <p className="text-sm text-white/80">
            Entre na disputa com seus amigos
          </p>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4 bg-[#0A1A3A]/80 backdrop-blur-md rounded-2xl p-6 border border-[#FFD60A]/20 shadow-2xl">
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            required
          />
          <Input
            name="password"
            type="password"
            label="Senha"
            placeholder="••••••"
            required
            minLength={6}
          />

          {error && (
            <p className="text-sm text-[#EF4444] text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-white/80">
          Não tem conta?{" "}
          <Link href="/register" className="text-[#FFD60A] hover:underline font-medium">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
