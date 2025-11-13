## Gemini Added Memories
- When coding, I should use the context7 mcp to fetch the latest documentation for libraries like Zustand, Magic UI, Aceternity UI, and others.
- When modifying existing files, especially configuration files like `.env`, I must always use a 'read-modify-write' strategy to avoid data loss. I will read the file first, modify the content in memory, and then write the entire modified content back.
- When I need to reason about a library, I must first check docs/library_docs_help.md for a documentation link. I will then fetch only the specific, relevant sections from that link, keeping my context small and up-to-date. If a library is missing from the file, I will add it.
- The whatsapp:// protocol can be used for deep linking into the WhatsApp mobile app, but it may not work in all browsers or testing environments. A good pattern is to try the whatsapp:// link first and then fall back to the https://wa.me/ link after a short delay. This provides a better user experience on mobile while still working on desktop.
- user_name: hammaadworks
- communication_language: English
- output_folder: /Users/alhamdulillah/codespace/whatcha-doin/docs
- Always keep @docs/PRD.md, @docs/ux-design-specification.md, and @docs/architecture.md updated with design decisions. Show ambiguities for resolution and update the docs as specified on resolution. Ensure no gaps in understanding within these three documents.
