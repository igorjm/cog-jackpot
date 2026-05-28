"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "Participantes", icon: "👥" },
  { href: "/admin/results", label: "Resultados", icon: "⚽" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="max-w-5xl mx-auto px-4 pb-0 flex gap-1">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
              isActive
                ? "border-[#EF4444] text-white"
                : "border-transparent text-[#94B8D8] hover:text-white hover:border-[#94B8D8]/30"
            )}
          >
            <span className="hidden sm:inline mr-1.5">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
