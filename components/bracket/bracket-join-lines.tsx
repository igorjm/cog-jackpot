interface BracketJoinLinesProps {
  height: number;
  side: "left" | "right";
  width?: number;
}

export function BracketJoinLines({
  height,
  side,
  width = 22,
}: BracketJoinLinesProps) {
  const q1 = height * 0.25;
  const q3 = height * 0.75;
  const mid = height * 0.5;
  const stroke = "rgba(255, 214, 10, 0.35)";

  if (side === "left") {
    return (
      <svg width={width} height={height} className="shrink-0" aria-hidden="true">
        <path
          d={`M 0 ${q1} H ${width * 0.45} V ${mid} H ${width}`}
          stroke={stroke}
          fill="none"
          strokeWidth={1}
        />
        <path
          d={`M 0 ${q3} H ${width * 0.45} V ${mid} H ${width}`}
          stroke={stroke}
          fill="none"
          strokeWidth={1}
        />
      </svg>
    );
  }

  return (
    <svg width={width} height={height} className="shrink-0" aria-hidden="true">
      <path
        d={`M ${width} ${q1} H ${width * 0.55} V ${mid} H 0`}
        stroke={stroke}
        fill="none"
        strokeWidth={1}
      />
      <path
        d={`M ${width} ${q3} H ${width * 0.55} V ${mid} H 0`}
        stroke={stroke}
        fill="none"
        strokeWidth={1}
      />
    </svg>
  );
}
