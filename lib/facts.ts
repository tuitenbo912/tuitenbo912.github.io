import type { Video } from "./catalog";
import type { ChannelInfo, Game } from "./data";
import { TRIVIA } from "@/content/about";

/** "467 N" → 467000, "1,2 Tr" → 1200000 */
export function parseViews(s: string | null) {
  const m = s?.match(/([\d.,]+)\s*(N|Tr|Tỷ)?/);
  if (!m) return 0;
  const n = Number(m[1].replace(/\./g, "").replace(",", "."));
  return n * ({ N: 1e3, Tr: 1e6, Tỷ: 1e9 }[m[2] as "N"] ?? 1);
}

const toSeconds = (d: string | null) => (d ? d.split(":").reduce((s, p) => s * 60 + Number(p), 0) : 0);

export type Fact = { emoji: string; text: string; link?: string };

const watch = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** Số liệu tính từ kho video vừa tải, nên luôn đúng với hiện tại. */
export function liveFacts(opts: {
  channel: ChannelInfo & { created: string | null };
  videos: Video[];
  shorts: Video[];
  games: Game[];
}): Fact[] {
  const { channel, videos, shorts, games } = opts;
  const facts: Fact[] = [];

  if (channel.created) {
    const d = new Date(channel.created);
    const years = Math.floor((Date.now() - d.getTime()) / 31536e6);
    facts.push({ emoji: "🎂", text: `Kênh TUI TÊN BÔ lập ngày ${d.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}, tới nay đã ${years} năm tuổi.` });
  }
  if (channel.subscribers)
    facts.push({ emoji: "👥", text: `${channel.subscribers} người đăng ký, ${channel.videoCount ?? "hàng nghìn"} video trên kênh.` });

  const streams = videos.filter((v) => v.wasLive);
  const longest = [...streams].sort((a, b) => toSeconds(b.duration) - toSeconds(a.duration))[0];
  if (longest?.duration)
    facts.push({ emoji: "⏱️", text: `Buổi live dài nhất còn trên kênh dài ${longest.duration}: "${longest.title}".`, link: watch(longest.id) });

  const top = [...videos].sort((a, b) => parseViews(b.views) - parseViews(a.views))[0];
  if (top?.views)
    facts.push({ emoji: "🔥", text: `Video nhiều view nhất web đếm được: "${top.title}" với ${top.views} lượt xem.`, link: watch(top.id) });

  if (games.length) {
    const most = [...games].sort((a, b) => b.count - a.count)[0];
    facts.push({ emoji: "🎮", text: `Đã chơi ít nhất ${games.length} game trên kênh. Nhiều clip nhất là ${most.name} với ${most.count} clip.` });
  }

  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = videos.filter((v) => (v.time ?? 0) > weekAgo && !v.isLive).length;
  if (thisWeek) facts.push({ emoji: "📅", text: `7 ngày qua kênh lên ${thisWeek} video và buổi live.` });
  if (shorts.length) facts.push({ emoji: "⚡", text: `Có hơn ${shorts.length} Shorts cho lúc chỉ rảnh 30 giây.` });

  const liveHours = Math.round(streams.reduce((s, v) => s + toSeconds(v.duration), 0) / 3600);
  if (liveHours)
    facts.push({
      emoji: "🛋️",
      text: `${streams.length} buổi live còn trên kênh cộng lại dài ${liveHours.toLocaleString("vi-VN")} giờ, bằng ${Math.round(liveHours / 24)} ngày ngồi live không ngủ.`,
    });

  const dailies = videos.filter((v) => v.format === "daily-stream" && v.duration);
  if (dailies.length) {
    const avg = dailies.reduce((s, v) => s + toSeconds(v.duration), 0) / dailies.length;
    facts.push({
      emoji: "🌙",
      text: `Một buổi Daily Stream dài trung bình ${Math.floor(avg / 3600)} tiếng ${Math.round((avg % 3600) / 60)} phút. Web đếm được ${dailies.length} buổi.`,
    });
  }

  const totalViews = videos.reduce((s, v) => s + parseViews(v.views), 0);
  if (totalViews)
    facts.push({
      emoji: "👀",
      text: `${videos.length} video web đếm được có tổng cộng khoảng ${(totalViews / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 0 })} triệu lượt xem.`,
    });

  const viewsByGame = new Map<string, number>();
  for (const v of videos) if (v.game) viewsByGame.set(v.game, (viewsByGame.get(v.game) ?? 0) + parseViews(v.views));
  const topGame = [...viewsByGame].sort((a, b) => b[1] - a[1])[0];
  if (topGame)
    facts.push({
      emoji: "🥇",
      text: `Game kéo view nhất là ${topGame[0]}: các clip cộng lại khoảng ${(topGame[1] / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu lượt xem.`,
    });

  const mentions = (re: RegExp) => videos.filter((v) => re.test(v.title)).length;
  const anhDo = mentions(/ANH ĐỘ|ĐỘ MIXI|BỐ ĐỘ/i);
  if (anhDo) facts.push({ emoji: "🫡", text: `Anh Độ Mixi được nhắc tên trong ${anhDo} tiêu đề video.` });
  const buNgo = mentions(/BU NGÔ/i);
  if (buNgo) facts.push({ emoji: "🌽", text: `Rambo tự xưng "Bu Ngô" trong ${buNgo} tiêu đề video.` });

  // Tiêu đề kéo chữ dài nhất, kiểu "ANH EM TRÀN VÀOOOOOOOOO"
  const stretched = videos
    .map((v) => ({ v, run: Math.max(0, ...[...v.title.matchAll(/(\p{L})\1{3,}/gu)].map((m) => m[0].length)) }))
    .sort((a, b) => b.run - a.run)[0];
  if (stretched?.run)
    facts.push({
      emoji: "📢",
      text: `Tiêu đề kéo chữ dài nhất: "${stretched.v.title}", một chữ lặp liền ${stretched.run} lần.`,
      link: watch(stretched.v.id),
    });

  const oldest = [...videos].filter((v) => v.time).sort((a, b) => a.time! - b.time!)[0];
  if (oldest?.ago)
    facts.push({
      emoji: "🦕",
      text: `Video cũ nhất web tìm được: "${oldest.title}" (${oldest.ago.replace("Phát trực tiếp ", "")}).`,
      link: watch(oldest.id),
    });
  return facts;
}

/** Fact cho thẻ ngẫu nhiên ở trang chủ: chuyện vui có nguồn + số liệu trực tiếp. */
export function allFacts(live: Fact[]): Fact[] {
  return [...TRIVIA.map((t) => ({ emoji: t.emoji, text: t.text })), ...live];
}
