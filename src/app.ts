import cookie from "@fastify/cookie"
import session from "@fastify/session"
import Fastify, { type FastifyInstance } from "fastify"
import { Exception } from "./exceptions/Exception.js"
import { prisma } from "./lib/prisma.js"
import { PrismaSessionStore } from "./lib/session-store.js"
import { registerRoutes } from "./routes/index.js"

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: false
  })

  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be set to a string of at least 32 characters")
  }

  const sessionStore = new PrismaSessionStore(prisma)

  app.register(cookie)
  app.register(session, {
    secret: sessionSecret,
    cookieName: "sid",
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: "auto",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof Exception) {
      return reply.status(error.statusCode).send({ message: error.message })
    }

    app.log.error(error)
    return reply.status(500).send({ message: "Internal server error" })
  })

  app.register(registerRoutes)

  console.log("Servidor Iniciado com Sucesso! ⭐")

  return app
}
