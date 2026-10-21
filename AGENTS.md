<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Git

-Never create branches, worktrees or commits automatically. Only do so when the user explicitly asks for that specific action in the current request.

-Leave changes uncommitted in the working tree on the current branch and let the user decide when and how to commit.

## Database

-Only use `npm run db:push` (drizzle-kit push) to synchronize schema changes with Neon.
-Do NOT create or run migration scripts. The `drizzle/` directory and migration runners must not exist.
\-`drizzle-kit generate` is allowed to produce SQL for review, but never apply it with a migration tool.

### Schema changes

-Edit `lib/db/schema.ts`, then run `npm run db:push`. That is the whole workflow.
-`drizzle-kit push` prompts when the schema drops or renames a table that already exists in the database. That prompt needs an interactive TTY, so in a non-interactive shell it fails with `Interactive prompts require a TTY terminal`.
-The prompt asks whether to rename an existing table or create the new one and drop the old. It is not a data-loss confirmation. Let it create the new table and drop the obsolete one.
-In a non-interactive shell, drop the obsolete table first, then run `npm run db:push`. Drop it explicitly, in dependency order (children before parents), without CASCADE, and only after confirming the table is empty:

```sql
DROP TABLE "posts";  -- references users
DROP TABLE "todos";  -- references users
DROP TABLE "users";
```

-After the obsolete tables are gone, `npm run db:push` reports `No changes detected` and needs no TTY.
-Verify with `npm run db:check:schema` (columns, constraints, indexes, and a round-trip insert/select/delete) and `npm run db:check:counts`.
