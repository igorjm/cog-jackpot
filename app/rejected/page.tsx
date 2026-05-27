"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function RejectedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6 text-center">
        <Badge variant="error" className="text-sm px-4 py-1">
          ❌ ACESSO NEGADO
        </Badge>

        <div className="bg-[#122448] rounded-2xl border border-[#1E3A6E] p-6 space-y-4">
          <h2 className="text-lg font-medium">Sua inscrição foi rejeitada</h2>
          <p className="text-sm text-[#94B8D8]">
            Caso acredite que houve um erro, entre em contato com o administrador do bolão.
          </p>
        </div>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sair
        </Button>
      </div>
    </div>
  );
}
