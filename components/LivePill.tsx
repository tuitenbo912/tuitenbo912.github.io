"use client";

import { useLive } from "./useLive";

export default function LivePill() {
  const live = useLive();
  if (live?.state !== "live") return null;
  return (
    <a className="live-pill" href={`https://www.youtube.com/watch?v=${live.id}`} target="_blank" rel="noreferrer">
      <span className="dot" /> LIVE
    </a>
  );
}
