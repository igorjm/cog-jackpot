"use client";

import { useRef, useState, useEffect } from "react";

export function BackgroundMusic({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3;
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true));
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-[#122448]/80 backdrop-blur border border-[#1E3A6E] flex items-center justify-center text-lg hover:border-[#FFD60A]/50 transition-colors"
        aria-label={playing ? "Pausar música" : "Tocar música"}
        title={playing ? "Pausar música" : "Tocar música"}
      >
        {playing ? "🔊" : "🔇"}
      </button>
    </>
  );
}
