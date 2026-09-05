import { type FastifyReply, type FastifyRequest } from "fastify"
import { Exception } from "../../exceptions/Exception.js"
import { parseBody } from "../../shared/validate.js"
import { authService, type AuthService } from "./auth.service.js"
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema
} from "./auth.schema.js"

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = parseBody(loginSchema, request.body)

    const user = await this.authService.validateCredentials(email, password)

    const previousSessionId = request.session.sessionId

    await request.session.regenerate()
    request.session.userId = user.id

    if (previousSessionId && previousSessionId !== request.session.sessionId) {
      request.sessionStore.destroy(previousSessionId, () => {})
    }

    return reply.send({ id: user.id, email: user.email, role: user.role })
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

    return reply.send({ id: user.id, email: user.email, role: user.role })
  }

  forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email } = parseBody(forgotPasswordSchema, request.body)

    const mailMessage = await this.authService.requestPasswordReset(email)

    return reply.send(mailMessage)
  }

  resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const { token, password } = parseBody(resetPasswordSchema, request.body)

    await this.authService.resetPassword(token, password)

    return reply
      .status(200)
      .send({ message: "Password redefined successfully!" })
  }
}

export const authController = new AuthController(authService)
