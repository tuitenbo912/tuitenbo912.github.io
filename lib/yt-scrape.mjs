// Đọc dữ liệu công khai của kênh YouTube trực tiếp từ HTML gốc (ytInitialData),
// không cần API key. File này không phụ thuộc Next.js để script kiểm tra dùng lại được.

export const CHANNEL_ID = "UCWaqRVpfdjpR_nRRWe6vbog";
export const CHANNEL_URL = "https://www.youtube.com/@TUITENBO";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
// Ép giao diện tiếng Việt, khu vực VN: server ở nước ngoài (Vercel) cũng nhận đúng chữ "trước", "lượt xem".
const HEADERS = { "User-Agent": UA, "Accept-Language": "vi-VN,vi;q=0.9", Cookie: "PREF=hl=vi&gl=VN; CONSENT=YES+" };

async function getText(url) {
  const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`YouTube trả về ${res.status} cho ${url}`);
  return res.text();
}

function extractJson(html, varName) {
  const start = html.indexOf(`var ${varName} = `);
  if (start < 0) return null;
  const from = html.indexOf("{", start);
  // Đếm ngoặc để cắt đúng object JSON, bỏ qua ngoặc nằm trong chuỗi.
  let depth = 0;
  let inStr = false;
  for (let i = from; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (c === "\\") i++;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return JSON.parse(html.slice(from, i + 1));
  }
  return null;
}

function walk(node, key, out = []) {
  if (Array.isArray(node)) for (const v of node) walk(v, key, out);
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === key) out.push(v);
      walk(v, key, out);
    }
  }
  return out;
}

const clean = (s) => (s ?? "").normalize("NFC").replace(/\u00a0/g, " ").trim();

// "3 ngày trước", "Phát trực tiếp 1 năm trước" → mốc thời gian gần đúng (ms)
const UNIT_MS = {
  giây: 1e3,
  phút: 6e4,
  giờ: 36e5,
  ngày: 864e5,
  tuần: 6048e5,
  tháng: 2592e6,
  năm: 31536e6,
};
export function agoToTimestamp(ago, now = Date.now()) {
  const m = clean(ago).match(/(\d+)\s*(giây|phút|giờ|ngày|tuần|tháng|năm)/);
  return m ? now - Number(m[1]) * UNIT_MS[m[2]] : null;
}

function bestThumb(sources, id) {
  const list = (sources ?? []).filter((s) => s.url);
  if (!list.length) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return list.reduce((a, b) => ((b.width ?? 0) > (a.width ?? 0) ? b : a)).url;
}

function parseLockup(l, now) {
  if (l.contentType !== "LOCKUP_CONTENT_TYPE_VIDEO" || !l.contentId) return null;
  const meta = l.metadata?.lockupMetadataViewModel;
  const parts = walk(meta?.metadata, "metadataParts")
    .flat()
    .map((p) => clean(p.text?.content))
    .filter(Boolean);
  const ago = parts.find((p) => /trước/.test(p)) ?? null;
  const views =
    parts.find((p) => /^[\d.,]+\s*(N|Tr|Tỷ)?$/.test(p) || /lượt xem|đang xem/.test(p))?.replace(/\s*lượt xem$/, "") ?? null;
  const badges = walk(l.contentImage, "thumbnailBadgeViewModel");
  const live = badges.some((b) => /LIVE/.test(b.badgeStyle ?? ""));
  const duration = badges.map((b) => clean(b.text)).find((t) => /^\d+(:\d+)+$/.test(t)) ?? null;
  return {
    id: l.contentId,
    title: clean(meta?.title?.content),
    thumb: bestThumb(walk(l.contentImage, "sources")[0], l.contentId),
    duration,
    views,
    ago: live ? "Đang phát trực tiếp" : ago,
    time: live ? now : agoToTimestamp(ago, now),
    isLive: live,
    wasLive: /Phát trực tiếp/.test(ago ?? ""),
    // Kênh đăng video: chỉ có trong playlist (tab của kênh không ghi), dùng để bỏ video kênh khác.
    owner: walk(meta, "browseEndpoint").find((b) => b.browseId?.startsWith("UC"))?.browseId ?? null,
  };
}

function parseShort(s) {
  const id = s.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId ?? s.entityId?.split("-").pop();
  if (!id) return null;
  const title = clean(s.overlayMetadata?.primaryText?.content) || clean(s.accessibilityText).split(",")[0];
  return {
    id,
    title,
    thumb: walk(s.thumbnail, "sources")[0]?.[0]?.url ?? `https://i.ytimg.com/vi/${id}/oar2.jpg`,
    duration: null,
    views: clean(s.overlayMetadata?.secondaryText?.content) || null,
    ago: null,
    time: null,
    isLive: false,
    wasLive: false,
    isShort: true,
  };
}

function videosFrom(data, now) {
  const seen = new Set();
  const out = [];
  for (const v of walk(data, "lockupViewModel").map((l) => parseLockup(l, now))) {
    if (v && !seen.has(v.id)) seen.add(v.id), out.push(v);
  }
  return out;
}

function continuationToken(data) {
  // Chỉ tìm trong nội dung chính (bỏ qua các panel phụ). Tab kênh dùng continuationItemRenderer,
  // trang playlist dùng continuationItemViewModel.
  const root = data.onResponseReceivedActions ?? data.onResponseReceivedEndpoints ?? data.contents;
  for (const key of ["continuationItemRenderer", "continuationItemViewModel"]) {
    for (const item of walk(root, key)) {
      const token = walk(item, "continuationCommand").find((c) => c.token)?.token;
      if (token) return token;
    }
  }
  return null;
}

async function browseContinuation(token, clientVersion) {
  const res = await fetch("https://www.youtube.com/youtubei/v1/browse?prettyPrint=false", {
    method: "POST",
    cache: "no-store",
    headers: { ...HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify({
      context: { client: { clientName: "WEB", clientVersion, hl: "vi", gl: "VN" } },
      continuation: token,
    }),
  });
  if (!res.ok) throw new Error(`YouTube browse trả về ${res.status}`);
  return res.json();
}

/**
 * Tải một trang YouTube rồi cuộn tiếp tối đa `pages` lần, gom kết quả của `parse` (bỏ trùng theo id).
 * YouTube thỉnh thoảng trả lỗi giữa chừng: giữ phần đã lấy được thay vì hỏng cả lượt.
 */
async function browseAll(url, pages, parse) {
  const html = await getText(url);
  const data = extractJson(html, "ytInitialData");
  if (!data) throw new Error(`Không đọc được ${url}`);
  const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20251020.00.00";
  const items = parse(data);
  const ids = new Set(items.map((x) => x.id));
  let token = continuationToken(data);
  for (let i = 0; i < pages && token; i++) {
    const more = await browseContinuation(token, clientVersion).catch(() => null);
    if (!more) break;
    for (const x of parse(more)) if (!ids.has(x.id)) ids.add(x.id), items.push(x);
    token = continuationToken(more);
  }
  return items;
}

/** Video của một tab kênh (videos | streams), cuộn thêm tối đa `pages` trang (~30 video mỗi trang). */
export function fetchChannelTab(tab, pages = 0) {
  const now = Date.now();
  return browseAll(`${CHANNEL_URL}/${tab}`, pages, (d) => videosFrom(d, now));
}

/** Shorts của kênh, cuộn thêm tối đa `pages` trang. */
export function fetchShorts(pages = 0) {
  return browseAll(`${CHANNEL_URL}/shorts`, pages, (d) => walk(d, "shortsLockupViewModel").map(parseShort).filter(Boolean));
}

export async function fetchChannelInfo() {
  const data = extractJson(await getText(CHANNEL_URL), "ytInitialData");
  if (!data) throw new Error("Không đọc được trang kênh");
  const md = data.metadata?.channelMetadataRenderer ?? {};
  const texts = walk(data.header, "content").filter((t) => typeof t === "string").map(clean);
  const keywords = (md.keywords ?? "").match(/"[^"]+"|\S+/g)?.map((k) => k.replace(/"/g, "")) ?? [];
  const banner = walk(data.header, "imageBannerViewModel")[0]?.image?.sources?.at(-1)?.url ?? null;
  return {
    title: md.title,
    description: md.description ?? "",
    avatar: md.avatar?.thumbnails?.[0]?.url ?? null,
    banner,
    subscribers: texts.find((t) => /người đăng ký/.test(t))?.replace(" người đăng ký", "") ?? null,
    videoCount: texts.find((t) => /\bvideo$/.test(t))?.replace(" video", "") ?? null,
    keywords,
  };
}

/** Mọi playlist công khai của kênh: [{ id, title, thumb, count }] */
export function fetchPlaylists(pages = 20) {
  return browseAll(`${CHANNEL_URL}/playlists`, pages, (d) =>
    walk(d, "lockupViewModel")
      .filter((l) => l.contentType === "LOCKUP_CONTENT_TYPE_PLAYLIST")
      .map((l) => ({
        id: l.contentId,
        title: clean(l.metadata?.lockupMetadataViewModel?.title?.content),
        thumb: walk(l.contentImage, "sources")[0]?.[0]?.url ?? null,
        count: Number(clean(walk(l.contentImage, "thumbnailBadgeViewModel")[0]?.text).match(/\d+/)?.[0] ?? 0),
      })),
  );
}

/** Toàn bộ video trong một playlist (mỗi trang ~100 video). */
export function fetchPlaylistVideos(playlistId, pages = 20) {
  const now = Date.now();
  return browseAll(`https://www.youtube.com/playlist?list=${playlistId}`, pages, (d) =>
    videosFrom(d, now).filter((v) => !v.owner || v.owner === CHANNEL_ID),
  );
}

/** Ngày kênh được tạo + giờ đăng chính xác của ~15 video mới nhất, từ RSS. */
export async function fetchFeed() {
  const xml = await getText(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
  const created = xml.match(/<published>([^<]+)<\/published>/)?.[1] ?? null;
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    id: e.match(/<yt:videoId>([^<]+)/)?.[1],
    published: e.match(/<published>([^<]+)/)?.[1],
  }));
  return { created, entries };
}

/** "7,4 N người đang xem" → 7400 */
function approxCount(text) {
  const m = text?.match(/([\d.,]+)\s*(N|Tr)?/);
  if (!m) return null;
  return Math.round(Number(m[1].replace(/\./g, "").replace(",", ".")) * ({ N: 1e3, Tr: 1e6 }[m[2]] ?? 1));
}

/** Đọc trang /live của kênh: trang này trỏ tới buổi live hiện tại (hoặc buổi đã lên lịch) nếu có. */
async function liveFromPage(checkedAt) {
  const html = await getText(`https://www.youtube.com/channel/${CHANNEL_ID}/live`);
  const player = extractJson(html, "ytInitialPlayerResponse");
  const details = player?.videoDetails;
  const broadcast = player?.microformat?.playerMicroformatRenderer?.liveBroadcastDetails;
  if (!details?.isLiveContent) return { state: "offline", checkedAt };

  const isLive = details.isLive === true || broadcast?.isLiveNow === true;
  const isUpcoming = details.isUpcoming === true && !isLive;
  if (!isLive && !isUpcoming) return { state: "offline", checkedAt };

  const data = extractJson(html, "ytInitialData");
  const viewers = walk(data, "videoViewCountRenderer")[0]?.originalViewCount ?? null;
  return {
    state: isLive ? "live" : "upcoming",
    checkedAt,
    id: details.videoId,
    title: details.title,
    thumb: `https://i.ytimg.com/vi/${details.videoId}/hqdefault${isLive ? "_live" : ""}.jpg`,
    viewers: viewers ? Number(viewers) : null,
    startedAt: broadcast?.startTimestamp ?? null,
  };
}

/**
 * Tình trạng live. Trang /live đôi khi trả về khác khi gọi từ máy chủ nước ngoài,
 * nên nếu nó báo offline thì xem thêm tab Trực tiếp: buổi đang phát có nhãn LIVE ở đó.
 */
export async function fetchLiveStatus() {
  const checkedAt = new Date().toISOString();
  const page = await liveFromPage(checkedAt).catch(() => null);
  if (page && page.state !== "offline") return page;

  const streams = await fetchChannelTab("streams").catch(() => null);
  if (!page && !streams) throw new Error("Không đọc được tình trạng live");
  const now = streams?.find((v) => v.isLive);
  if (!now) return { state: "offline", checkedAt };
  return {
    state: "live",
    checkedAt,
    id: now.id,
    title: now.title,
    thumb: `https://i.ytimg.com/vi/${now.id}/hqdefault_live.jpg`,
    viewers: approxCount(now.views),
    startedAt: null,
  };
}
