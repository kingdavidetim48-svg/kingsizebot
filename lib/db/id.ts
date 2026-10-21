import { nanoid } from "nanoid"

/**
 * Standard id generator for this project. Returns a fresh, URL-safe
 * nanoid string on every call.
 */
export function generateId(): string {
  return nanoid()
}
