"use client";

import { useState } from "react";
import { registerAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BackgroundMusic } from "@/components/background-music";
import { AvatarPicker } from "@/components/avatar-picker";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState("");

  function validateField(name: string, value: string, formData?: FormData) {
    switch (name) {
      case "name":
        if (!value.trim()) return "Nome é obrigatório";
        if (value.trim().length < 2) return "Nome deve ter no mínimo 2 caracteres";
        return "";
      case "email":
        if (!value.trim()) return "Email é obrigatório";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email inválido";
        return "";
      case "nickname":
        if (!value.trim()) return "Apelido é obrigatório";
        if (value.trim().length < 2) return "Apelido deve ter no mínimo 2 caracteres";
        if (value.trim().length > 20) return "Apelido deve ter no máximo 20 caracteres";
        if (!/^[a-zA-Z0-9_-]+$/.test(value.trim()))
          return "Apelido só pode ter letras, números, _ e -";
        return "";
      case "password":
        if (!value) return "Senha é obrigatória";
        if (value.length < 8) return "Senha deve ter no mínimo 8 caracteres";
        return "";
      case "confirmPassword": {
        if (!value) return "Confirmação é obrigatória";
        const password = formData?.get("password") as string;
        if (password && value !== password) return "Senhas não conferem";
        return "";
      }
      default:
        return "";
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value, form } = e.target;
    const formData = form ? new FormData(form) : undefined;
    const fieldError = validateField(name, value, formData);
    setFieldErrors((prev) => ({ ...prev, [name]: fieldError }));
  }

  function validateAll(formData: FormData): boolean {
    const fields = ["name", "email", "nickname", "password", "confirmPassword"];
    const errors: Record<string, string> = {};
    let valid = true;

    for (const field of fields) {
      const value = (formData.get(field) as string) || "";
      const fieldError = validateField(field, value, formData);
      if (fieldError) {
        errors[field] = fieldError;
        valid = false;
      }
    }

    setFieldErrors(errors);
    return valid;
  }

  async function handleSubmit(formData: FormData) {
    setError("");

    if (!validateAll(formData)) return;

    setLoading(true);
    const result = await registerAction(formData);
    if (result?.error) {
      setError(result.error);
      if (result.fieldErrors) {
        setFieldErrors((prev) => ({ ...prev, ...result.fieldErrors }));
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      {/* Diagonal background split */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.07]"
          style={{
            backgroundImage: "url('/background-app.png')",
            clipPath: "polygon(100% 0, 100% 100%, 0 100%, 40% 0)",
          }}
        />
      </div>
      <BackgroundMusic src="/background-music.m4a" />
      <div className="w-full max-w-sm space-y-8 relative z-10">
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
            minLength={2}
            error={fieldErrors.name}
            onBlur={handleBlur}
          />
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            required
            error={fieldErrors.email}
            onBlur={handleBlur}
          />
          <Input
            name="nickname"
            type="text"
            label="Apelido (exibido no ranking)"
            placeholder="joaozinho"
            required
            minLength={2}
            maxLength={20}
            error={fieldErrors.nickname}
            onBlur={handleBlur}
          />
          <Input
            name="password"
            type="password"
            label="Senha"
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
            error={fieldErrors.password}
            onBlur={handleBlur}
          />
          <Input
            name="confirmPassword"
            type="password"
            label="Confirmar senha"
            placeholder="••••••"
            required
            minLength={8}
            error={fieldErrors.confirmPassword}
            onBlur={handleBlur}
          />

          <AvatarPicker value={avatar} onChange={setAvatar} />
          <input type="hidden" name="avatar" value={avatar} />

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
