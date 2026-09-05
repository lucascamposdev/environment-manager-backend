import { type FastifyInstance } from "fastify"
import { authRoutes } from "../modules/auth/auth.routes.js"
import { usersRoutes } from "../modules/users/users.routes.js"

export async function registerRoutes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: "/auth" })
  app.register(usersRoutes, { prefix: "/users" })
}
