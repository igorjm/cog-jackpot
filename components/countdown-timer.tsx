"use client";

import { useEffect, useState } from "react";
import { getTimeUntilDeadline } from "@/lib/deadline";
import { CrystalBallIcon } from "@/components/icons/crystal-ball";

interface CountdownTimerProps {
  matchDate: Date;
}

export function CountdownTimer({ matchDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeUntilDeadline(matchDate));
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilDeadline(matchDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [matchDate]);

  if (timeLeft === null) {
    return (
      <span className="flex items-center gap-1 text-xs font-mono font-medium text-[#5A7A9A]">
        <CrystalBallIcon className="text-sm opacity-60" />
        --:--:--
      </span>
    );
  }

  if (timeLeft <= 0) {
    return (
      <span className="text-xs font-medium text-[#EF4444]">🔒 Encerrado</span>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const isUrgent = timeLeft < 60 * 60 * 1000;

  return (
    <span
      className={`flex items-center gap-1 text-xs font-mono font-semibold tabular-nums ${
        isUrgent ? "animate-pulse text-[#EF4444]" : "text-[#FACC15]"
      }`}
    >
      {days > 0 && `${days}d `}
      {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:
      {seconds.toString().padStart(2, "0")}
    </span>
  );
}
