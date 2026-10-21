/**
 * Prints row counts for the tables currently in the public schema.
 *
 * Usage: npx tsx scripts/check-counts.ts
 */
import { config } from "dotenv"

config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  const sql = neon(url)

  const tables = await sql.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `)

  for (const t of tables) {
    const name = t.table_name as string
    const res = await sql.query(`select count(*)::int as n from "${name}"`)
    console.log(`${name}: ${res[0].n}`)
  }
}

main().catch((err) => {
  console.error("Failed:", err)
  process.exit(1)
})
