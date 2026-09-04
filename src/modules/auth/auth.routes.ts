import { type FastifyInstance } from "fastify";
import { login } from "./auth.controller.js";


export async function authRoutes(app: FastifyInstance) {
  app.get("/login", login);
}
