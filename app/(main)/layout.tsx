import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SidebarLink, NavLink } from "@/components/nav-links";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { nickname: true, avatar: true, status: true, role: true },
  });

  if (!dbUser || dbUser.status !== "APPROVED") {
    if (dbUser?.status === "PENDING_PAYMENT") redirect("/pending");
    if (dbUser?.status === "REJECTED") redirect("/rejected");
    redirect("/login");
  }

  const user = session.user;
  const isAdmin = dbUser.role === "ADMIN";
  const nickname = dbUser.nickname;
  const avatar = dbUser.avatar;

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Diagonal background split */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
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
      <aside className="hidden md:flex md:flex-col md:w-56 md:fixed md:inset-y-0 bg-[#0F2347]/95 border-r border-[#2A4A7A]">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-[#2A4A7A]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/logo-fifa.png" alt="FIFA World Cup 2026" width={44} height={44} className="h-11 w-auto" />
            <span className="text-base font-[family-name:var(--font-oswald)] font-bold text-[#FFD60A] uppercase tracking-wide">
              Bolão Copa 26
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarLink href="/dashboard" icon="🏠" label="Início" />
          <SidebarLink href="/matches" icon="⚽" label="Jogos" />
          <SidebarLink href="/bracket" icon="🎯" label="Mata-Mata" />
          <SidebarLink href="/ranking" icon="🏆" label="Ranking" />
          <SidebarLink href="/my-bets" icon="📋" label="Meus Palpites" />
          <SidebarLink href="/rules" icon="📖" label="Regras" />
          {isAdmin && <SidebarLink href="/admin" icon="⚙️" label="Admin" />}
        </nav>

        {/* User section at bottom */}
        <div className="px-4 py-4 border-t border-[#2A4A7A]">
          <Link href="/profile" className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity">
            {avatar ? (
              <Image
                src={avatar}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#2A4A7A] flex items-center justify-center text-xs font-bold text-[#FFD60A]">
                {nickname?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-white truncate">{nickname}</span>
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg text-[#5A7A9A] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top header - hidden on desktop */}
      <header className="sticky top-0 z-50 bg-[#0F2347]/90 backdrop-blur-xl border-b border-[#2A4A7A] md:hidden pt-[env(safe-area-inset-top)]">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo-fifa.png" alt="FIFA World Cup 2026" width={36} height={36} className="h-9 w-auto" />
            <span className="text-base font-[family-name:var(--font-oswald)] font-bold text-[#FFD60A] uppercase tracking-wide">
              Bolão Copa 26
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/profile" className="flex items-center gap-1.5 bg-[#162D54] px-2.5 py-1.5 rounded-full hover:bg-[#1E3862] transition-colors">
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#2A4A7A] flex items-center justify-center text-[10px] font-bold text-[#FFD60A]">
                  {nickname?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-white">{nickname}</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-xs px-2 py-1.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] font-medium"
              >
                Admin
              </Link>
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-xs px-2.5 py-1.5 rounded-full border border-[#2A4A7A] text-[#94B8D8] hover:text-white hover:border-[#EF4444]/50 hover:bg-[#EF4444]/10 transition-all"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 md:ml-56 relative z-10">
        <div className="max-w-5xl mx-auto w-full px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav - hidden on desktop */}
      <nav className="fixed inset-x-0 bottom-0 z-50 bg-[#0F2347]/90 backdrop-blur-xl border-t border-[#2A4A7A] md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-2">
          <NavLink href="/dashboard" icon="🏠" label="Início" />
          <NavLink href="/matches" icon="⚽" label="Jogos" />
          <NavLink href="/ranking" icon="🏆" label="Ranking" />
          <NavLink href="/my-bets" icon="📋" label="Palpites" />
          <NavLink href="/rules" icon="📖" label="Regras" />
        </div>
      </nav>
    </div>
  );
}
