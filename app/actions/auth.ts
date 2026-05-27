"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import { redirect } from "next/navigation";
import { isRateLimited } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function registerAction(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return { error: "Muitas tentativas. Aguarde 15 minutos." };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    nickname: formData.get("nickname") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, nickname, password } = parsed.data;

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return { error: "Não foi possível criar a conta. Verifique os dados." };
    }

    const existingNickname = await prisma.user.findUnique({ where: { nickname } });
    if (existingNickname) {
      return { error: "Não foi possível criar a conta. Verifique os dados." };
    }

    const hashedPassword = await hash(password, 12);

    const isAdmin = email === process.env.ADMIN_EMAIL;

    await prisma.user.create({
      data: {
        name,
        email,
        nickname,
        password: hashedPassword,
        role: isAdmin ? "ADMIN" : "USER",
        status: isAdmin ? "APPROVED" : "PENDING_PAYMENT",
      },
    });

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    redirect(isAdmin ? "/dashboard" : "/pending");
  } catch (e) {
    if (e instanceof Error && "digest" in e) throw e; // Next.js redirect
    return { error: "Erro ao criar conta. Tente novamente." };
  }
}

export async function loginAction(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return { error: "Muitas tentativas. Aguarde 15 minutos." };
  }

  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      email: raw.email,
      password: raw.password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof Error && "digest" in e) throw e; // Next.js redirect
    return { error: "Email ou senha inválidos" };
  }

  // Check user status for redirect
  const user = await prisma.user.findUnique({ where: { email: raw.email } });
  if (!user) return { error: "Usuário não encontrado" };

  if (user.status === "PENDING_PAYMENT") redirect("/pending");
  if (user.status === "REJECTED") redirect("/rejected");
  redirect("/dashboard");
}
