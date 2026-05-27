import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin header */}
      <header className="sticky top-0 z-50 bg-[#0A1A3A]/80 backdrop-blur-xl border-b border-[#EF4444]/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-[#94B8D8] hover:text-white">
              ← App
            </Link>
            <span className="text-lg font-[family-name:var(--font-oswald)] font-bold text-[#EF4444] uppercase">
              Admin
            </span>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-4 pb-2 flex gap-4">
          <Link href="/admin" className="text-sm text-[#94B8D8] hover:text-white">
            Dashboard
          </Link>
          <Link href="/admin/users" className="text-sm text-[#94B8D8] hover:text-white">
            Participantes
          </Link>
          <Link href="/admin/results" className="text-sm text-[#94B8D8] hover:text-white">
            Resultados
          </Link>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
