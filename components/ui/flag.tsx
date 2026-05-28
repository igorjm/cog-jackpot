import { cn } from "@/lib/utils";

/**
 * Visual sizes for the flag asset. Maps to width in pixels (height follows 4:3 ratio).
 */
const SIZE_CLASSES = {
  xs: "w-4 h-3",    // 16 × 12
  sm: "w-6 h-[18px]", // 24 × 18
  md: "w-8 h-6",    // 32 × 24
  lg: "w-12 h-9",   // 48 × 36
  xl: "w-16 h-12",  // 64 × 48
  "2xl": "w-24 h-[72px]", // 96 × 72
  "3xl": "w-32 h-24", // 128 × 96
} as const;

export type FlagSize = keyof typeof SIZE_CLASSES;

interface FlagProps {
  /** ISO 3166-1 alpha-2 country code (lowercase), e.g. "br", "us", "gb-sct". Use "xx" for TBD. */
  code: string;
  /** Country name for accessibility (alt text / aria-label). */
  name?: string;
  size?: FlagSize;
  className?: string;
  style?: React.CSSProperties;
  /** Render as a rounded square (1:1) instead of 4:3 rectangle. */
  square?: boolean;
  /** Drop a subtle shadow for emphasis (used on hero areas). */
  withShadow?: boolean;
}

/**
 * Renders a country flag from the local `flag-icons` SVG asset library.
 * Falls back to a neutral "?" placeholder for TBD knockout slots (code === "xx").
 */
export function Flag({
  code,
  name,
  size = "md",
  className,
  style,
  square = false,
  withShadow = false,
}: FlagProps) {
  const normalized = code.toLowerCase();
  const sizeClass = SIZE_CLASSES[size];

  if (normalized === "xx" || !normalized) {
    return (
      <span
        aria-label={name ?? "A definir"}
        role="img"
        style={style}
        className={cn(
          "inline-flex items-center justify-center rounded-sm border border-[#1E3A6E] bg-[#1A3058] text-[10px] font-bold text-[#5A7A9A]",
          square ? "aspect-square" : "",
          sizeClass,
          className,
        )}
      >
        ?
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={name ?? normalized.toUpperCase()}
      title={name}
      style={style}
      className={cn(
        "fi",
        `fi-${normalized}`,
        square && "fis",
        "inline-block rounded-sm bg-cover bg-center bg-no-repeat",
        withShadow && "shadow-md shadow-black/40 ring-1 ring-black/20",
        sizeClass,
        className,
      )}
    />
  );
}
