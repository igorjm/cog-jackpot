import { cn } from "@/lib/utils";

type StatVariant = "gold" | "green" | "white";

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  variant?: StatVariant;
  overlay?: boolean;
  className?: string;
}

const valueStyles: Record<StatVariant, string> = {
  gold: "text-[#FACC15]",
  green: "text-[#22C55E]",
  white: "text-white",
};

export function StatCard({
  icon,
  value,
  label,
  variant = "gold",
  overlay = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        overlay
          ? "rounded-xl border border-white/15 bg-black/40 px-2 py-2.5 backdrop-blur-md"
          : "card-premium card-premium-gold rounded-2xl px-3 py-3.5",
        className
      )}
    >
      <span className={cn("mb-0.5", overlay ? "text-base" : "mb-1 text-lg")} aria-hidden>
        {icon}
      </span>
      <p
        className={cn(
          "font-mono font-bold tabular-nums",
          overlay ? "text-xl" : "text-2xl",
          valueStyles[variant]
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-0.5 font-medium uppercase tracking-wide",
          variant === "green" ? "text-[#22C55E]" : "text-[#A8C3E8]",
          overlay ? "text-[9px]" : "text-[10px]"
        )}
      >
        {label}
      </p>
    </div>
  );
}
