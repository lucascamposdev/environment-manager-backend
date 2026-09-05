import { Exception } from "../../exceptions/Exception.js"
import { prisma } from "../../lib/prisma.js"
import { verifyPassword } from "../../shared/password.js"

export class AuthService {
  async validateCredentials(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } })

    if (!user || !verifyPassword(password, user.password)) {
      throw new Exception("Invalid username or password", 401)
    }

    return user
  }

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } })
  }
}

export const authService = new AuthService()
