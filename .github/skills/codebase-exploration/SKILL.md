# Skill: Codebase Exploration
description: Structured methodology for onboarding into an unknown codebase — from manifests to architecture, flow tracing, and risk mapping.

---

## When to Use This Skill

When a developer or agent needs to understand a project they've never seen before.
Invoke for prompts like:
- "Explore this project and tell me what it does"
- "Map the architecture for me"
- "Where is the code for X?"
- "What's the riskiest part of this system?"

---

## Exploration Protocol (4 Phases)

### Phase 1 — Manifests Only (No source code)
Read only configuration and manifest files. Do NOT open `.ts`, `.py`, `.go` etc.

Files to read, in order:
1. `README.md` (root) — business purpose, quick start
2. `docker-compose.yml` — infrastructure topology (databases, caches, ports)
3. `package.json` / `pyproject.toml` / `Makefile` at root and per-package — stack, scripts, dependencies
4. Any `CLAUDE.md` or `AGENTS.md` — project-specific AI guidelines

**Output for this phase:**
1. What the system does (1 business paragraph)
2. Main tech stack (table format)
3. How to run locally (steps)
4. Main entry points

---

### Phase 2 — Directory Structure (No file reads)
Use `list_dir` recursively top-down. Do NOT open files yet.

Map:
- Modules and probable responsibilities (by naming convention)
- Where routes / controllers / handlers live
- Where data models / schemas / migrations live
- Where tests live
- What looks critical vs utility

**Note as "doubts"** anything unclear from name alone. Resolve doubts in Phase 3.

---

### Phase 3 — Flow Tracing (Targeted reads)
Pick the single most central business flow (e.g., "generate a recipe", "place an order").
Read only the files directly on that path. Read them in dependency order:

1. Entry point (controller / route handler)
2. Input validation (DTO / schema)
3. Business logic (service / use case)
4. External integrations (AI, payment, email)
5. Data contract / response shape
6. Client-side trigger (store / hook that calls the API)

**Output for this phase:**
- Full end-to-end flow diagram (text-based)
- Which file handles each step
- What conversations happen between layers

---

### Phase 4 — Risk Assessment
Based on all gathered context, classify every identified area:

**High Risk (change = broad impact):**
- Shared contracts / interfaces used by multiple consumers
- Integration points with external APIs (parsing, error handling)
- State management hubs (single store managing multiple screens)
- Any point where failure is silent (e.g., unchecked JSON.parse)

**Low Risk (safe to change):**
- Pure visual components (stateless UI)
- Design system tokens (colors, spacing, typography)
- i18n / translation strings
- Boilerplate entry files (app root, health check controllers)
- Seed / migration files (dev-only)

**Fragility flags to look for:**
- `JSON.parse(x || '{}')` without schema validation
- Duplicated type definitions on both sides of an API boundary
- `@Expose({ name: 'y' })` or field renaming patches (signals past desync)
- Empty route handlers with hardcoded placeholders (`return []`)
- Infrastructure in `docker-compose` with no corresponding code module (e.g., Redis with no cache module)
- Missing tests on the highest-complexity files

---

## Output Format

Each phase should produce a clearly titled section.
Use tables for stack and risk classification.
Use text diagrams for flow tracing. Example:

```
[Screen] → [Store] → [API Client] → [Controller] → [Service] → [External API]
                                                                      ↓
                                                               JSON.parse → Model
```

Flag doubts explicitly with the label **Dúvida:** or **Open question:** so they can be resolved later.

---

## Brewra-Specific Notes

- The central flow is: `POST /brew/generate` — from tela de seleção de método until `BrewResultScreen`
- Contract is duplicated between `backend/src/modules/brew/contracts/brew-contract.ts` and `mobile/src/shared/api/client.ts` — always check both when changing the API shape
- The field `processingMethod` (backend DTO) is serialized as `process` (mobile) — handled via `@Expose({ name: 'process' })` in the DTO
- Prisma and Redis are configured but not wired into the main generation flow (as of April 2026)
- `ai.service.ts` + `prompt-templates.ts` have zero test coverage — highest fragility in the codebase
