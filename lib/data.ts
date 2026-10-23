import fs from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import * as yt from "./yt-scrape.mjs";
import { classify, slugify } from "./classify.mjs";
import { CARD_COLORS, CATEGORIES, SKIP_PLAYLISTS, type Video } from "./catalog";

// Quét sâu cả kênh mỗi 30 phút (cập nhật lượt xem, playlist). Video mới thì không phải chờ:
// RSS được hỏi mỗi phút, có video mới là lấy ngay trang đầu của kênh ghép vào kho.
const ARCHIVE_TTL = 1800;
const FEED_TTL = 60;
const LIVE_TTL = 45;
// Số trang cuộn thêm ở tab Video và Trực tiếp (~30 video mỗi trang).
const ARCHIVE_PAGES = 12;

export type ChannelInfo = Awaited<ReturnType<typeof yt.fetchChannelInfo>>;
export type LiveStatus = Awaited<ReturnType<typeof yt.fetchLiveStatus>>;

export const getChannel = unstable_cache(
  async () => {
    const [info, feed] = await Promise.all([yt.fetchChannelInfo(), yt.fetchFeed()]);
    return { ...info, created: feed.created };
  },
  ["channel"],
  { revalidate: ARCHIVE_TTL },
);

export const getLive = unstable_cache(() => yt.fetchLiveStatus(), ["live"], { revalidate: LIVE_TTL });

export function dedupe(videos: Video[]) {
  const seen = new Set<string>();
  return videos.filter((v) => !seen.has(v.id) && !!seen.add(v.id));
}

export const byNewest = (a: Video, b: Video) => (b.time ?? 0) - (a.time ?? 0);

const withExtras = (videos: Video[], entries: { id?: string; published?: string }[]) => {
  const exact = new Map(entries.map((e) => [e.id, e.published ? Date.parse(e.published) : null]));
  return videos.map((v) => ({ ...v, time: (!v.isLive && exact.get(v.id)) || v.time })).map((v) => ({ ...v, ...classify(v) }));
};

/** Quét sâu: tab Video + Trực tiếp (cuộn 12 trang), mọi playlist, Shorts. Chậm (~10 giây). */
const getDeepArchive = unstable_cache(
  async () => {
    const [uploads, streams, shorts, playlists, feed] = await Promise.all([
      yt.fetchChannelTab("videos", ARCHIVE_PAGES),
      yt.fetchChannelTab("streams", ARCHIVE_PAGES),
      yt.fetchShorts(),
      yt.fetchPlaylists(),
      yt.fetchFeed(),
    ]);
    const fromPlaylists = await Promise.all(
      playlists
        .filter((p) => !SKIP_PLAYLISTS.includes(p.title))
        .map((p) => yt.fetchPlaylistVideos(p.id).catch(() => [])),
    );
    return {
      videos: withExtras(dedupe([...uploads, ...streams, ...fromPlaylists.flat()] as Video[]), feed.entries),
      shorts: withExtras(shorts as Video[], []),
    };
  },
  ["archive-deep-v1"],
  { revalidate: ARCHIVE_TTL },
);

/** ID video mới nhất trong RSS: nhẹ, đổi gần như ngay khi kênh đăng video hoặc kết thúc live. */
const getFeedHead = unstable_cache(async () => (await yt.fetchFeed()).entries[0]?.id ?? "none", ["feed-head"], {
  revalidate: FEED_TTL,
});

/** Trang đầu của kênh (~30 video mới nhất mỗi tab). Lưu theo ID đầu RSS: RSS đổi là lấy lại ngay. */
const getRecent = unstable_cache(
  async (_head: string) => {
    const [uploads, streams, shorts, feed] = await Promise.all([
      yt.fetchChannelTab("videos"),
      yt.fetchChannelTab("streams"),
      yt.fetchShorts(),
      yt.fetchFeed(),
    ]);
    return {
      videos: withExtras(dedupe([...uploads, ...streams] as Video[]), feed.entries),
      shorts: withExtras(shorts as Video[], []),
      fetchedAt: new Date().toISOString(),
    };
  },
  ["archive-recent-v1"],
  { revalidate: ARCHIVE_TTL },
);

/**
 * Toàn bộ video của kênh, đã gắn game / định dạng / chủ đề, nên số đếm ở mọi trang khớp nhau.
 * Bản mới nhất từ trang đầu kênh được ghép lên trên bản quét sâu.
 */
export async function getArchive() {
  const [deep, recent] = await Promise.all([getDeepArchive(), getFeedHead().then(getRecent)]);
  return {
    videos: dedupe([...recent.videos, ...deep.videos]).sort(byNewest),
    shorts: dedupe([...recent.shorts, ...deep.shorts]),
    fetchedAt: recent.fetchedAt,
  };
}

export function gameLogo(slug: string) {
  for (const ext of ["png", "jpg", "svg", "webp"]) {
    if (fs.existsSync(path.join(process.cwd(), "public/logos", `${slug}.${ext}`))) return `/logos/${slug}.${ext}`;
  }
  return null;
}

export type Game = {
  slug: string;
  name: string;
  count: number;
  lastPlayed: number | null;
  lastAgo: string | null;
  cover: string;
  logo: string | null;
  color: string;
  hot: boolean;
};

export async function getGames(): Promise<Game[]> {
  const { videos } = await getArchive();
  const groups = new Map<string, Video[]>();
  for (const v of videos) if (v.game) groups.set(v.game, [...(groups.get(v.game) ?? []), v]);
  const monthAgo = Date.now() - 30 * 864e5;
  return [...groups.entries()]
    .map(([name, list]) => ({ name, list, slug: slugify(name) }))
    .sort((a, b) => (b.list[0].time ?? 0) - (a.list[0].time ?? 0))
    .map(({ name, list, slug }, i) => ({
      slug,
      name,
      count: list.length,
      lastPlayed: list[0].time,
      lastAgo: list[0].ago?.replace("Phát trực tiếp ", "") ?? null,
      cover: list[0].thumb,
      logo: gameLogo(slug),
      color: CARD_COLORS[i % CARD_COLORS.length],
      hot: (list[0].time ?? 0) > monthAgo,
    }));
}

export async function getGameVideos(slug: string) {
  const [{ videos }, games] = await Promise.all([getArchive(), getGames()]);
  const game = games.find((g) => g.slug === slug);
  return game ? { game, videos: videos.filter((v) => v.game === game.name) } : null;
}

export async function getCategoryVideos(slug: string) {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return null;
  const { videos, shorts } = await getArchive();
  const list =
    cat.kind === "shorts"
      ? shorts
      : cat.kind === "format"
        ? videos.filter((v) => v.format === slug)
        : videos.filter((v) => v.themes?.includes(slug));
  return { cat, videos: list };
}

export async function getCategoryCounts() {
  const { videos, shorts } = await getArchive();
  const counts: Record<string, number> = { shorts: shorts.length };
  for (const v of videos) {
    if (v.format) counts[v.format] = (counts[v.format] ?? 0) + 1;
    for (const t of v.themes ?? []) counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}
