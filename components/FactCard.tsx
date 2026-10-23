"use client";

import { useState } from "react";
import type { Fact } from "@/lib/facts";

export default function FactCard({ facts }: { facts: Fact[] }) {
  const [i, setI] = useState(0);
  if (!facts.length) return null;
  const f = facts[i % facts.length];
  return (
    <div className="fact sticker">
      <div className="big">{f.emoji}</div>
      <p>
        {f.text}{" "}
        {f.link && (
          <a href={f.link} target="_blank" rel="noreferrer">
            <u>Xem ↗</u>
          </a>
        )}
      </p>
      <button className="btn" onClick={() => setI((n) => n + 1 + Math.floor(Math.random() * (facts.length - 1)))}>
        🎲 Fact khác
      </button>
    </div>
  );
}
