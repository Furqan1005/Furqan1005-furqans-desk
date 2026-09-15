"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ListChecks, Users, BarChart3, BookOpen, Zap } from "lucide-react";

const SESSION_KEY = "furqans-desk-intro-shown";

const FEATURES = [
  { icon: ListChecks, label: "Tasks & Projects" },
  { icon: Users, label: "Teams & Updates" },
  { icon: BarChart3, label: "Data & Insights" },
  { icon: BookOpen, label: "Knowledge Bank" },
  { icon: Zap, label: "Automation" },
];

export function IntroOverlay() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

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
    setVisible(true);
  }, []);

  function finish() {
    setLeaving(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore
    }
    setTimeout(() => setVisible(false), 400);
  }

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-[#0a1220] ${
        leaving ? "intro-overlay-out" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#4a3418]/50 via-[#4a3418]/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(56,120,200,0.25),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,rgba(20,40,70,0.6),transparent_60%)]" />

      <div className="fade-in-up relative flex flex-col items-center gap-3 px-4 text-center">
        <div className="mb-1 flex items-center text-4xl font-light tracking-tight text-white">
          <span>F</span>
          <span className="bg-gradient-to-b from-white to-[#7fb4e8] bg-clip-text text-transparent">A</span>
        </div>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          Furqan&apos;s{" "}
          <span className="bg-gradient-to-r from-[#5aa4e8] to-[#7fd0f0] bg-clip-text text-transparent">
            Desk
          </span>
        </h1>
        <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-[#5aa4e8] to-[#7fd0f0]" />
        <p className="mt-1 text-sm tracking-wide text-white/70 sm:text-base">Think. Plan. Execute.</p>

        <button
          type="button"
          onClick={finish}
          className="mt-5 flex items-center gap-2 rounded-full border border-[#5aa4e8]/60 px-6 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(90,164,232,0.35)] transition-all hover:border-[#5aa4e8] hover:shadow-[0_0_28px_rgba(90,164,232,0.55)]"
        >
          Let&apos;s get inside
          <ArrowRight className="size-4" />
        </button>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-white/70">
              <Icon className="size-5 text-[#7fb4e8]" />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
