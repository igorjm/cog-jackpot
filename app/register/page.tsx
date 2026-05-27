"use client";

import { useState } from "react";
import { registerAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await registerAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-[family-name:var(--font-oswald)] font-bold uppercase text-[#FFD60A]">
            Criar Conta
          </h1>
          <p className="text-sm text-[#94B8D8]">
            Participe do bolão da Copa 2026
          </p>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <Input
            name="name"
            type="text"
            label="Nome completo"
            placeholder="João da Silva"
            required
          />
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            required
          />
          <Input
            name="nickname"
            type="text"
            label="Apelido (exibido no ranking)"
            placeholder="joaozinho"
            required
            minLength={2}
            maxLength={20}
          />
          <Input
            name="password"
            type="password"
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
          <Input
            name="confirmPassword"
            type="password"
            label="Confirmar senha"
            placeholder="••••••"
            required
            minLength={6}
          />

          {error && (
            <p className="text-sm text-[#EF4444] text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Criando..." : "Criar Conta"}
          </Button>

          <p className="text-xs text-[#5A7A9A] text-center">
            Após cadastro, você precisará realizar o pagamento da cota para participar.
          </p>
        </form>

        <p className="text-center text-sm text-[#94B8D8]">
          Já tem conta?{" "}
          <Link href="/login" className="text-[#38BDF8] hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
