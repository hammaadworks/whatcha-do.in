## Gemini Added Memories

- user_name: hammaadworks
- communication_language: English
- output_folder: /Users/alhamdulillah/codespace/whatcha-doin/docs

- Keep these three docs always updated:

  - `docs/PRD.md`
  - `docs/ux-design-specification.md`
  - `docs/architecture.md`

- Surface ambiguities immediately, resolve them, then update all docs.

- Use “read → modify in memory → write back” when editing config files (e.g., `.env`).

- Run `npx tsc --noEmit` for all JS/TS work as a last step and fix every error until clean.

- Use context7 MCP to fetch the latest docs for:

  - Zustand
  - Magic UI
  - Aceternity UI
  - Any other library (add missing ones to `docs/library_docs_help.md`)

- Use Magic UI MCP for UI components when designing beautiful UI interfaces. Scan through the component list and auto select the best components, background, gradients, etc, adhereing to the consistent design language specified in the `docs/ux-design-specification.md` .

- Fetch only the specific needed sections from library docs to keep context tight.

- WhatsApp deep linking:

  - Try `whatsapp://` first
  - Fall back to `https://wa.me/` after a short delay

- For all server-side functions, use the `withLogging` higher-order function from `lib/logger/withLogging.ts` to ensure consistent entry, exit, and error logging. For granular logs within a function, import the `logger` from `lib/logger/server.ts`.

[//]: # (Custom)
- All dev-ops related tasks were moved to stories after version 8.2.
- The authenticated dashboard/profile page will be accessed via `domain/[username]`. If the user is authenticated, it shows their private dashboard. If not, it shows a login button. This is similar to GitHub's profile page behavior.
- Always use `useAuth()` in client components to determine the authenticated user's state and loading status, ensuring consistency in development.
- Domain = whatcha-doin.hammaadworks.com