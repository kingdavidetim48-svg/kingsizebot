import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

/**
 * Neon HTTP driver — queries travel over HTTPS to the Neon's query gateway,
 * so this works in edge/serverless runtimes without a persistent TCP socket.
 *
 * `DATABASE_URL` comes from `.env.local`, which Next.js loads automatically
 * and `neon link` / `neon env pull` populate.
 *
 * The URL is resolved lazily on first use so importing this module never
 * throws during a build where env vars may not be present yet.
 */
let client: ReturnType<typeof drizzle<typeof schema>> | undefined

export function getDb() {
  if (!client) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Run `neon env pull` to populate .env.local."
      )
    }
    client = drizzle(neon(url), { schema })
  }
  return client
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getDb() as object, prop, receiver)
    return typeof value === "function" ? value.bind(getDb()) : value
  },
})

export * from "./schema"
