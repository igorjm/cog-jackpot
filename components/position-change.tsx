interface PositionChangeProps {
  change: number;
}

export function PositionChange({ change }: PositionChangeProps) {
  if (change === 0) {
    return <span className="text-xs text-[#5A7A9A]">—</span>;
  }

  if (change > 0) {
    return (
      <span className="text-xs font-medium text-[#FACC15]">
        ↑{change}
      </span>
    );
  }

  return (
    <span className="text-xs text-[#EF4444] font-medium">
      ↓{Math.abs(change)}
    </span>
  );
}
