"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "furqans-desk-intro-shown";

export function IntroOverlay() {
  const [phase, setPhase] = useState<"hidden" | "badge" | "wordmark" | "out">("hidden");

  useEffect(() => {
    let shown = true;
    try {
      shown = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage unavailable (private mode) - just skip the intro.
    }

    if (shown) return;

    // One-time sync from a browser-only API (sessionStorage) into React state -
    // there is no render-time alternative since this must not run during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase("badge");
    const t1 = setTimeout(() => setPhase("wordmark"), 650);
    const t2 = setTimeout(() => finish(), 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  function finish() {
    setPhase("out");
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore
    }
    setTimeout(() => setPhase("hidden"), 400);
  }

  if (phase === "hidden") return null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Skip intro"
      onClick={finish}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && finish()}
      className={`fixed inset-0 z-100 flex cursor-pointer items-center justify-center bg-[#181a2b] ${
        phase === "out" ? "intro-overlay-out" : ""
      }`}
    >
      {phase === "badge" && (
        <div className="intro-badge flex size-20 items-center justify-center rounded-2xl bg-white text-2xl font-semibold text-[#181a2b]">
          FA
        </div>
      )}
      {(phase === "wordmark" || phase === "out") && (
        <div className="intro-wordmark flex flex-col items-center gap-2">
          <div className="flex size-14 items-center justify-center rounded-xl bg-white text-xl font-semibold text-[#181a2b]">
            FA
          </div>
          <h1 className="text-2xl font-semibold text-white">Furqan&apos;s Desk</h1>
          <p className="text-sm text-white/60">Nothing falls through the cracks.</p>
        </div>
      )}
    </div>
  );
}
