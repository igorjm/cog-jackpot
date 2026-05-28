import Link from "next/link";
import { CrystalBallIcon } from "@/components/icons/crystal-ball";

interface AppHeaderProps {
  nickname?: string;
  isAdmin?: boolean;
  signOutAction: () => Promise<void>;
}

export function AppHeader({ nickname, isAdmin, signOutAction }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020810]/90 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="page-title text-lg text-gold-gradient">Copa 2026</span>
        </Link>

        <div className="flex items-center gap-2">
          {nickname && (
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0c1e3d]/90 px-2.5 py-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0e2548] text-[10px] font-bold text-[#FACC15]">
                {nickname.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[72px] truncate text-xs font-medium text-white">
                {nickname}
              </span>
            </div>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full bg-[#EF4444]/15 px-2 py-1 text-[10px] font-semibold text-[#EF4444]"
            >
              Admin
            </Link>
          )}
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs text-[#A8C3E8] transition-colors hover:text-white"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
