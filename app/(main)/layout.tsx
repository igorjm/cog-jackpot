import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user;
  const isAdmin = (user as { role?: string }).role === "ADMIN";

  // Fetch fresh user data for avatar/nickname (JWT may be stale after profile update)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { nickname: true, avatar: true },
  });
  const nickname = dbUser?.nickname ?? (user as { nickname?: string }).nickname;
  const avatar = dbUser?.avatar ?? null;

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
      <aside className="hidden md:flex md:flex-col md:w-56 md:fixed md:inset-y-0 bg-[#0A1A3A]/95 border-r border-[#1E3A6E]">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-[#1E3A6E]">
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
          <SidebarLink href="/ranking" icon="🏆" label="Ranking" />
          <SidebarLink href="/my-bets" icon="📋" label="Meus Palpites" />
          <SidebarLink href="/rules" icon="📖" label="Regras" />
          {isAdmin && <SidebarLink href="/admin" icon="⚙️" label="Admin" />}
        </nav>

        {/* User section at bottom */}
        <div className="px-4 py-4 border-t border-[#1E3A6E]">
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
              <div className="w-8 h-8 rounded-full bg-[#1E3A6E] flex items-center justify-center text-xs font-bold text-[#FFD60A]">
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
              className="w-full text-xs text-[#5A7A9A] hover:text-white transition-colors text-left"
            >
              ← Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top header - hidden on desktop */}
      <header className="sticky top-0 z-50 bg-[#0A1A3A]/90 backdrop-blur-xl border-b border-[#1E3A6E] md:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo-fifa.png" alt="FIFA World Cup 2026" width={36} height={36} className="h-9 w-auto" />
            <span className="text-base font-[family-name:var(--font-oswald)] font-bold text-[#FFD60A] uppercase tracking-wide">
              Bolão Copa 26
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/profile" className="flex items-center gap-1.5 bg-[#122448] px-2.5 py-1.5 rounded-full hover:bg-[#1A3058] transition-colors">
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#1E3A6E] flex items-center justify-center text-[10px] font-bold text-[#FFD60A]">
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
                className="text-xs px-2 py-1.5 rounded-full bg-[#122448] text-[#5A7A9A] hover:text-white transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 md:ml-56 relative z-10">
        <div className="max-w-5xl mx-auto w-full px-4 py-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav - hidden on desktop */}
      <nav className="sticky bottom-0 z-50 bg-[#0A1A3A]/90 backdrop-blur-xl border-t border-[#1E3A6E] md:hidden">
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
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#94B8D8] hover:text-white hover:bg-[#122448] transition-colors"
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function NavLink({
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
      className="flex flex-col items-center gap-0.5 text-[#5A7A9A] hover:text-[#38BDF8] transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px]">{label}</span>
    </Link>
  );
}
