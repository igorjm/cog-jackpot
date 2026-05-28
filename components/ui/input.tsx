import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-[#A8C3E8]">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-white/10 bg-[#0c1e3d] px-4 py-2.5 text-white placeholder:text-[#5A7A9A] transition-colors",
            "focus:border-[#FACC15]/50 focus:outline-none focus:ring-2 focus:ring-[#FACC15]/20",
            error && "border-[#EF4444]/50 focus:border-[#EF4444]/50 focus:ring-[#EF4444]/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
