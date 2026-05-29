"use client";

interface ShareBetButtonProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  phase: string;
}

export function ShareBetButton({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  phase,
}: ShareBetButtonProps) {
  const message = `⚽ Meu palpite pro Bolão Copa 2026:\n${homeTeam} ${homeScore} × ${awayScore} ${awayTeam}\n🏆 ${phase}`;

  const handleShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleShare}
      className="text-xs font-semibold px-3 py-1 rounded-full border border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/10 transition-all active:scale-95"
      title="Compartilhar no WhatsApp"
    >
      📤
    </button>
  );
}
