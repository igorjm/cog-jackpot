"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "Início" },
  { href: "/matches", icon: "⚽", label: "Jogos" },
  { href: "/ranking", icon: "🏆", label: "Ranking" },
  { href: "/my-bets", icon: "🔮", label: "Palpites" },
  { href: "/rules", icon: "📖", label: "Regras" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-50 border-t border-white/10 bg-[#020810]/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1 transition-all",
                isActive ? "text-[#FACC15]" : "text-[#5A7A9A] hover:text-[#A8C3E8]"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all",
                  isActive && "nav-item-active border border-[#FACC15]/25 bg-[#FACC15]/10 glow-gold"
                )}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  isActive && "text-[#FACC15]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
