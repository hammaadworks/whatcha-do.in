## Gemini Added Memories

- **CRITICAL: Follow the ruleset in `docs/wiki/coding_standards.md` for all code development, refactoring, and file naming.** This is the Source of Truth for the project's engineering standards.

- Surface ambiguities immediately, resolve them, then update all docs.

- Run `npx tsc --noEmit` for all JS/TS work as a last step and fix every error until clean.

- Use Magic UI MCP for UI components when designing beautiful UI interfaces. Scan through the component list and auto select the best components, background, gradients, etc, adhereing to the consistent design language specified in the `docs/ux-design-specification.md` .

- WhatsApp deep linking:

  - Try `whatsapp://` first
  - Fall back to `https://wa.me/` after a short delay

- For all server-side functions, use the `withLogging` higher-order function from `lib/logger/withLogging.ts` to ensure consistent entry, exit, and error logging. For granular logs within a function, import the `logger` from `lib/logger/server.ts`.

- Read the wikis under `docs/wiki/**` to understand the application's architecture and important flows.

- The authenticated profile page will be accessed via `domain/[username]`. If the user is authenticated, it shows their private page. If not, it shows a login button. This is similar to GitHub's profile page behavior.
