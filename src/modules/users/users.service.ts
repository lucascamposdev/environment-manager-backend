import { Exception } from "../../exceptions/Exception.js"
import { Prisma } from "../../generated/prisma/client.js"
import type { Role } from "../../generated/prisma/enums.js"
import { prisma } from "../../lib/prisma.js"
import { hashPassword, verifyPassword } from "../../shared/password.js"

export class UsersService {
  async list() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
  }

  async createUser(data: { email: string; password: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existing) {
      throw new Exception("Email already in use", 409)
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashPassword(data.password)
      }
    })

    return { id: user.id, email: user.email, role: user.role }
  }

  async updateProfile(
    userId: number,
    data: { password: string; currentPassword: string }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user || !verifyPassword(data.currentPassword, user.password)) {
      throw new Exception("Current password is incorrect", 401)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashPassword(data.password)
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    })

    return updated
  }

  async updateRole(data: { id: number; role: Role; requesterId: number }) {
    if (data.requesterId === data.id) {
      throw new Exception("You cannot change your own role", 403)
    }

    try {
      const user = await prisma.user.update({
        where: {
          id: data.id
        },
        data: {
          role: data.role
        },
        select: {
          id: true,
          email: true,
          role: true
        }
      })

      return user
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Exception("User not found", 404)
      }

      throw error
    }
  }
}

export const usersService = new UsersService()
