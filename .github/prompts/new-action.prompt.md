---
description: "Create a new Server Action for the Bolão app with proper Zod validation, error handling, and redirect safety"
---

# New Server Action

Create a new Server Action in `app/actions/${input:fileName}.ts`.

## Requirements

- Purpose: ${input:purpose}
- Add `"use server"` at the top of the file
- Validate all inputs with Zod 4
- Wrap database operations in try-catch
- Re-throw Next.js redirects: `if ("digest" in error) throw error`
- Return `{ error: string }` for user-facing errors
- Use `prisma` from `@/lib/prisma`
- Use `auth()` from `@/lib/auth` if authentication is needed

## Template

```typescript
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  // define fields
});

export async function ${input:actionName}(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Dados inválidos" };

  try {
    // database operation
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { error: "Erro ao processar. Tente novamente." };
  }
}
```
