import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#94B8D8] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 bg-[#122448] border border-[#1E3A6E] rounded-xl text-white placeholder-[#5A7A9A] transition-all duration-200",
            "focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/50",
            error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[#EF4444]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
