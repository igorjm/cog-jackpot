"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { avatarSchema } from "@/lib/validations";
import { checkRateLimited } from "@/lib/rate-limit";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  nickname: z
    .string()
    .min(2, "Apelido deve ter no mínimo 2 caracteres")
    .max(20, "Apelido deve ter no máximo 20 caracteres"),
  avatar: avatarSchema.optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z.string().min(8, "Nova senha deve ter no mínimo 8 caracteres"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Senhas não conferem",
    path: ["confirmNewPassword"],
  });

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" };

  const raw = {
    name: formData.get("name") as string,
    nickname: formData.get("nickname") as string,
    avatar: (formData.get("avatar") as string) || undefined,
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, nickname, avatar } = parsed.data;

  try {
    const existingNickname = await prisma.user.findFirst({
      where: { nickname, id: { not: session.user.id } },
    });
    if (existingNickname) {
      return { error: "Este apelido já está em uso." };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        nickname,
        avatar: avatar || null,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/ranking");
    return { success: true };
  } catch (e) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "Erro ao atualizar perfil. Tente novamente." };
  }
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" };

  if (await checkRateLimited(`change-password:${session.user.id}`, 5, 15 * 60 * 1000)) {
    return { error: "Muitas tentativas. Aguarde 15 minutos." };
  }

  const raw = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmNewPassword: formData.get("confirmNewPassword") as string,
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });
    if (!user) return { error: "Usuário não encontrado" };

    const isValid = await compare(parsed.data.currentPassword, user.password);
    if (!isValid) {
      return { error: "Senha atual incorreta" };
    }

    const hashedPassword = await hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (e) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "Erro ao alterar senha. Tente novamente." };
  }
}
