import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";

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
    <div className="min-h-screen flex flex-col relative">
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

      {/* Admin header */}
      <header className="sticky top-0 z-50 bg-[#0A1A3A]/95 backdrop-blur-xl border-b border-[#EF4444]/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-[#94B8D8] hover:text-white transition-colors"
          >
            ← App
          </Link>
          <span className="px-2.5 py-1 rounded-md bg-[#EF4444]/15 text-xs font-bold text-[#EF4444] uppercase tracking-wider border border-[#EF4444]/30">
            Admin
          </span>
        </div>
        <AdminNav />
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 relative z-10">
        {children}
      </main>
    </div>
  );
}
