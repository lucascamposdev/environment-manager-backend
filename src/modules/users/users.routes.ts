import { type FastifyInstance } from "fastify"
import { usersController } from "./users.controller.js"
import { requireAuth, requireRole } from "../auth/auth.guard.js"

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: requireRole("ADMIN") }, usersController.list)
  app.post("/", { preHandler: requireRole("ADMIN") }, usersController.createUser)
  app.patch("/me", { preHandler: requireAuth }, usersController.updateProfile)
  app.patch("/role/:id", { preHandler: requireRole("SUPERADMIN") }, usersController.updateRole)
}
