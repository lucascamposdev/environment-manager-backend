import { type FastifyInstance } from "fastify"
import { authRoutes } from "../modules/auth/auth.routes.js"

export async function registerRoutes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: "/auth" })
}
