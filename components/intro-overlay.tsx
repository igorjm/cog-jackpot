"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const INTRO_SEEN_KEY = "cog-jackpot-intro-seen";
const VIDEO_FADE_MS = 1200;
const APP_FADE_DELAY_MS = 350;
const TOTAL_TRANSITION_MS = VIDEO_FADE_MS + APP_FADE_DELAY_MS + 200;

type Phase = "checking" | "intro" | "fading" | "done";

function readIntroSeen(): boolean {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function persistIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* sessionStorage indisponível */
  }
}

export function IntroOverlay({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("checking");
  const videoRef = useRef<HTMLVideoElement>(null);
  const introPlayedRef = useRef(false);
  const initializedRef = useRef(false);

  const markSeenAndFade = useCallback(() => {
    introPlayedRef.current = true;
    persistIntroSeen();
    setPhase("fading");
    window.setTimeout(() => setPhase("done"), TOTAL_TRANSITION_MS);
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const forceReplay = params.has("replay-intro");

    if (forceReplay) {
      introPlayedRef.current = false;
      try {
        sessionStorage.removeItem(INTRO_SEEN_KEY);
      } catch {
        /* ignore */
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("replay-intro");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      setPhase("intro");
      return;
    }

    if (readIntroSeen()) {
      introPlayedRef.current = true;
      setPhase("done");
      return;
    }

    setPhase("intro");
  }, []);

  useEffect(() => {
    const keepDoneOnReturn = () => {
      if (introPlayedRef.current || readIntroSeen()) {
        introPlayedRef.current = true;
        setPhase((current) =>
          current === "fading" ? current : "done"
        );
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        keepDoneOnReturn();
      }
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        keepDoneOnReturn();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  useEffect(() => {
    if (phase !== "intro" && phase !== "checking") return;

    const blockKeys = (e: KeyboardEvent) => {
      if ([" ", "ArrowLeft", "ArrowRight", "k", "K"].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", blockKeys);
    return () => window.removeEventListener("keydown", blockKeys);
  }, [phase]);

  useEffect(() => {
    if (phase !== "intro") return;

    const video = videoRef.current;
    if (!video) return;

    const resumeIfPaused = () => {
      if (!video.paused || video.ended) return;
      void video.play().catch(() => {});
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        resumeIfPaused();
      }
    };

    const play = async () => {
      try {
        await video.play();
      } catch {
        video.muted = true;
        try {
          await video.play();
        } catch {
          markSeenAndFade();
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    if (video.readyState >= 2) {
      void play();
    } else {
      video.addEventListener("canplay", () => void play(), { once: true });
    }

    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [phase, markSeenAndFade]);

  const isFading = phase === "fading";
  const showIntro = phase === "checking" || phase === "intro" || isFading;
  const showApp = isFading || phase === "done";

  return (
    <>
      <div
        className={
          showApp
            ? "opacity-100 transition-opacity ease-out"
            : "opacity-0 pointer-events-none"
        }
        style={{
          transitionDuration: isFading ? `${VIDEO_FADE_MS}ms` : undefined,
          transitionDelay: isFading ? `${APP_FADE_DELAY_MS}ms` : undefined,
        }}
        aria-hidden={!showApp}
      >
        {children}
      </div>

      {showIntro && (
        <div
          role="presentation"
          className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#020810] ${
            isFading ? "pointer-events-none" : ""
          }`}
          onContextMenu={(e) => e.preventDefault()}
        >
          {phase !== "checking" && (
            <video
              ref={videoRef}
              src="/intro.mp4"
              className="intro-video pointer-events-none max-h-[100dvh] max-w-[100dvw] select-none transition-all ease-in-out"
              style={{
                opacity: isFading ? 0 : 1,
                transform: isFading ? "scale(1.04)" : "scale(1)",
                transitionDuration: `${VIDEO_FADE_MS}ms`,
              }}
              autoPlay
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload noplaybackrate noremoteplayback"
              onEnded={markSeenAndFade}
              onError={markSeenAndFade}
            />
          )}

          <div
            className="absolute inset-0 bg-[#020810] transition-opacity ease-in-out"
            style={{
              opacity: isFading ? 1 : 0,
              transitionDuration: `${VIDEO_FADE_MS}ms`,
              transitionDelay: isFading ? "150ms" : undefined,
            }}
          />
        </div>
      )}
    </>
  );
}
