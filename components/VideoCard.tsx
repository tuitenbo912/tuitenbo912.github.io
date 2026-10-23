import type { Video } from "@/lib/catalog";

export function videoUrl(v: Video) {
  return v.isShort ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`;
}

export default function VideoCard({ v }: { v: Video }) {
  const views = v.views ? (/xem/.test(v.views) ? v.views : `${v.views} lượt xem`) : null;
  return (
    <a className="card" href={videoUrl(v)} target="_blank" rel="noreferrer" title={v.title}>
      <div className="card-thumb">
        <img src={v.thumb} alt="" loading="lazy" />
        {v.isLive ? (
          <span className="badge live">
            <span className="dot" /> TRỰC TIẾP
          </span>
        ) : (
          v.duration && <span className="badge">{v.duration}</span>
        )}
        <span className="yt-arrow">Mở YouTube ↗</span>
      </div>
      <div className="card-title">{v.title}</div>
      <div className="card-meta">{[views, v.isLive ? null : v.ago].filter(Boolean).join(" · ")}</div>
    </a>
  );
}
