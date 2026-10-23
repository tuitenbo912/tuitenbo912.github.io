import Link from "next/link";
import FactCard from "@/components/FactCard";
import GameCard from "@/components/GameCard";
import LiveBanner from "@/components/LiveBanner";
import VideoCard from "@/components/VideoCard";
import { CATEGORIES } from "@/lib/catalog";
import { getArchive, getCategoryCounts, getChannel, getGames, getLive } from "@/lib/data";
import { allFacts, liveFacts } from "@/lib/facts";

// Trang dựng sẵn, làm mới ngầm mỗi phút (video mới vào qua RSS).
export const revalidate = 60;

export default async function Home() {
  const [channel, live, archive, games, counts] = await Promise.all([
    getChannel(),
    getLive(),
    getArchive(),
    getGames(),
    getCategoryCounts(),
  ]);
  const { videos, shorts } = archive;
  const facts = allFacts(liveFacts({ channel, videos, shorts, games }));
  const lastStream = videos.find((v) => v.wasLive && !v.isLive);
  const updated = new Date(archive.fetchedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
  // Shorts đã có mục riêng ở cuối trang; Costream xếp cuối (thứ tự phân loại thì vẫn giữ trong classify.mjs).
  const formats = CATEGORIES.filter((c) => c.kind === "format" && counts[c.slug]).sort(
    (a, b) => Number(a.slug === "costream") - Number(b.slug === "costream"),
  );
  const themes = CATEGORIES.filter((c) => c.kind === "theme" && counts[c.slug]);

  return (
    <>
      <section className="hero sticker">
        {channel.banner && <img className="hero-banner" src={channel.banner} alt="" />}
        <div className="hero-body">
          {channel.avatar && <img className="hero-avatar" src={channel.avatar} alt="Avatar Rambo" />}
          <div>
            <h1>{channel.title}</h1>
            <div className="stats">
              {channel.subscribers && <span className="chip">👥 {channel.subscribers} người đăng ký</span>}
              {channel.videoCount && <span className="chip">🎬 {channel.videoCount} video</span>}
              <span className="chip">🎮 {games.length} game</span>
            </div>
          </div>
          <a className="btn red" href="https://www.youtube.com/@TUITENBO?sub_confirmation=1" target="_blank" rel="noreferrer">
            ▶ Đăng ký kênh
          </a>
        </div>
      </section>

      <LiveBanner initial={live} lastStream={lastStream} />

      <section className="section" id="game">
        <div className="section-head">
          <h2>🎮 Bô chơi game gì?</h2>
          <span className="muted">Game mới chơi xếp lên đầu</span>
        </div>
        <div className="games">
          {games.slice(0, 18).map((g) => (
            <GameCard key={g.slug} g={g} />
          ))}
        </div>
        {games.length > 18 && (
          <details className="more-games">
            <summary className="btn white">🎮 Xem thêm {games.length - 18} game nữa</summary>
            <div className="games">
              {games.slice(18).map((g) => (
                <GameCard key={g.slug} g={g} />
              ))}
            </div>
          </details>
        )}
      </section>

      <section className="section" id="loai">
        <div className="section-head">
          <h2>🍿 Hôm nay xem gì?</h2>
          <span className="muted">Clip game nằm ở kệ game phía trên</span>
        </div>
        <div className="types">
          {formats.map((t) => (
            <Link key={t.slug} href={`/loai/${t.slug}`} className="type sticker" style={{ background: t.color }}>
              <div className="big">{t.emoji}</div>
              <h3>{t.name}</h3>
              <p>{t.blurb}</p>
              <div className="type-count">{counts[t.slug]} clip</div>
            </Link>
          ))}
        </div>
        <div className="section-head" style={{ marginTop: 28 }}>
          <h2>💛 Theo chủ đề</h2>
        </div>
        <div className="types">
          {themes.map((t) => (
            <Link key={t.slug} href={`/loai/${t.slug}`} className="type sticker" style={{ background: t.color }}>
              <div className="big">{t.emoji}</div>
              <h3>{t.name}</h3>
              <p>{t.blurb}</p>
              <div className="type-count">{counts[t.slug]} clip</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <FactCard facts={facts} />
      </section>

      <section className="section" id="moi">
        <div className="section-head">
          <h2>✨ Mới ra lò</h2>
          <span className="muted">Cập nhật lúc {updated}</span>
        </div>
        <div className="grid">
          {videos.slice(0, 12).map((v) => (
            <VideoCard key={v.id} v={v} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>⚡ Shorts</h2>
          <Link className="more" href="/loai/shorts">
            Xem hết
          </Link>
        </div>
        <div className="grid shorts">
          {shorts.slice(0, 6).map((v) => (
            <VideoCard key={v.id} v={v} />
          ))}
        </div>
      </section>
    </>
  );
}
