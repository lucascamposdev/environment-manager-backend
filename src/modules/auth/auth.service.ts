import { Exception } from "../../exceptions/Exception.js"
import { prisma } from "../../lib/prisma.js"
import { hashPassword, verifyPassword } from "../../shared/password.js"
import { generateToken, hashToken } from "../../shared/token.js"

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60

export class AuthService {
  async validateCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !verifyPassword(password, user.password)) {
      throw new Exception("Invalid email or password", 401)
    }

    return user
  }

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } })
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return
    }

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    const token = generateToken()

    await prisma.passwordResetToken.create({
      data: {
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
      }
    })

    const mailMessage = {
      to: user.email,
      subject: "Password Reset",
      text: `Use the token below to reset your password. It expires in 1 hour.\n\nToken: ${token}`
    }

    return mailMessage
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) }
    })

    if (!resetToken || resetToken.expiresAt.getTime() <= Date.now()) {
      throw new Exception("Invalid or expired token", 400)
    }

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashPassword(newPassword) }
    })

    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
  }
}

export const authService = new AuthService()
