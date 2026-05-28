import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    nickname: z
      .string()
      .min(2, "Apelido deve ter no mínimo 2 caracteres")
      .max(20, "Apelido deve ter no máximo 20 caracteres"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string(),
    avatar: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export const betSchema = z.object({
  matchId: z.string(),
  homeScore: z.number().min(0).max(20),
  awayScore: z.number().min(0).max(20),
});

export const resultSchema = z.object({
  matchId: z.string(),
  homeScore: z.number().min(0).max(20),
  awayScore: z.number().min(0).max(20),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BetInput = z.infer<typeof betSchema>;
export type ResultInput = z.infer<typeof resultSchema>;
