---
applyTo: "components/**"
description: "Conventions for React components in this project — styling, patterns, and structure guidelines"
---

# Component Conventions

- Use Server Components by default. Add `"use client"` only for interactivity (forms, state, effects).
- Import `cn` from `@/lib/utils` for conditional class merging.
- Use Tailwind utility classes inline — no CSS modules, no styled-components.
- Prefer composition over prop drilling.
- Always use the project color palette (see copilot-instructions.md) — never use generic grays like `gray-500`.
- Use `rounded-xl` or `rounded-2xl` for cards and containers.
- Use `font-[family-name:var(--font-oswald)]` for display/heading text.
- Use `font-mono` for numeric values (scores, points, countdowns).
- All user-facing text must be in Portuguese (pt-BR).
- Component files use PascalCase exports but kebab-case filenames.
