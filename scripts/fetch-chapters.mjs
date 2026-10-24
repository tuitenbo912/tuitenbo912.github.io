// Đọc mốc thời gian ("00:00 Talkshow / 1:16:50 Pubg") trong mô tả mọi video của kênh,
// lưu vào content/chapters.json để web xếp một buổi live vào nhiều game / kiểu nội dung.
// Web tự đọc mô tả video mới; chạy lại script này thỉnh thoảng cho gọn: npm run chapters
import fs from "node:fs";
import path from "node:path";
import * as yt from "../lib/yt-scrape.mjs";

const OUT = path.resolve("content/chapters.json");
const BATCH = 8;
const old = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const force = process.argv.includes("--force");

const uploads = await yt.fetchPlaylistVideos(`UU${yt.CHANNEL_ID.slice(2)}`, 60);
const todo = uploads.map((v) => v.id).filter((id) => force || !(id in old));
console.log(`${uploads.length} video, cần đọc ${todo.length}`);

const result = { ...old };
for (let i = 0; i < todo.length; i += BATCH) {
  await Promise.all(
    todo.slice(i, i + BATCH).map(async (id) => {
      try {
        result[id] = await yt.fetchChapters(id);
      } catch (e) {
        console.warn(id, String(e));
      }
    }),
  );
  if (i % 400 === 0) console.log(`${i}/${todo.length}`);
}
// Chỉ giữ video có mốc, video không có lưu mảng rỗng để lần sau khỏi đọc lại.
const sorted = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(OUT, JSON.stringify(sorted) + "\n");
console.log(`Xong: ${Object.values(sorted).filter((c) => c.length).length} video có mốc thời gian`);
