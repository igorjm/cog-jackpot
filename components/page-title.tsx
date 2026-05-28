import { cn } from "@/lib/utils";

interface PageTitleProps {
  children: React.ReactNode;
  icon?: string;
  className?: string;
}

export function PageTitle({ children, icon, className }: PageTitleProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {icon && <span className="text-xl" aria-hidden>{icon}</span>}
      <h1 className="page-title text-center text-xl text-gold-gradient sm:text-2xl">
        {children}
      </h1>
      {icon && <span className="text-xl" aria-hidden>{icon}</span>}
    </div>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-sm font-extrabold uppercase tracking-widest text-[#A8C3E8]",
        className
      )}
    >
      {children}
    </h2>
  );
}
