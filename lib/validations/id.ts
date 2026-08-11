import { z } from "zod"

const UUID_SHAPE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export function idSchema(message: string) {
  return z.string().trim().regex(UUID_SHAPE, message)
}
