// Kiểm tra nhanh: web có đang đọc được dữ liệu mới nhất từ YouTube không.
// Chạy: npm run check:yt
import * as yt from "../lib/yt-scrape.mjs";

const t0 = Date.now();
const [info, live, videos, streams, shorts, playlists, feed] = await Promise.all([
  yt.fetchChannelInfo(),
  yt.fetchLiveStatus(),
  yt.fetchChannelTab("videos", 1),
  yt.fetchChannelTab("streams"),
  yt.fetchShorts(),
  yt.fetchPlaylists(),
  yt.fetchFeed(),
]);

console.log(`Kênh: ${info.title} · ${info.subscribers} người đăng ký · ${info.videoCount} video`);
console.log(
  live.state === "live"
    ? `🔴 ĐANG LIVE: ${live.title} (${live.viewers?.toLocaleString("vi-VN")} người xem) https://youtu.be/${live.id}`
    : live.state === "upcoming"
      ? `⏰ Sắp live: ${live.title}`
      : "💤 Không live",
);
console.log(`\nVideo mới nhất (${videos.length} video đọc được):`);
for (const v of videos.slice(0, 5)) console.log(`  ${v.ago?.padEnd(16)} ${v.title}`);
console.log(`\nLive gần nhất (${streams.length}): ${streams[0]?.title} · ${streams[0]?.ago}`);
console.log(`Shorts (${shorts.length}): ${shorts[0]?.title}`);
console.log(`Playlist (${playlists.length}): ${playlists.map((p) => p.title).join(", ")}`);
console.log(`RSS: video mới nhất đăng lúc ${feed.entries[0]?.published}`);
console.log(`\nXong trong ${((Date.now() - t0) / 1000).toFixed(1)}s`);
