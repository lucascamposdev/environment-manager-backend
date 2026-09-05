import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("invalid email"),
  password: z.string().min(1, "password is required")
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("invalid email")
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "token is required"),
  password: z.string().min(6, "password must have at least 6 characters")
})

export type LoginInput = z.infer<typeof loginSchema>
