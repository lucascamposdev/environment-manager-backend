import type { Session } from "fastify"
import type { PrismaClient } from "../generated/prisma/client.js"

type Callback = (err?: unknown) => void
type CallbackSession = (err: unknown, result?: Session | null) => void

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24

export class PrismaSessionStore {
  constructor(private readonly prisma: PrismaClient) {}

  async get(sessionId: string, callback: CallbackSession): Promise<void> {
    try {
      const session = await this.prisma.session.findUnique({ where: { sid: sessionId } })

      if (!session || session.expiresAt.getTime() <= Date.now()) {
        if (session) await this.prisma.session.delete({ where: { sid: sessionId } }).catch(() => {})
        return callback(null, null)
      }

      callback(null, session.data as unknown as Session)
    } catch (err) {
      callback(err)
    }
  }

  async set(sessionId: string, session: Session, callback: Callback): Promise<void> {
    try {
      const expiresAt = session.cookie?.expires ? new Date(session.cookie.expires) : new Date(Date.now() + DEFAULT_TTL_MS)

      await this.prisma.session.upsert({
        where: { sid: sessionId },
        create: { sid: sessionId, data: session as object, expiresAt },
        update: { data: session as object, expiresAt }
      })

      callback()
    } catch (err) {
      callback(err)
    }
  }

  async destroy(sessionId: string, callback: Callback): Promise<void> {
    try {
      await this.prisma.session.delete({ where: { sid: sessionId } })
      callback()
    } catch {
      callback()
    }
  }

  async purgeExpired(): Promise<number> {
    const { count } = await this.prisma.session.deleteMany({
      where: { expiresAt: { lte: new Date() } }
    })

    return count
  }
}
