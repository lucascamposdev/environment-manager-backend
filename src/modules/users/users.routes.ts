import { type FastifyInstance } from "fastify"
import { usersController } from "./users.controller.js"
import { requireAuth, requireRole } from "../auth/auth.guard.js"

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: requireRole("ADMIN") }, usersController.list)
  app.post(
    "/",
    { preHandler: [requireRole("ADMIN"), app.csrfProtection] },
    usersController.createUser
  )
  app.patch(
    "/me",
    { preHandler: [requireAuth, app.csrfProtection] },
    usersController.updateProfile
  )
  app.patch(
    "/role/:id",
    { preHandler: [requireRole("SUPERADMIN"), app.csrfProtection] },
    usersController.updateRole
  )
}
