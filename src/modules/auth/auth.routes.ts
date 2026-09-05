import { type FastifyInstance } from "fastify"
import { authController } from "./auth.controller.js"
import { requireAuth } from "./auth.guard.js"

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", authController.login)
  app.post("/logout", { preHandler: requireAuth }, authController.logout)
  app.get("/me", { preHandler: requireAuth }, authController.me)
  app.post("/forgot-password", authController.forgotPassword)
  app.post("/reset-password", authController.resetPassword)
}
