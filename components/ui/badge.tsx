import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "points";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "info", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        {
          "bg-[#22C55E]/15 text-[#22C55E]":
            variant === "success",
          "bg-[#F97316]/15 text-[#F97316]":
            variant === "warning",
          "bg-[#EF4444]/15 text-[#EF4444]":
            variant === "error",
          "bg-[#38BDF8]/15 text-[#2DD4BF]":
            variant === "info",
          "bg-[#22C55E]/15 text-[#22C55E]":
            variant === "points",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
