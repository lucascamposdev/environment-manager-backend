import { type FastifyReply, type FastifyRequest } from "fastify"
import { Exception } from "../../exceptions/Exception.js"
import { parseBody } from "../../shared/validate.js"
import { authService, type AuthService } from "./auth.service.js"
import { loginSchema } from "./auth.schema.js"

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { username, password } = parseBody(loginSchema, request.body)

    const user = await this.authService.validateCredentials(username, password)

    const previousSessionId = request.session.sessionId

    await request.session.regenerate()
    request.session.userId = user.id

    if (previousSessionId && previousSessionId !== request.session.sessionId) {
      request.sessionStore.destroy(previousSessionId, () => {})
    }

    return reply.send({ id: user.id, username: user.username, role: user.role })
  }

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    await request.session.destroy()
    reply.clearCookie("sid")
    return reply.status(204).send()
  }

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await this.authService.findById(request.session.userId)

    if (!user) {
      throw new Exception("Not authenticated", 401)
    }

    return reply.send({ id: user.id, username: user.username, role: user.role })
  }
}

export const authController = new AuthController(authService)
