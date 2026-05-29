"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-[#1E3862] text-white font-medium"
          : "text-[#94B8D8] hover:text-white hover:bg-[#162D54]"
      )}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 transition-colors",
        isActive ? "text-[#FFD60A]" : "text-[#5A7A9A] hover:text-[#38BDF8]"
      )}
    >
      <span className="text-lg">{icon}</span>
      <span className={cn("text-[10px]", isActive && "font-semibold")}>
        {label}
      </span>
    </Link>
  );
}
