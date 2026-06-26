"use client";

import { useState, useRef } from "react";
import { MatchBetsDrawer } from "./match-bets-drawer";

interface MatchBetsDrawerTriggerProps {
  matchId: string;
  label?: string;
  className?: string;
}

export function MatchBetsDrawerTrigger({
  matchId,
  label = "Ver palpites dos amigos",
  className = "w-full text-sm font-medium text-[#38BDF8] bg-[#38BDF8]/10 px-4 py-2.5 rounded-xl border border-[#38BDF8]/20 hover:bg-[#38BDF8]/15 transition-colors cursor-pointer",
}: MatchBetsDrawerTriggerProps) {
  const [open, setOpen] = useState(false);
  const closeGuard = useRef(false);

  const handleClose = () => {
    setOpen(false);
    closeGuard.current = true;
    setTimeout(() => {
      closeGuard.current = false;
    }, 300);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (closeGuard.current) return;
          setOpen(true);
        }}
        className={className}
      >
        {label}
      </button>

      {open && <MatchBetsDrawer matchId={matchId} onClose={handleClose} />}
    </>
  );
}
