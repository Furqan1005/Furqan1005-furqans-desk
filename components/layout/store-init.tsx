"use client";

import { useEffect } from "react";

import { useIssuesStore } from "@/lib/store/issues-store";

export function StoreInit() {
  const init = useIssuesStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return null;
}
