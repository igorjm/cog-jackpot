"use client";

import { useRef, useState, useEffect } from "react";

export function BackgroundMusic({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3;

    // Try unmuted autoplay first
    audio.play().then(() => setPlaying(true)).catch(() => {
      // Browser blocked unmuted autoplay — start muted and unmute on first interaction
      audio.muted = true;
      audio.play();

      const unmute = () => {
        audio.muted = false;
        setPlaying(true);
        document.removeEventListener("click", unmute);
        document.removeEventListener("touchstart", unmute);
      };

      document.addEventListener("click", unmute, { once: true });
      document.addEventListener("touchstart", unmute, { once: true });
    });
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
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-[#162D54]/80 backdrop-blur border border-[#2A4A7A] flex items-center justify-center text-lg hover:border-[#FFD60A]/50 transition-colors"
        aria-label={playing ? "Pausar música" : "Tocar música"}
        title={playing ? "Pausar música" : "Tocar música"}
      >
        {playing ? "🔊" : "🔇"}
      </button>
    </>
  );
}
