# AI Development Resources

This project includes AI-powered development customizations for VS Code Copilot and compatible agents.

## Structure

```
.github/
├── copilot-instructions.md          # Global project context (always loaded)
├── instructions/
│   ├── components.instructions.md   # React component conventions
│   ├── database.instructions.md     # Prisma + Neon DB patterns
│   ├── nextjs.instructions.md       # Next.js App Router conventions
│   └── security.instructions.md     # Auth, API, cron, CI security patterns
├── agents/
│   ├── match-admin.agent.md         # Specialist: match data & scoring
│   ├── ui-designer.agent.md         # Specialist: UI/styling work
│   └── security-architect.agent.md  # Specialist: architecture, DevOps & security
└── prompts/
    ├── new-page.prompt.md           # Scaffold a new app page
    ├── new-component.prompt.md      # Scaffold a new component
    └── new-action.prompt.md         # Scaffold a Server Action
```

## How It Works

### Instructions (Auto-loaded)

- **copilot-instructions.md** — Always active. Gives the agent project context, tech stack, color palette, and business rules.
- **components.instructions.md** — Loaded when editing files in `components/`. Guides styling and patterns.
- **database.instructions.md** — Loaded when editing `prisma/` or `lib/prisma.ts`. Warns about Neon TLS issues.
- **nextjs.instructions.md** — Loaded when editing files in `app/`. Guides routing and Server Action patterns.
- **security.instructions.md** — Loaded when editing auth, API routes, cron jobs, middleware, or CI workflows.

### Agents (Invoke with @agent-name)

- **@match-admin** — Use for scoring logic, result entry, match seed data.
- **@ui-designer** — Use for visual tasks, layout fixes, color palette work.
- **@security-architect** — Use for auth hardening, threat modeling, secrets/CI/CD review, production security readiness.

### Prompts (Invoke with /prompt-name)

- **/new-page** — Generates a new page with proper layout, colors, pt-BR text.
- **/new-component** — Generates a typed component with project conventions.
- **/new-action** — Generates a Server Action with Zod validation and error handling.

## Tips for Developers

1. Always let the agent know if you're working on mobile or desktop layout.
2. Mention "World Cup palette" or "project colors" to remind the agent to use the correct hex values.
3. Use `@match-admin` when dealing with scoring — it has the full rules table embedded.
4. When creating new pages, use `/new-page` to get the boilerplate right.
