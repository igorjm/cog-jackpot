import { z } from "zod";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const emailField = z
  .string()
  .trim()
  .transform(normalizeEmail)
  .pipe(z.string().email("Email inválido"));

export const avatarSchema = z
  .string()
  .regex(
    /^\/avatar\/[\w-]+\/[\w.-]+\.(png|jpg|jpeg|webp)$/i,
    "Avatar inválido"
  );

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: emailField,
    nickname: z
      .string()
      .min(2, "Apelido deve ter no mínimo 2 caracteres")
      .max(20, "Apelido deve ter no máximo 20 caracteres"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string(),
    avatar: avatarSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export const betSchema = z.object({
  matchId: z.string().cuid("ID de jogo inválido"),
  homeScore: z.number().min(0).max(20),
  awayScore: z.number().min(0).max(20),
});

export const resultSchema = z.object({
  matchId: z.string().cuid("ID de jogo inválido"),
  homeScore: z.number().min(0).max(20),
  awayScore: z.number().min(0).max(20),
});

export const predictionValueSchema = z
  .string()
  .trim()
  .min(1, "Valor não pode ser vazio")
  .max(100, "Valor deve ter no máximo 100 caracteres");

export const notificationSchema = z.object({
  title: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(500),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BetInput = z.infer<typeof betSchema>;
export type ResultInput = z.infer<typeof resultSchema>;
