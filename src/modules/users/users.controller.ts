import { type FastifyReply, type FastifyRequest } from "fastify"
import { Exception } from "../../exceptions/Exception.js"
import { parseBody } from "../../shared/validate.js"
import { usersService, type UsersService } from "./users.service.js"
import { createUserSchema, updateProfileSchema, updateRoleSchema } from "./users.schema.js"

type UpdateRoleParams = {
  id: string
}

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const users = await this.usersService.list()
    return reply.status(200).send(users)
  }

  createUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = parseBody(createUserSchema, request.body)

    const result = await this.usersService.createUser({ email, password })
    return reply.status(201).send(result)
  }

  updateProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = parseBody(updateProfileSchema, request.body)

    const result = await this.usersService.updateProfile(request.session.userId, data)
    return reply.status(200).send(result)
  }

  updateRole = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as UpdateRoleParams
    const parsedId = Number(id)

    if (!Number.isInteger(parsedId)) {
      throw new Exception("Invalid id", 400)
    }

    const { role } = parseBody(updateRoleSchema, request.body)

    const result = await this.usersService.updateRole({
      id: parsedId,
      role,
      requesterId: request.session.userId
    })
    return reply.status(201).send(result)
  }
}

export const usersController = new UsersController(usersService)
