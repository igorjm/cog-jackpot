"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function PendingPage() {
  const [copied, setCopied] = useState(false);
  const pixKey = process.env.NEXT_PUBLIC_PIX_KEY ?? "chave-pix-nao-configurada";
  const entryFee = process.env.NEXT_PUBLIC_ENTRY_FEE ?? "50.00";

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Status badge */}
        <div className="text-center">
          <Badge variant="warning" className="text-sm px-4 py-1">
            ⏳ AGUARDANDO PAGAMENTO
          </Badge>
        </div>

        {/* Payment card */}
        <div className="bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-6 space-y-5">
          <h2 className="text-lg font-medium text-center">
            Realize o pagamento via PIX
          </h2>

          {/* Amount */}
          <p className="text-4xl font-[family-name:var(--font-oswald)] font-bold text-[#FFD60A] text-center">
            R$ {entryFee}
          </p>

          {/* QR Code placeholder */}
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pix-qrcode.png"
                alt="QR Code PIX"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                    '<span class="text-gray-400 text-xs text-center px-4">QR Code será adicionado</span>';
                }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2A4A7A]" />

          {/* PIX Key */}
          <div className="space-y-2">
            <p className="text-xs text-[#94B8D8]">Chave PIX:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-[#0F2347] px-3 py-2 rounded-lg text-white overflow-hidden text-ellipsis">
                {pixKey}
              </code>
              <Button variant="ghost" size="sm" onClick={copyPixKey}>
                {copied ? "✓" : "📋"}
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2">
          <p className="text-sm text-[#94B8D8]">
            Após o pagamento, o administrador liberará seu acesso em até 24h.
          </p>
          <p className="text-xs text-[#5A7A9A]">
            Dúvidas? Fale com o administrador.
          </p>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-white border-[#2A4A7A]"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sair
        </Button>
      </div>
    </div>
  );
}
