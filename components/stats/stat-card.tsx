interface StatCardProps {
  title: string;
  subtitle?: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function StatCard({ title, subtitle, legend, children, className = "" }: StatCardProps) {
  return (
    <div
      className={`bg-[#162D54] rounded-2xl border border-[#2A4A7A] p-4 ${className}`}
    >
      <div className="mb-3">
        <h2 className="text-sm font-bold text-[#FFD60A] font-[family-name:var(--font-oswald)] uppercase">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[10px] text-[#5A7A9A] mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
      {legend && <div className="mt-3 pt-2 border-t border-[#2A4A7A]/50">{legend}</div>}
    </div>
  );
}

export function EmptyChart({ message = "Aguardando resultados dos jogos" }: { message?: string }) {
  return (
    <p className="text-xs text-[#5A7A9A] text-center py-6">{message}</p>
  );
}
