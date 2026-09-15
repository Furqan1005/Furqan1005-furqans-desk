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
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-[#051c12] ${
        leaving ? "intro-overlay-out" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(180,241,5,0.16),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,rgba(180,241,5,0.1),transparent_60%)]" />

      <div className="fade-in-up relative flex flex-col items-center gap-3 px-4 text-center">
        <div className="mb-1 flex items-center text-4xl font-light tracking-tight text-white">
          <span>F</span>
          <span className="bg-gradient-to-b from-white to-[#b4f105] bg-clip-text text-transparent">A</span>
        </div>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          Furqan&apos;s{" "}
          <span className="bg-gradient-to-r from-[#b4f105] to-[#c1f824] bg-clip-text text-transparent">
            Desk
          </span>
        </h1>
        <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-[#b4f105] to-[#c1f824]" />
        <p className="mt-1 text-sm tracking-wide text-white/70 sm:text-base">Think. Plan. Execute.</p>

        <button
          type="button"
          onClick={finish}
          className="mt-5 flex items-center gap-2 rounded-full border border-[#b4f105]/60 px-6 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(180,241,5,0.3)] transition-all hover:border-[#b4f105] hover:shadow-[0_0_28px_rgba(180,241,5,0.5)]"
        >
          Let&apos;s get inside
          <ArrowRight className="size-4" />
        </button>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-white/70">
              <Icon className="size-5 text-[#b4f105]" />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
