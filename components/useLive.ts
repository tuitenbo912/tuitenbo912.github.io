"use client";

import { useEffect, useState } from "react";
import type { LiveStatus } from "@/lib/data";

// Một vòng hỏi chung cho mọi component trên trang, 60 giây một lần.
// Tab bị ẩn thì tạm ngừng hỏi; quay lại tab là hỏi ngay.
const POLL_MS = 60_000;
let current: LiveStatus | null = null;
const listeners = new Set<(s: LiveStatus) => void>();
let timer: ReturnType<typeof setInterval> | null = null;

async function poll() {
  if (document.hidden) return;
  try {
    const res = await fetch("/api/live");
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
      if (!current) poll();
      timer = setInterval(poll, POLL_MS);
      document.addEventListener("visibilitychange", poll);
    }
    return () => {
      listeners.delete(setStatus);
      if (!listeners.size && timer) {
        clearInterval(timer);
        timer = null;
        document.removeEventListener("visibilitychange", poll);
      }
    };
  }, []);
  return status;
}
