import { PROFILE, TIMELINE, TRIVIA } from "@/content/about";
import { getArchive, getChannel, getGames } from "@/lib/data";
import { liveFacts } from "@/lib/facts";

export const revalidate = 600;

export default async function AboutPage() {
  const [channel, { videos, shorts }, games] = await Promise.all([getChannel(), getArchive(), getGames()]);
  const stats = liveFacts({ channel, videos, shorts, games });

  return (
    <>
      <div className="page-head sticker" style={{ background: "#e6f7ff" }}>
        {channel.avatar && <img className="hero-avatar" style={{ marginTop: 0 }} src={channel.avatar} alt="" />}
        <div>
          <h1>Về Bô</h1>
          <div className="muted">Rambo là ai, từ đâu ra, làm sao gặp anh Độ. Toàn thông tin có thật.</div>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>🪪 Hồ sơ</h2>
        </div>
        <div className="profile" style={{ "--cols": PROFILE.length } as React.CSSProperties}>
          {PROFILE.map((p) => (
            <div key={p.label} className="sticker profile-item">
              <div className="muted">{p.label}</div>
              <div className="profile-value">{p.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>🛣️ Hành trình</h2>
        </div>
        <ol className="timeline">
          {TIMELINE.map((t) => (
            <li key={t.title} className="sticker">
              <div className="when">{t.when}</div>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>🤭 Chuyện vui</h2>
        </div>
        <div className="facts-list">
          {TRIVIA.map((f) => (
            <div key={f.text} className="sticker">
              <div className="big">{f.emoji}</div>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>📊 Số liệu kênh</h2>
          <span className="muted">Tính trực tiếp từ YouTube</span>
        </div>
        <div className="facts-list">
          {stats.map((f) => (
            <div key={f.text} className="sticker">
              <div className="big">{f.emoji}</div>
              <p>
                {f.text}{" "}
                {f.link && (
                  <a href={f.link} target="_blank" rel="noreferrer">
                    <u>Xem ↗</u>
                  </a>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
