import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const status = (session.user as { status: string }).status;
    if (status === "PENDING_PAYMENT") redirect("/pending");
    if (status === "REJECTED") redirect("/rejected");
    redirect("/dashboard");
  }

  redirect("/login");
}
