---
description: "Create a new page in the Bolão app with proper layout integration, colors, and responsive design"
---

# New Page

Create a new page at `app/(main)/${input:pagePath}/page.tsx` for the Bolão Copa 2026 app.

## Requirements

- Page name/purpose: ${input:purpose}
- Use Server Component by default (add `"use client"` only if interactive)
- Follow the World Cup 2026 color palette (deep navy bg, gold headings, blue links)
- Use `font-[family-name:var(--font-oswald)]` for the page title
- All text in Portuguese (pt-BR)
- Mobile-first responsive design
- Cards use `bg-[#122448] rounded-2xl border border-[#1E3A6E]`
- Muted text uses `text-[#94B8D8]`

## Template

```tsx
export default async function ${input:componentName}() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
        ${input:title}
      </h1>

      {/* Content here */}
    </div>
  );
}
```
