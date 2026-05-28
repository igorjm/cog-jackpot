import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, nickname: true, avatar: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-oswald)] font-bold uppercase text-[#FFD60A]">
          Meu Perfil
        </h1>
        <p className="text-sm text-[#94B8D8] mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
