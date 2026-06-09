"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveUser, rejectUser, resetUserPassword } from "@/app/actions/admin";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  nickname: string;
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetResult, setResetResult] = useState<{ nickname: string; password: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const handleApprove = async (userId: string) => {
    await approveUser(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "APPROVED" } : u))
    );
  };

  const handleReject = async (userId: string) => {
    await rejectUser(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "REJECTED" } : u))
    );
  };

  const handleReset = async (userId: string, nickname: string) => {
    if (!confirm(`Resetar senha de @${nickname}?`)) return;
    const result = await resetUserPassword(userId);
    if (result.tempPassword) {
      setResetResult({ nickname, password: result.tempPassword });
    }
  };

  if (loading) {
    return <div className="animate-pulse h-40 bg-[#162D54] rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase">
        Participantes
      </h1>

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-4 flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <Badge
                  variant={
                    user.status === "APPROVED"
                      ? "success"
                      : user.status === "REJECTED"
                      ? "error"
                      : "warning"
                  }
                >
                  {user.status === "APPROVED"
                    ? "Aprovado"
                    : user.status === "REJECTED"
                    ? "Rejeitado"
                    : "Pendente"}
                </Badge>
              </div>
              <p className="text-xs text-[#94B8D8]">
                {user.email} • @{user.nickname}
              </p>
            </div>

            <div className="flex gap-2">
              {user.status === "PENDING_PAYMENT" && (
                <>
                  <Button size="sm" onClick={() => handleApprove(user.id)}>
                    Aprovar
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleReject(user.id)}>
                    Rejeitar
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleReset(user.id, user.nickname)}
                title="Resetar senha"
              >
                🔑
              </Button>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-[#94B8D8]">
          Nenhum participante cadastrado.
        </div>
      )}

      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#162D54] rounded-xl border border-[#2A4A7A] p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-[#FFD60A]">Senha resetada!</h3>
            <p className="text-sm text-[#94B8D8]">
              Nova senha para <span className="text-white font-medium">@{resetResult.nickname}</span>:
            </p>
            <p className="text-center text-2xl font-mono font-bold tracking-widest text-white bg-[#0F2347] rounded-lg py-3">
              {resetResult.password}
            </p>
            <p className="text-xs text-[#5A7A9A]">
              Copie e envie por WhatsApp. O usuário pode trocar depois no perfil.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(resetResult.password);
                }}
              >
                Copiar
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={() => setResetResult(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
