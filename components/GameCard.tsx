import Link from "next/link";
import type { Game } from "@/lib/data";

const initials = (name: string) =>
  name
    .split(/[\s:]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function GameCard({ g }: { g: Game }) {
  return (
    <Link href={`/game/${g.slug}`} prefetch={false} className="game sticker" style={{ background: g.color }}>
      <div className="game-cover" style={{ backgroundImage: `url(${g.cover})` }}>
        <span className="game-logo">{g.logo ? <img src={g.logo} alt={`Logo ${g.name}`} loading="lazy" decoding="async" /> : initials(g.name)}</span>
        {g.hot && <span className="hot">Mới chơi</span>}
      </div>
      <div className="game-name">{g.name}</div>
      <div className="game-meta">
        {g.count} clip{g.lastAgo ? ` · ${g.lastAgo}` : ""}
      </div>
    </Link>
  );
}
