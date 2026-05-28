import { cn } from "@/lib/utils";

export function CrystalBallIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-base leading-none drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]",
        className
      )}
      aria-hidden
    >
      🔮
    </span>
  );
}

export function SoccerBallIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-base leading-none",
        className
      )}
      aria-hidden
    >
      ⚽
    </span>
  );
}
