import { type FastifyReply, type FastifyRequest } from "fastify";
import { authService } from "./auth.service.js";

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const result = await authService.login();
  return reply.send(result);
}
