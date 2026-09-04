import Fastify, { type FastifyInstance } from "fastify"
import { registerRoutes } from "./routes/index.js"

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: false
  })

  app.register(registerRoutes)

  return app
}
