"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveUser, rejectUser } from "@/app/actions/admin";
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

  if (loading) {
    return <div className="animate-pulse h-40 bg-[#122448] rounded-xl" />;
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
            className="bg-[#122448] rounded-xl border border-[#1E3A6E] p-4 flex items-center justify-between gap-3"
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

            {user.status === "PENDING_PAYMENT" && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleApprove(user.id)}>
                  Aprovar
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleReject(user.id)}>
                  Rejeitar
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-[#94B8D8]">
          Nenhum participante cadastrado.
        </div>
      )}
    </div>
  );
}
