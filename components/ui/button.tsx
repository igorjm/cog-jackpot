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
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]",
          {
            "bg-[#22C55E] text-black hover:bg-[#34D65C] shadow-lg shadow-[#22C55E]/25":
              variant === "primary",
            "bg-[#FFD60A] text-black hover:bg-[#FFE03A] shadow-lg shadow-[#FFD60A]/25":
              variant === "secondary",
            "bg-transparent text-[#38BDF8] hover:bg-[#38BDF8]/10":
              variant === "ghost",
            "bg-transparent border border-[#2A4A7A] text-white hover:bg-[#162D54]":
              variant === "outline",
            "bg-[#EF4444] text-white hover:bg-[#FF5E55] shadow-lg shadow-[#EF4444]/25":
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
