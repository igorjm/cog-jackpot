import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.97]",
          {
            "bg-[#22C55E] text-[#020810] shadow-lg shadow-[#22C55E]/30 hover:bg-[#34D65C]":
              variant === "primary",
            "bg-gradient-to-b from-[#FDE68A] to-[#FACC15] text-[#020810] shadow-lg shadow-[#FACC15]/25 hover:from-[#FEF08A] hover:to-[#FDE047]":
              variant === "secondary",
            "bg-transparent text-[#A8C3E8] hover:bg-white/5 hover:text-white":
              variant === "ghost",
            "border border-white/15 bg-transparent text-white hover:border-white/25 hover:bg-[#0c1e3d]":
              variant === "outline",
            "bg-[#EF4444] text-white shadow-lg shadow-[#EF4444]/25 hover:bg-[#FF5E55]":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
