// Tải logo cho mọi game xuất hiện trên kênh vào public/logos/<slug>.(png|jpg).
// Chạy lại khi Rambo chơi game mới: npm run logos
// Game không khai báo nguồn trong lib/classify.mjs thì thử tìm trên Steam theo tên.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as yt from "../lib/yt-scrape.mjs";
import { classify, GAMES, slugify } from "../lib/classify.mjs";

const OUT = path.resolve("public/logos");
fs.mkdirSync(OUT, { recursive: true });
const force = process.argv.includes("--force");

const json = async (url) => (await fetch(url)).json();
const bytes = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
};

/** Ảnh lớn nhất trong file .ico (thường là PNG 256px nhúng sẵn). */
function largestPngInIco(buf) {
  const count = buf.readUInt16LE(4);
  let best = null;
  for (let i = 0; i < count; i++) {
    const e = 6 + 16 * i;
    const size = buf.readUInt32LE(e + 8);
    const offset = buf.readUInt32LE(e + 12);
    const w = buf[e] || 256;
    const data = buf.subarray(offset, offset + size);
    const isPng = data.subarray(1, 4).toString() === "PNG";
    if (isPng && (!best || w > best.w)) best = { w, data };
  }
  return best;
}

async function steamIcon(appid) {
  const info = await json(`https://api.steamcmd.net/v1/info/${appid}`);
  const common = info?.data?.[appid]?.common;
  const base = `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${appid}`;
  if (common?.clienticon) {
    const ico = await bytes(`${base}/${common.clienticon}.ico`);
    const png = largestPngInIco(ico);
    if (png && png.w >= 64) return { ext: "png", data: png.data, note: `steam ${appid} (${png.w}px)` };
    // Icon lớn lưu dạng BMP trong .ico: nhờ sips (macOS) chuyển sang PNG.
    try {
      const tmp = path.join(os.tmpdir(), `tuitenbo-${appid}`);
      fs.writeFileSync(`${tmp}.ico`, ico);
      execFileSync("sips", ["-s", "format", "png", `${tmp}.ico`, "--out", `${tmp}.png`], { stdio: "ignore" });
      return { ext: "png", data: fs.readFileSync(`${tmp}.png`), note: `steam ${appid} (ico → png)` };
    } catch {}
  }
  if (common?.icon) return { ext: "jpg", data: await bytes(`${base}/${common.icon}.jpg`), note: `steam ${appid} (32px)` };
  return null;
}

async function steamSearch(name) {
  const d = await json(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(name)}&cc=US&l=english`);
  const want = slugify(name);
  return d.items?.find((i) => slugify(i.name).startsWith(want) || want.startsWith(slugify(i.name)))?.id ?? null;
}

async function appStoreIcon(name) {
  const d = await json(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=software&country=vn&limit=5`);
  const app = d.results?.find((r) => r.trackName.startsWith(name)) ?? d.results?.[0];
  return app ? { ext: "jpg", data: await bytes(app.artworkUrl512), note: `app store "${app.trackName}"` } : null;
}

async function favicon(domain) {
  return { ext: "png", data: await bytes(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`), note: `favicon ${domain}` };
}

// Danh sách game thật sự có trên kênh (kể cả game mới chưa khai báo).
const [videos, streams] = await Promise.all([yt.fetchChannelTab("videos", 200), yt.fetchChannelTab("streams", 200)]);
const names = [
  ...new Set([...GAMES.map((g) => g.name), ...[...videos, ...streams].map((v) => classify(v).game).filter(Boolean)]),
];
console.log(`Tìm thấy ${names.length} game trên kênh.\n`);

for (const name of names) {
  const slug = slugify(name);
  if (!force && ["png", "jpg"].some((e) => fs.existsSync(path.join(OUT, `${slug}.${e}`)))) continue;
  const def = GAMES.find((g) => g.name === name);
  try {
    let logo = null;
    if (def?.logo?.steam) logo = await steamIcon(def.logo.steam);
    else if (def?.logo?.appstore) logo = await appStoreIcon(def.logo.appstore);
    else if (def?.logo?.favicon) logo = await favicon(def.logo.favicon);
    else if (def?.logo !== null) {
      const id = await steamSearch(name);
      if (id) logo = await steamIcon(id);
    }
    if (!logo) {
      console.log(`  –  ${name}: không có logo, dùng chữ cái đầu`);
      continue;
    }
    fs.writeFileSync(path.join(OUT, `${slug}.${logo.ext}`), logo.data);
    console.log(`  ✓  ${name} ← ${logo.note}`);
  } catch (e) {
    console.log(`  ✗  ${name}: ${e.message}`);
  }
}
