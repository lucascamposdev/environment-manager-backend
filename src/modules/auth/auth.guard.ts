import type { FastifyReply, FastifyRequest } from "fastify"
import { Exception } from "../../exceptions/Exception.js"
import type { Role } from "../../generated/prisma/enums.js"
import { prisma } from "../../lib/prisma.js"
import { hasMinimumRole } from "../../shared/roles.js"

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (!request.session.userId) {
    throw new Exception("Not authenticated", 401)
  }
}

export function requireRole(minimum: Role) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.session.userId) {
      throw new Exception("Not authenticated", 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: request.session.userId },
      select: { role: true }
    })

    if (!user || !hasMinimumRole(user.role, minimum)) {
      throw new Exception("Insufficient permissions", 403)
    }
  }
}
