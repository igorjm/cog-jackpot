"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import { redirect } from "next/navigation";
import { checkRateLimited } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function registerAction(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (await checkRateLimited(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return { error: "Muitas tentativas. Aguarde 15 minutos." };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    nickname: formData.get("nickname") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    avatar: (formData.get("avatar") as string) || undefined,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { error: "Corrija os campos abaixo.", fieldErrors };
  }

  const { name, email, nickname, password, avatar } = parsed.data;

  try {
    const existingEmail = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (existingEmail) {
      return { error: "Email já cadastrado.", fieldErrors: { email: "Este email já está em uso" } };
    }

    const existingNickname = await prisma.user.findUnique({ where: { nickname } });
    if (existingNickname) {
      return { error: "Apelido já em uso.", fieldErrors: { nickname: "Este apelido já está em uso" } };
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        nickname,
        password: hashedPassword,
        avatar: avatar || null,
        role: "USER",
        status: "PENDING_PAYMENT",
      },
    });

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    redirect("/pending");
  } catch (e) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "Erro ao criar conta. Tente novamente." };
  }
}

export async function loginAction(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (await checkRateLimited(`login:${ip}`, 5, 15 * 60 * 1000)) {
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

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof Error && "digest" in e) throw e;
    console.error("[loginAction] signIn error:", e);
    return { error: "Email ou senha inválidos" };
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (!user) return { error: "Email ou senha inválidos" };

  if (user.status === "PENDING_PAYMENT") redirect("/pending");
  if (user.status === "REJECTED") redirect("/rejected");
  redirect("/dashboard");
}
