import fs from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import * as yt from "./yt-scrape.mjs";
import { classify, slugify } from "./classify.mjs";
import { CARD_COLORS, CATEGORIES, SKIP_PLAYLISTS, type Video } from "./catalog";
import savedChapters from "@/content/chapters.json";

// Quét toàn bộ kênh (mọi video, mọi playlist, ~250 lượt tải) mỗi 6 tiếng. Video mới thì không phải chờ:
// trang chủ hỏi RSS mỗi phút, có video mới là lấy ngay trang đầu của kênh ghép vào kho.
// Lưu ý: trang Next.js tự làm mới theo hạn NGẮN NHẤT trong các dữ liệu nó dùng, nên chỉ trang chủ được
// dùng dữ liệu 1 phút. Trang game / nội dung / Về Bô (~110 trang) dùng bản làm mới mỗi giờ, nếu không
// mỗi trang sẽ bị dựng lại mỗi phút và đốt hết hạn mức CPU của Vercel.
const DEEP_TTL = 6 * 3600;
const ARCHIVE_TTL = 3600;
const FEED_TTL = 60;
const LIVE_TTL = 60;
// Giới hạn số trang cuộn: đủ lấy hết kênh hiện tại (~2.400 video) và còn dư cho sau này.
const ALL_PAGES = 200;
// Số playlist tải cùng lúc, để YouTube không chặn.
const PLAYLIST_BATCH = 6;
// Playlist tự động gom mọi video, không nói lên nội dung gì.
const IGNORED_PLAYLISTS = ["Daily Funny Moment"];
// Danh sách "mọi video tải lên" của kênh: bắt nốt video không hiện ở tab nào.
const UPLOADS_PLAYLIST = `UU${yt.CHANNEL_ID.slice(2)}`;
// Số video mới (chưa có trong content/chapters.json) được đọc mô tả mỗi lượt quét.
const NEW_CHAPTERS_LIMIT = 40;

type Chapters = [number, string][];
const SAVED = savedChapters as unknown as Record<string, Chapters>;

/** Mốc thời gian trong mô tả: video cũ lấy từ file đã lưu, video mới thì đọc từ YouTube. */
async function chaptersFor(videos: Video[]) {
  const map = new Map<string, Chapters>(Object.entries(SAVED));
  const missing = videos.filter((v) => !map.has(v.id) && !v.isLive).slice(0, NEW_CHAPTERS_LIMIT);
  await inBatches(missing, PLAYLIST_BATCH, async (v) => {
    map.set(v.id, (await yt.fetchChapters(v.id).catch(() => [])) as Chapters);
  });
  return map;
}

export type ChannelInfo = Awaited<ReturnType<typeof yt.fetchChannelInfo>>;
export type LiveStatus = Awaited<ReturnType<typeof yt.fetchLiveStatus>>;

const _getLive = unstable_cache(() => yt.fetchLiveStatus(), ["live"], { revalidate: LIVE_TTL });
export const getLive = buildSafe(_getLive, { state: "offline", checkedAt: new Date(0).toISOString() } as LiveStatus);

const _getChannel = unstable_cache(
  async () => {
    const [info, feed] = await Promise.all([yt.fetchChannelInfo(), yt.fetchFeed()]);
    return { ...info, created: feed.created };
  },
  ["channel"],
  { revalidate: ARCHIVE_TTL },
);

export const getChannel = buildSafe(_getChannel, {
  title: "TUI TÊN BÔ",
  description: "",
  avatar: null,
  banner: null,
  subscribers: null,
  videoCount: null,
  keywords: [] as string[],
  created: null as string | null,
});

export function dedupe(videos: Video[]) {
  const seen = new Set<string>();
  return videos.filter((v) => !seen.has(v.id) && !!seen.add(v.id));
}

export const byNewest = (a: Video, b: Video) => (b.time ?? 0) - (a.time ?? 0);

const withExtras = (
  videos: Video[],
  entries: { id?: string; published?: string }[],
  lists: Map<string, string[]> = new Map(),
  chapters: Map<string, Chapters> = new Map(),
) => {
  const exact = new Map(entries.map((e) => [e.id, e.published ? Date.parse(e.published) : null]));
  return videos
    .map((v) => ({ ...v, time: (!v.isLive && exact.get(v.id)) || v.time }))
    .map((v) => ({ ...v, ...classify(v, lists.get(v.id) ?? [], chapters.get(v.id) ?? []) }) as Video);
};

type Playlist = { id: string; title: string; thumb: string | null; count: number };

/** Thumbnail mặc định của YouTube, dựng lại từ id nên không cần lưu vào kho (kho nhẹ hơn ~30%). */
const defaultThumb = (v: Video) =>
  v.isShort ? `https://i.ytimg.com/vi/${v.id}/oar2.jpg` : `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
const withoutThumb = (v: Video) => ({ ...v, thumb: "" });
const withThumb = (v: Video) => (v.thumb ? v : { ...v, thumb: defaultThumb(v) });

async function inBatches<T, R>(items: T[], size: number, fn: (x: T) => Promise<R>) {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  return out;
}

/** Quét toàn bộ kênh: tab Video, Trực tiếp, Shorts và mọi playlist (kèm tên playlist chứa từng video). */
const getDeepArchive = unstable_cache(
  async () => {
    const [uploads, streams, shorts, playlists, feed, everything] = await Promise.all([
      yt.fetchChannelTab("videos", ALL_PAGES),
      yt.fetchChannelTab("streams", ALL_PAGES),
      yt.fetchShorts(ALL_PAGES),
      yt.fetchPlaylists() as Promise<Playlist[]>,
      yt.fetchFeed(),
      yt.fetchPlaylistVideos(UPLOADS_PLAYLIST, ALL_PAGES).catch(() => [] as Video[]),
    ]);
    const usable = playlists.filter((p) => !SKIP_PLAYLISTS.includes(p.title) && !IGNORED_PLAYLISTS.includes(p.title));
    const fromPlaylists = await inBatches(usable, PLAYLIST_BATCH, (p) =>
      yt.fetchPlaylistVideos(p.id, ALL_PAGES).catch(() => [] as Video[]),
    );
    const lists = new Map<string, string[]>();
    fromPlaylists.forEach((videos, i) => {
      for (const v of videos) lists.set(v.id, [...(lists.get(v.id) ?? []), usable[i].title]);
    });
    const shortIds = new Set((shorts as Video[]).map((v) => v.id));
    const all = dedupe([...uploads, ...streams, ...fromPlaylists.flat(), ...everything] as Video[]).filter(
      (v) => !shortIds.has(v.id),
    );
    return {
      videos: withExtras(all, feed.entries, lists, await chaptersFor(all)).map(withoutThumb),
      shorts: withExtras(shorts as Video[], []).map(withoutThumb),
    };
  },
  ["archive-deep-v7"],
  { revalidate: DEEP_TTL },
);

/** ID video mới nhất trong RSS: nhẹ, đổi gần như ngay khi kênh đăng video hoặc kết thúc live. */
const getFeedHead = unstable_cache(async () => (await yt.fetchFeed()).entries[0]?.id ?? "none", ["feed-head-v3"], {
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
    const videos = dedupe([...uploads, ...streams] as Video[]);
    return {
      videos: withExtras(videos, feed.entries, new Map(), await chaptersFor(videos)),
      shorts: withExtras(shorts as Video[], []),
      fetchedAt: new Date().toISOString(),
    };
  },
  ["archive-recent-v4"],
  { revalidate: ARCHIVE_TTL },
);

/**
 * Toàn bộ video của kênh, đã gắn game / định dạng / chủ đề, nên số đếm ở mọi trang khớp nhau.
 * Bản mới nhất từ trang đầu kênh được ghép lên trên bản quét sâu.
 */
export const getArchive = cache(async (fresh = false) => {
  const now = new Date().toISOString();
  // `fresh` (chỉ trang chủ): theo RSS từng phút. Còn lại: trang đầu kênh lấy lại mỗi giờ.
  const [deep, head] = await Promise.all([
    buildSafe(getDeepArchive, { videos: [], shorts: [] })(),
    fresh ? buildSafe(getFeedHead, "none")() : "hourly",
  ]);
  const recent = await buildSafe(getRecent, { videos: [], shorts: [], fetchedAt: now })(head);
  return {
    videos: dedupe([...recent.videos, ...deep.videos].map(withThumb)).sort(byNewest),
    shorts: dedupe([...recent.shorts, ...deep.shorts].map(withThumb)),
    fetchedAt: recent.fetchedAt,
  };
});

const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";

/** Lúc build, YouTube lỗi thì trả dữ liệu rỗng để bản build không hỏng; trang sẽ tự làm mới sau. */
function buildSafe<A extends unknown[], R>(fn: (...a: A) => Promise<R>, empty: R) {
  return (...a: A) => (IS_BUILD ? fn(...a).catch(() => empty) : fn(...a));
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

export const getGames = cache(async (fresh = false): Promise<Game[]> => {
  const { videos } = await getArchive(fresh);
  const groups = new Map<string, Video[]>();
  for (const v of videos) for (const g of v.games ?? []) groups.set(g, [...(groups.get(g) ?? []), v]);
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
});

export async function getGameVideos(slug: string) {
  const [{ videos }, games] = await Promise.all([getArchive(), getGames()]);
  const game = games.find((g) => g.slug === slug);
  return game ? { game, videos: videos.filter((v) => v.games?.includes(game.name)) } : null;
}

export async function getCategoryVideos(slug: string) {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return null;
  const { videos, shorts } = await getArchive();
  const list =
    cat.kind === "shorts"
      ? shorts
      : cat.kind === "format"
        ? videos.filter((v) => v.formats?.includes(slug))
        : videos.filter((v) => v.themes?.includes(slug));
  return { cat, videos: list };
}

export async function getCategoryCounts(fresh = false) {
  const { videos, shorts } = await getArchive(fresh);
  const counts: Record<string, number> = { shorts: shorts.length };
  for (const v of videos) {
    for (const f of v.formats ?? []) counts[f] = (counts[f] ?? 0) + 1;
    for (const t of v.themes ?? []) counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
}
