/**
 * Verifies the Drizzle + Neon connection with a read-only query.
 *
 * Usage: npx tsx scripts/check-db.ts
 */
import { config } from "dotenv"

config({ path: ".env.local" })

import { db } from "../lib/db"

async function main() {
  const result = await db.execute(
    "select current_database() as database, current_user as user, version() as version"
  )
  console.log("Connected to:", result.rows[0])
}

main().catch((err) => {
  console.error("Connection failed:", err)
  process.exit(1)
})
