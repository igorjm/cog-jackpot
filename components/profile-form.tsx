"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AvatarPicker } from "@/components/avatar-picker";
import { updateProfileAction, changePasswordAction } from "@/app/actions/profile";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    nickname: string;
    avatar: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleProfileSubmit(formData: FormData) {
    setProfileMsg(null);
    setProfileLoading(true);
    const result = await updateProfileAction(formData);
    if (result?.error) {
      setProfileMsg({ type: "error", text: result.error });
    } else if (result?.success) {
      setProfileMsg({ type: "success", text: "Perfil atualizado com sucesso!" });
    }
    setProfileLoading(false);
  }

  async function handlePasswordSubmit(formData: FormData) {
    setPasswordMsg(null);
    setPasswordLoading(true);
    const result = await changePasswordAction(formData);
    if (result?.error) {
      setPasswordMsg({ type: "error", text: result.error });
    } else if (result?.success) {
      setPasswordMsg({ type: "success", text: "Senha alterada com sucesso!" });
    }
    setPasswordLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="bg-[#162D54] border border-[#2A4A7A] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-[family-name:var(--font-oswald)] font-bold text-white uppercase">
          Informações
        </h2>

        <form action={handleProfileSubmit} className="space-y-4">
          <Input
            name="name"
            type="text"
            label="Nome completo"
            defaultValue={user.name}
            required
            minLength={2}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-[#94B8D8] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 bg-[#0F2347] border border-[#2A4A7A] rounded-xl text-[#5A7A9A] cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-[#5A7A9A]">Email não pode ser alterado</p>
          </div>
          <Input
            name="nickname"
            type="text"
            label="Apelido (exibido no ranking)"
            defaultValue={user.nickname}
            required
            minLength={2}
            maxLength={20}
          />

          <AvatarPicker value={avatar} onChange={setAvatar} />
          <input type="hidden" name="avatar" value={avatar} />

          {profileMsg && (
            <p className={`text-sm text-center ${profileMsg.type === "success" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
              {profileMsg.text}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={profileLoading}>
            {profileLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-[#162D54] border border-[#2A4A7A] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-[family-name:var(--font-oswald)] font-bold text-white uppercase">
          Alterar Senha
        </h2>

        <form action={handlePasswordSubmit} className="space-y-4">
          <Input
            name="currentPassword"
            type="password"
            label="Senha atual"
            placeholder="••••••••"
            required
          />
          <Input
            name="newPassword"
            type="password"
            label="Nova senha"
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
          />
          <Input
            name="confirmNewPassword"
            type="password"
            label="Confirmar nova senha"
            placeholder="••••••••"
            required
            minLength={8}
          />

          {passwordMsg && (
            <p className={`text-sm text-center ${passwordMsg.type === "success" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
              {passwordMsg.text}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={passwordLoading}>
            {passwordLoading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
