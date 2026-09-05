import type { Role } from "../generated/prisma/enums.js"

const ROLE_LEVELS: Record<Role, number> = {
  USER: 0,
  ADMIN: 1,
  SUPERADMIN: 2
}

export function hasMinimumRole(role: Role, minimum: Role): boolean {
  return ROLE_LEVELS[role] >= ROLE_LEVELS[minimum]
}
