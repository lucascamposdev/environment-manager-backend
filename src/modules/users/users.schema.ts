import { z } from "zod"
import { Role } from "../../generated/prisma/enums.js"

export const createUserSchema = z.object({
  email: z.string().email("invalid email"),
  password: z.string().min(6, "password must have at least 6 characters")
})

export const updateRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"], "Invalid role")
})

export const updateProfileSchema = z.object({
  password: z.string().min(6, "password must have at least 6 characters"),
  currentPassword: z.string().min(1, "currentPassword is required")
})

export type CreateUserInput = z.infer<typeof createUserSchema>
