import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { CrystalBallIcon } from "@/components/icons/crystal-ball";
import { cn } from "@/lib/utils";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user;
  const nickname = (user as { nickname?: string }).nickname;
  const isAdmin = (user as { role?: string }).role === "ADMIN";

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Diagonal background split */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.07]"
          style={{
            backgroundImage: "url('/background-app.png')",
            clipPath: "polygon(100% 0, 100% 100%, 0 100%, 40% 0)",
          }}
        />
      </div>

      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden md:flex md:flex-col md:w-56 md:fixed md:inset-y-0 bg-[#0A1A3A]/95 border-r border-[#1E3A6E]">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-[#1E3A6E]">
          <Link href="/dashboard">
            <span className="text-lg font-[family-name:var(--font-oswald)] font-bold text-[#FFD60A] uppercase">
              ⚽ Copa 2026
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <SidebarLink href="/dashboard" icon="🏠" label="Início" />
          <SidebarLink href="/matches" icon="⚽" label="Jogos" />
          <SidebarLink href="/ranking" icon="🏆" label="Ranking" />
          <SidebarLink href="/my-bets" icon="🔮" label="Meus Palpites" />
          <SidebarLink href="/rules" icon="📖" label="Regras" />
          {isAdmin && <SidebarLink href="/admin" icon="⚙️" label="Admin" />}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FACC15]/30 bg-[#0e2548] text-xs font-bold text-[#FACC15]">
              {nickname?.charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-sm font-medium text-white">
              {nickname}
            </span>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs text-[#A8C3E8] transition-colors hover:text-white"
            >
              ← Sair
            </button>
          </form>
        </div>
      </aside>

      <AppHeader
        nickname={nickname}
        isAdmin={isAdmin}
        signOutAction={signOutAction}
      />

      <main className="app-main relative z-10 flex-1 md:ml-56">
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-5 pb-24 md:py-6 md:pb-6">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#A8C3E8] transition-all",
        "hover:border hover:border-white/10 hover:bg-[#0c1e3d] hover:text-white"
      )}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
