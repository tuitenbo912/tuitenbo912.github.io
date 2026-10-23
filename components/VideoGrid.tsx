"use client";

import { useMemo, useState } from "react";
import type { Video } from "@/lib/catalog";
import { parseViews } from "@/lib/facts";
import VideoCard, { videoUrl } from "./VideoCard";

const SORTS = {
  new: { label: "Mới nhất", fn: (a: Video, b: Video) => (b.time ?? 0) - (a.time ?? 0) },
  hot: { label: "Nhiều view", fn: (a: Video, b: Video) => parseViews(b.views) - parseViews(a.views) },
  old: { label: "Cũ nhất", fn: (a: Video, b: Video) => (a.time ?? 0) - (b.time ?? 0) },
};

export default function VideoGrid({ videos, shorts = false }: { videos: Video[]; shorts?: boolean }) {
  const [sort, setSort] = useState<keyof typeof SORTS>("new");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = term ? videos.filter((v) => v.title.toLowerCase().includes(term)) : videos;
    return shorts && sort === "new" ? filtered : [...filtered].sort(SORTS[sort].fn);
  }, [videos, sort, q, shorts]);

  if (!videos.length) return <div className="empty sticker">Chưa có clip nào ở đây, chắc Bô đang lười 😴</div>;

  return (
    <>
      <div className="toolbar">
        <div className="seg" role="group" aria-label="Sắp xếp">
          {Object.entries(SORTS).map(([k, s]) => (
            <button key={k} aria-pressed={sort === k} onClick={() => setSort(k as keyof typeof SORTS)}>
              {s.label}
            </button>
          ))}
        </div>
        <input
          className="chip"
          style={{ padding: "7px 14px", font: "inherit", minWidth: 0, flex: "0 1 240px" }}
          placeholder="🔍 Tìm trong đây..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="btn white"
          onClick={() => window.open(videoUrl(list[Math.floor(Math.random() * list.length)]), "_blank")}
          disabled={!list.length}
        >
          🎲 Random 1 clip
        </button>
        <span className="muted">{list.length} clip</span>
      </div>
      <div className={`grid ${shorts ? "shorts" : ""}`}>
        {list.map((v) => (
          <VideoCard key={v.id} v={v} />
        ))}
      </div>
    </>
  );
}
