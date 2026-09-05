import type { ZodType } from "zod"
import { Exception } from "../exceptions/Exception.js"

export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body)

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join("; ")

    throw new Exception(message, 400)
  }

  return result.data
}
