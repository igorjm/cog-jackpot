"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface AvatarOption {
  name: string;
  path: string;
}

interface AvatarGroup {
  country: string;
  players: AvatarOption[];
}

const COUNTRY_FLAGS: Record<string, string> = {
  brazil: "br",
  france: "fr",
  argentina: "ar",
  germany: "de",
  spain: "es",
  italy: "it",
  england: "gb-eng",
  portugal: "pt",
};

const COUNTRY_LABELS: Record<string, string> = {
  brazil: "Brasil",
  france: "França",
  argentina: "Argentina",
  germany: "Alemanha",
  spain: "Espanha",
  italy: "Itália",
  england: "Inglaterra",
  portugal: "Portugal",
};

interface AvatarPickerProps {
  value?: string;
  onChange: (path: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [groups, setGroups] = useState<AvatarGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/avatars")
      .then((res) => res.json())
      .then((data) => {
        setGroups(data);
        setLoading(false);
      });
  }, []);

  // Auto-select country if value is already set
  useEffect(() => {
    if (value && groups.length > 0) {
      const group = groups.find((g) =>
        g.players.some((p) => p.path === value)
      );
      if (group) setSelectedCountry(group.country);
    }
  }, [value, groups]);

  if (loading) {
    return (
      <div className="text-sm text-[#94B8D8] py-4 text-center">
        Carregando avatares...
      </div>
    );
  }

  const selectedGroup = groups.find((g) => g.country === selectedCountry);

  return (
    <div className="space-y-3">
      <label className="text-sm font-[family-name:var(--font-oswald)] font-bold uppercase text-white tracking-wide">
        Escolha seu avatar
      </label>

      {/* Country flags grid */}
      <div className="grid grid-cols-6 gap-2">
        {groups.map((group) => (
          <button
            key={group.country}
            type="button"
            onClick={() => setSelectedCountry(group.country)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
              selectedCountry === group.country
                ? "border-[#FFD60A] bg-[#FFD60A]/10 scale-105"
                : "border-[#2A4A7A] hover:border-[#94B8D8]/50 bg-[#162D54]"
            }`}
          >
            <img
              src={`https://flagcdn.com/${COUNTRY_FLAGS[group.country] || group.country}.svg`}
              alt={COUNTRY_LABELS[group.country] || group.country}
              className="w-8 h-6 object-cover rounded-sm"
              loading="eager"
            />
            <span className="text-[9px] text-[#94B8D8] truncate w-full text-center">
              {COUNTRY_LABELS[group.country] || group.country}
            </span>
          </button>
        ))}
      </div>

      {/* Player avatars for selected country */}
      {selectedGroup && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-xs text-[#94B8D8] font-medium">
            Selecione um jogador de {COUNTRY_LABELS[selectedGroup.country] || selectedGroup.country}:
          </p>
          <div className="grid grid-cols-6 gap-2">
            {selectedGroup.players.map((player) => (
              <button
                key={player.path}
                type="button"
                onClick={() => onChange(player.path)}
                className={`relative w-full aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all ${
                  value === player.path
                    ? "border-[#FFD60A] shadow-lg shadow-[#FFD60A]/20 scale-105"
                    : "border-[#2A4A7A] hover:border-[#94B8D8]/50"
                }`}
              >
                <Image
                  src={player.path}
                  alt={player.name}
                  fill
                  className="object-cover"
                  sizes="60px"
                />
                {value === player.path && (
                  <div className="absolute inset-0 bg-[#FFD60A]/10 flex items-end justify-center">
                    <span className="text-[10px] bg-[#FFD60A] text-[#0F2347] font-bold px-1.5 py-0.5 rounded-t-md">
                      ✓
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!selectedCountry && (
        <p className="text-xs text-[#5A7A9A]">
          Selecione uma seleção acima para ver os avatares disponíveis
        </p>
      )}
    </div>
  );
}
