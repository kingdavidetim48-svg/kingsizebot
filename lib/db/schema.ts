import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core"

import { generateId } from "./id"

/**
 * bots - stores bot definitions and configuration.
 * Exactly one table: no legacy schemas, no foreign keys, no unique constraints.
 */
export const bots = pgTable(
  "bots",
  {
    // Primary key. Generated with the project's nanoid helper at insert time.
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    // Third-party user id that owns the bot. Not a foreign key.
    userId: text("userId").notNull(),
    name: text("name").notNull(),
    // Seed for the bot's face. A fresh nanoid per inserted row.
    avatar: text("avatar")
      .notNull()
      .$defaultFn(() => generateId()),
    // The bot's purpose, in a short phrase.
    job: text("job").notNull(),
    // How the bot should perform its job. Null until set.
    instructions: text("instructions"),
    // Third-party sandbox id. Null until a sandbox is created.
    sandboxId: text("sandboxId"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("bots_user_id_idx").on(table.userId)]
)

export type Bot = typeof bots.$inferSelect
export type NewBot = typeof bots.$inferInsert
