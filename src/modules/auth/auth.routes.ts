import { type FastifyInstance } from "fastify"
import { authController } from "./auth.controller.js"
import { requireAuth } from "./auth.guard.js"

const bruteForceRateLimit = {
  rateLimit: {
    max: 5,
    timeWindow: "1 minute"
  }
}

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/login",
    { config: bruteForceRateLimit },
    authController.login
  )
  app.post(
    "/logout",
    { preHandler: [requireAuth, app.csrfProtection] },
    authController.logout
  )
  app.get("/me", { preHandler: requireAuth }, authController.me)
  app.get("/csrf", { preHandler: requireAuth }, authController.csrf)
  app.post(
    "/forgot-password",
    { config: bruteForceRateLimit },
    authController.forgotPassword
  )
  app.post(
    "/reset-password",
    { config: bruteForceRateLimit },
    authController.resetPassword
  )
}
