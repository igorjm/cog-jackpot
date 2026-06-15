"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { savePrediction } from "@/app/actions/predictions";
import { getFlagSrc, getInitials } from "@/lib/utils";

type AllPrediction = {
  userId: string;
  nickname: string;
  name: string;
  avatar: string | null;
  champion: string | null;
  topScorer: string | null;
};

const TEAMS: { name: string; flag: string }[] = [
  { name: "México", flag: "mx" },
  { name: "África do Sul", flag: "za" },
  { name: "Coreia do Sul", flag: "kr" },
  { name: "República Tcheca", flag: "cz" },
  { name: "Canadá", flag: "ca" },
  { name: "Bósnia e Herzegovina", flag: "ba" },
  { name: "Catar", flag: "qa" },
  { name: "Suíça", flag: "ch" },
  { name: "Brasil", flag: "br" },
  { name: "Marrocos", flag: "ma" },
  { name: "Haiti", flag: "ht" },
  { name: "Escócia", flag: "gb-sct" },
  { name: "Estados Unidos", flag: "us" },
  { name: "Paraguai", flag: "py" },
  { name: "Austrália", flag: "au" },
  { name: "Turquia", flag: "tr" },
  { name: "Alemanha", flag: "de" },
  { name: "Curaçao", flag: "cw" },
  { name: "Costa do Marfim", flag: "ci" },
  { name: "Equador", flag: "ec" },
  { name: "Holanda", flag: "nl" },
  { name: "Japão", flag: "jp" },
  { name: "Suécia", flag: "se" },
  { name: "Tunísia", flag: "tn" },
  { name: "Bélgica", flag: "be" },
  { name: "Egito", flag: "eg" },
  { name: "Irã", flag: "ir" },
  { name: "Nova Zelândia", flag: "nz" },
  { name: "Espanha", flag: "es" },
  { name: "Cabo Verde", flag: "cv" },
  { name: "Arábia Saudita", flag: "sa" },
  { name: "Uruguai", flag: "uy" },
  { name: "França", flag: "fr" },
  { name: "Senegal", flag: "sn" },
  { name: "Iraque", flag: "iq" },
  { name: "Noruega", flag: "no" },
  { name: "Argentina", flag: "ar" },
  { name: "Argélia", flag: "dz" },
  { name: "Áustria", flag: "at" },
  { name: "Jordânia", flag: "jo" },
  { name: "Portugal", flag: "pt" },
  { name: "RD Congo", flag: "cd" },
  { name: "Uzbequistão", flag: "uz" },
  { name: "Colômbia", flag: "co" },
  { name: "Inglaterra", flag: "gb-eng" },
  { name: "Croácia", flag: "hr" },
  { name: "Gana", flag: "gh" },
  { name: "Panamá", flag: "pa" },
];

const POPULAR_PLAYERS: { name: string; team: string; flag: string }[] = [
  { name: "Kylian Mbappé", team: "França", flag: "fr" },
  { name: "Erling Haaland", team: "Noruega", flag: "no" },
  { name: "Lionel Messi", team: "Argentina", flag: "ar" },
  { name: "Vinícius Júnior", team: "Brasil", flag: "br" },
  { name: "Lautaro Martínez", team: "Argentina", flag: "ar" },
  { name: "Harry Kane", team: "Inglaterra", flag: "gb-eng" },
  { name: "Viktor Gyökeres", team: "Suécia", flag: "se" },
  { name: "Marcus Thuram", team: "França", flag: "fr" },
  { name: "Memphis Depay", team: "Holanda", flag: "nl" },
  { name: "Mohamed Salah", team: "Egito", flag: "eg" },
  { name: "Cristiano Ronaldo", team: "Portugal", flag: "pt" },
  { name: "Raphinha", team: "Brasil", flag: "br" },
  { name: "Neymar", team: "Brasil", flag: "br" },
  { name: "Cody Gakpo", team: "Holanda", flag: "nl" },
  { name: "Romelu Lukaku", team: "Bélgica", flag: "be" },
  { name: "Kai Havertz", team: "Alemanha", flag: "de" },
  { name: "Darwin Núñez", team: "Uruguai", flag: "uy" },
  { name: "Julián Álvarez", team: "Argentina", flag: "ar" },
  { name: "Bukayo Saka", team: "Inglaterra", flag: "gb-eng" },
  { name: "Luis Díaz", team: "Colômbia", flag: "co" },
  { name: "Florian Wirtz", team: "Alemanha", flag: "de" },
  { name: "Jamal Musiala", team: "Alemanha", flag: "de" },
  { name: "Endrick", team: "Brasil", flag: "br" },
  { name: "Christian Pulisic", team: "Estados Unidos", flag: "us" },
  { name: "Lamine Yamal", team: "Espanha", flag: "es" },
  { name: "Sadio Mané", team: "Senegal", flag: "sn" },
  { name: "Son Heung-min", team: "Coreia do Sul", flag: "kr" },
  { name: "Andrej Kramarić", team: "Croácia", flag: "hr" },
  { name: "Alexander Isak", team: "Suécia", flag: "se" },
  { name: "Alexander Sørloth", team: "Noruega", flag: "no" },
  { name: "Gonçalo Ramos", team: "Portugal", flag: "pt" },
  { name: "Mehdi Taremi", team: "Irã", flag: "ir" },
];

// Deadline: June 11, 2026 19:00 UTC
const PREDICTIONS_DEADLINE = new Date("2026-06-11T19:00:00Z");

function useCountdown(target: Date) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isExpired: diff === 0 };
}

export default function PredictionsPage() {
  const countdown = useCountdown(PREDICTIONS_DEADLINE);
  const [champion, setChampion] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<"CHAMPION" | "TOP_SCORER" | null>(null);
  const [messages, setMessages] = useState<{ champion?: string; topScorer?: string }>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [allPredictions, setAllPredictions] = useState<AllPrediction[]>([]);

  useEffect(() => {
    fetch("/api/predictions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          for (const p of data) {
            if (p.type === "CHAMPION") setChampion(p.value);
            if (p.type === "TOP_SCORER") setTopScorer(p.value);
          }
        }
      })
      .finally(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    if (!countdown.isExpired) return;
    fetch("/api/predictions/all")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setAllPredictions(data); })
      .catch(() => {});
  }, [countdown.isExpired]);

  const filteredPlayers = useMemo(() => {
    if (!search.trim()) return POPULAR_PLAYERS;
    const q = search.toLowerCase();
    return POPULAR_PLAYERS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSave = async (type: "CHAMPION" | "TOP_SCORER", value: string) => {
    if (!value.trim() || countdown.isExpired) return;

    setLoading(type);
    const key = type === "CHAMPION" ? "champion" : "topScorer";
    setMessages((prev) => ({ ...prev, [key]: undefined }));

    const result = await savePrediction(type, value);

    if (result.error) {
      setMessages((prev) => ({ ...prev, [key]: result.error }));
    } else {
      if (type === "CHAMPION") setChampion(value);
      else setTopScorer(value);
      setMessages((prev) => ({ ...prev, [key]: "✓ Salvo!" }));
      setTimeout(() => setMessages((prev) => ({ ...prev, [key]: undefined })), 2500);
    }
    setLoading(null);
  };

  const handleSelectScorer = (name: string) => {
    setTopScorer(name);
    setSearch("");
    handleSave("TOP_SCORER", name);
  };

  const selectedTeamFlag = TEAMS.find((t) => t.name === champion)?.flag;

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-[#162D54] rounded-2xl animate-pulse" />
        <div className="h-64 bg-[#162D54] rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 -mx-4 -mt-6 md:mx-0 md:mt-0">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-none md:rounded-2xl bg-gradient-to-br from-[#1a3a6b] via-[#162D54] to-[#2a1a5e] px-5 py-6">
        <div className="absolute inset-0 bg-[url('/background-app.png')] opacity-[0.04] bg-cover" />
        <div className="relative z-10">
          <Link
            href="/matches"
            className="inline-flex items-center gap-1 text-xs text-[#94B8D8] hover:text-white mb-3 transition-colors"
          >
            ← Voltar aos Jogos
          </Link>

          <h1 className="text-2xl font-bold font-[family-name:var(--font-oswald)] uppercase text-white">
            Palpites Especiais
          </h1>
          <p className="text-sm text-[#94B8D8] mt-1">
            Dois palpites bônus valendo <span className="text-[#22C55E] font-bold">+10</span> e{" "}
            <span className="text-[#22C55E] font-bold">+10</span> pontos.
          </p>

          {/* Countdown */}
          {!countdown.isExpired ? (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#94B8D8]">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>
                  Prazo:{" "}
                  <span className="text-[#FFD60A] font-medium">Qua 11 Jun, 16:00</span>
                  {" "}— primeiro jogo da fase de grupos
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#EF4444]">
              <span>🔒 Prazo encerrado</span>
            </div>
          )}

          {!countdown.isExpired && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="font-mono text-sm font-bold text-[#22C55E]">
                {countdown.days > 0 && <span>{countdown.days}d </span>}
                {String(countdown.hours).padStart(2, "0")}:
                {String(countdown.minutes).padStart(2, "0")}:
                {String(countdown.seconds).padStart(2, "0")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pick the Champion */}
      <section className="px-4 md:px-0 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold font-[family-name:var(--font-oswald)] uppercase text-white">
            <span>🏆</span> Escolha o Campeão
          </h2>
          {champion && (
            <span className="flex items-center gap-1.5 text-xs font-medium bg-[#22C55E]/15 text-[#22C55E] px-2.5 py-1 rounded-full border border-[#22C55E]/30">
              {selectedTeamFlag && (
                <Image
                  src={getFlagSrc(selectedTeamFlag, 20)}
                  alt=""
                  width={14}
                  height={10}
                  className="rounded-[2px]"
                  unoptimized
                />
              )}
              {champion}
            </span>
          )}
        </div>

        {messages.champion && (
          <p className={`text-xs ${messages.champion.startsWith("✓") ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
            {messages.champion}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {TEAMS.map((team) => {
            const isSelected = champion === team.name;
            return (
              <button
                key={team.name}
                onClick={() => !countdown.isExpired && handleSave("CHAMPION", team.name)}
                disabled={countdown.isExpired || loading === "CHAMPION"}
                className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-[#22C55E]/15 border-[#22C55E]/50 ring-1 ring-[#22C55E]/30"
                    : "bg-[#162D54]/80 border-[#2A4A7A]/50 hover:bg-[#1E3862] hover:border-[#38BDF8]/30"
                } ${countdown.isExpired ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Image
                  src={getFlagSrc(team.flag, 40)}
                  alt={team.name}
                  width={32}
                  height={22}
                  className="rounded-[3px]"
                  unoptimized
                />
                <span className={`text-[10px] leading-tight text-center font-medium truncate w-full ${
                  isSelected ? "text-[#22C55E]" : "text-[#94B8D8]"
                }`}>
                  {team.name}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-[#22C55E] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Pick the Top Scorer */}
      <section className="px-4 md:px-0 space-y-3 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold font-[family-name:var(--font-oswald)] uppercase text-white">
            <span>⚽</span> Escolha o Artilheiro
          </h2>
          {topScorer && (
            <span className="flex items-center gap-1.5 text-xs font-medium bg-[#22C55E]/15 text-[#22C55E] px-2.5 py-1 rounded-full border border-[#22C55E]/30">
              {topScorer}
            </span>
          )}
        </div>

        {messages.topScorer && (
          <p className={`text-xs ${messages.topScorer.startsWith("✓") ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
            {messages.topScorer}
          </p>
        )}

        {/* Search / custom input */}
        <div className="relative">
          <input
            type="text"
            value={search || topScorer}
            onChange={(e) => {
              setSearch(e.target.value);
              if (topScorer) setTopScorer("");
            }}
            onFocus={() => { if (topScorer) { setSearch(topScorer); setTopScorer(""); } }}
            placeholder="Buscar jogador ou time..."
            disabled={countdown.isExpired}
            className="w-full bg-[#162D54]/80 border border-[#2A4A7A] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#5A7A9A] focus:outline-none focus:ring-2 focus:ring-[#FFD60A]/40 focus:border-[#FFD60A]/50 disabled:opacity-60 transition-all"
          />
          {search && !countdown.isExpired && (
            <button
              onClick={() => handleSave("TOP_SCORER", search)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-[#22C55E] text-white px-3 py-1.5 rounded-lg font-medium hover:brightness-110 transition-all"
            >
              Salvar
            </button>
          )}
        </div>

        {/* Player suggestions */}
        {!countdown.isExpired && (
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
            {filteredPlayers.map((player) => {
              const isSelected = topScorer === player.name;
              return (
                <button
                  key={player.name}
                  onClick={() => handleSelectScorer(player.name)}
                  disabled={loading === "TOP_SCORER"}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-[#22C55E]/15 border-[#22C55E]/50"
                      : "bg-[#162D54]/60 border-[#2A4A7A]/40 hover:bg-[#1E3862] hover:border-[#38BDF8]/30"
                  }`}
                >
                  <Image
                    src={getFlagSrc(player.flag, 40)}
                    alt={player.team}
                    width={24}
                    height={16}
                    className="rounded-[2px] shrink-0"
                    unoptimized
                  />
                  <div className="flex flex-col items-start">
                    <span className={`text-sm font-medium ${isSelected ? "text-[#22C55E]" : "text-white"}`}>
                      {player.name}
                    </span>
                    <span className="text-[10px] text-[#5A7A9A]">{player.team}</span>
                  </div>
                  {isSelected && (
                    <div className="ml-auto w-4 h-4 bg-[#22C55E] rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </button>
              );
            })}
            {filteredPlayers.length === 0 && search && (
              <p className="text-xs text-[#5A7A9A] text-center py-4">
                Nenhum jogador encontrado. Use o botão &quot;Salvar&quot; para registrar seu palpite.
              </p>
            )}
          </div>
        )}
      </section>

      {/* All players' predictions — visible only after deadline */}
      {countdown.isExpired && allPredictions.length > 0 && (
        <section className="px-4 md:px-0 space-y-3 pb-8">
          <h2 className="flex items-center gap-2 text-base font-bold font-[family-name:var(--font-oswald)] uppercase text-white">
            <span>👥</span> Palpites de Todos
          </h2>
          <p className="text-xs text-[#94B8D8]">
            Veja o que cada participante apostou para campeão e artilheiro.
          </p>
          <div className="space-y-2">
            {allPredictions.map((p) => {
              const teamFlag = p.champion ? TEAMS.find((t) => t.name === p.champion)?.flag : null;
              const playerFlag = p.topScorer
                ? POPULAR_PLAYERS.find((pl) => pl.name === p.topScorer)?.flag
                : null;
              return (
                <div
                  key={p.userId}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#162D54] border border-[#2A4A7A]"
                >
                  {/* Avatar */}
                  {p.avatar ? (
                    <Image
                      src={p.avatar}
                      alt=""
                      width={32}
                      height={40}
                      className="w-8 h-10 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#1E3862] flex items-center justify-center text-xs font-bold text-[#94B8D8] shrink-0">
                      {getInitials(p.name)}
                    </div>
                  )}
                  {/* Nickname */}
                  <span className="text-sm font-medium text-white min-w-0 flex-1 truncate">
                    {p.nickname}
                  </span>
                  {/* Champion */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {teamFlag ? (
                      <>
                        <Image
                          src={getFlagSrc(teamFlag, 40)}
                          alt={p.champion!}
                          width={20}
                          height={14}
                          className="rounded-[2px]"
                          unoptimized
                        />
                        <span className="text-xs text-[#94B8D8] max-w-[80px] truncate hidden sm:inline">
                          {p.champion}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-[#5A7A9A] italic">
                        {p.champion ?? "—"}
                      </span>
                    )}
                  </div>
                  <div className="w-px h-5 bg-[#2A4A7A] shrink-0" />
                  {/* Top scorer */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {playerFlag ? (
                      <>
                        <Image
                          src={getFlagSrc(playerFlag, 40)}
                          alt={p.topScorer!}
                          width={16}
                          height={11}
                          className="rounded-[2px]"
                          unoptimized
                        />
                        <span className="text-xs text-[#94B8D8] max-w-[80px] truncate">
                          {p.topScorer}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-[#5A7A9A] italic">
                        {p.topScorer ?? "—"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
