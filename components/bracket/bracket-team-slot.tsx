import Image from "next/image";
import Link from "next/link";
import { shortPlaceholderLabel, type BracketSlotSize } from "@/lib/bracket-tree";
import { cn, getFlagSrc, isClubFlag } from "@/lib/utils";

const SIZE_PX: Record<BracketSlotSize, number> = {
  sm: 28,
  md: 32,
  lg: 38,
  xl: 46,
  final: 56,
};

interface BracketTeamSlotProps {
  team: string;
  flag: string;
  size: BracketSlotSize;
  isWinner?: boolean;
  matchId?: string;
  title?: string;
}

export function BracketTeamSlot({
  team,
  flag,
  size,
  isWinner = false,
  matchId,
  title,
}: BracketTeamSlotProps) {
  const px = SIZE_PX[size];
  const isPlaceholder = flag === "xx";
  const label = shortPlaceholderLabel(team, flag);
  const tooltip = title ?? team;

  const inner = (
    <div
      className={cn(
        "relative rounded-full shrink-0 overflow-hidden bg-[#0F2347] transition-all",
        isWinner
          ? "ring-2 ring-[#FFD60A] shadow-[0_0_12px_rgba(255,214,10,0.45)]"
          : "ring-1 ring-[#FFD60A]/25",
        isPlaceholder && "flex items-center justify-center bg-[#162D54]"
      )}
      style={{ width: px, height: px }}
      title={tooltip}
    >
      {isPlaceholder ? (
        <span
          className="font-[family-name:var(--font-oswald)] font-bold text-[#FFD60A]/80 leading-none"
          style={{ fontSize: px <= 28 ? 9 : px <= 38 ? 10 : 11 }}
        >
          {label}
        </span>
      ) : (
        <Image
          src={getFlagSrc(flag, px * 2)}
          alt={team}
          width={px}
          height={px}
          className={cn("object-cover w-full h-full", isClubFlag(flag) && "p-0.5")}
        />
      )}
    </div>
  );

  if (matchId) {
    return (
      <Link href={`/matches/${matchId}`} className="hover:scale-110 transition-transform">
        {inner}
      </Link>
    );
  }

  return inner;
}
