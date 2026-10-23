"use client";

import type { LiveStatus } from "@/lib/data";
import type { Video } from "@/lib/catalog";
import { useLive } from "./useLive";

const watch = (id: string) => `https://www.youtube.com/watch?v=${id}`;

function since(iso: string | null | undefined) {
  if (!iso) return null;
  const mins = Math.round((Date.now() - Date.parse(iso)) / 6e4);
  return mins < 60 ? `${mins} phút` : `${Math.floor(mins / 60)} giờ ${mins % 60} phút`;
}

export default function LiveBanner({ initial, lastStream }: { initial: LiveStatus; lastStream?: Video }) {
  const live = useLive(initial) ?? initial;

  if (live.state === "live" || live.state === "upcoming") {
    const on = live.state === "live";
    return (
      <a className={`live sticker ${on ? "on" : ""}`} href={watch(live.id!)} target="_blank" rel="noreferrer">
        <div className="live-thumb">
          <img src={live.thumb} alt="" />
          <span className="live-pill">{on ? <><span className="dot" /> ĐANG LIVE</> : "⏰ SẮP LIVE"}</span>
        </div>
        <div className="live-info">
          <div className="muted">{on ? "Rambo đang phát trực tiếp trên YouTube" : "Rambo đã lên lịch live"}</div>
          <h2>{live.title}</h2>
          <div className="stats">
            {live.viewers != null && <span className="chip">👀 {live.viewers.toLocaleString("vi-VN")} người đang xem</span>}
            {on && since(live.startedAt) && <span className="chip">⏱️ Đã live {since(live.startedAt)}</span>}
          </div>
          <span>
            <span className="btn red">▶ {on ? "Vào xem ngay" : "Đặt lời nhắc"}</span>
          </span>
        </div>
      </a>
    );
  }

  if (!lastStream)
    return (
      <div className="live sticker off">
        <div className="sleep">💤</div>
        <div className="live-info">
          <h2>Rambo đang không stream</h2>
          <div className="muted">Lên live là chỗ này đỏ rực ngay.</div>
        </div>
      </div>
    );

  return (
    <a className="live sticker" href={watch(lastStream.id)} target="_blank" rel="noreferrer">
      <div className="live-thumb">
        <img src={lastStream.thumb} alt="" />
        <span className="live-pill off-pill">💤 OFFLINE</span>
        {lastStream.duration && <span className="badge">{lastStream.duration}</span>}
      </div>
      <div className="live-info">
        <h2>Rambo đang không stream</h2>
        <div className="muted">Xem buổi Livestream gần nhất:</div>
        <h3 className="last-title">{lastStream.title}</h3>
        <div className="stats">
          {lastStream.ago && <span className="chip">🕒 {lastStream.ago.replace("Phát trực tiếp ", "")}</span>}
          {lastStream.views && <span className="chip">👀 {lastStream.views} lượt xem</span>}
        </div>
        <span>
          <span className="btn">▶ Xem lại</span>
        </span>
      </div>
    </a>
  );
}
