import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "points";
  className?: string;
}

export function Badge({ children, variant = "info", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        {
          "bg-[#FACC15]/20 text-[#FACC15]": variant === "success",
          "bg-[#22C55E]/20 text-[#22C55E]": variant === "points",
          "bg-[#FACC15]/20 text-[#FACC15]": variant === "warning",
          "bg-[#EF4444]/20 text-[#EF4444]": variant === "error",
          "bg-[#38BDF8]/15 text-[#38BDF8]": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
