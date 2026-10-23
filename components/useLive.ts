"use client";

import { useEffect, useState } from "react";
import type { LiveStatus } from "@/lib/data";

// Một vòng hỏi chung cho mọi component trên trang, 60 giây một lần.
const POLL_MS = 60_000;
let current: LiveStatus | null = null;
const listeners = new Set<(s: LiveStatus) => void>();
let timer: ReturnType<typeof setInterval> | null = null;

async function poll() {
  try {
    const res = await fetch("/api/live", { cache: "no-store" });
    if (!res.ok) return;
    current = await res.json();
    listeners.forEach((l) => l(current!));
  } catch {
    // mất mạng thì giữ trạng thái cũ, lần sau hỏi lại
  }
}

export function useLive(initial?: LiveStatus | null) {
  const [status, setStatus] = useState<LiveStatus | null>(current ?? initial ?? null);
  useEffect(() => {
    listeners.add(setStatus);
    if (!timer) {
      if (!current && !initial) poll();
      timer = setInterval(poll, POLL_MS);
    }
    return () => {
      listeners.delete(setStatus);
      if (!listeners.size && timer) clearInterval(timer), (timer = null);
    };
  }, [initial]);
  return status;
}
