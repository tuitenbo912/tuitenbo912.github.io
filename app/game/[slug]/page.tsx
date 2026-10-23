import Link from "next/link";
import { notFound } from "next/navigation";
import VideoGrid from "@/components/VideoGrid";
import { getGameVideos } from "@/lib/data";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getGameVideos((await params).slug);
  if (!data) notFound();
  const { game, videos } = data;
  return (
    <>
      <Link href="/#game" className="back">
        ← Tất cả game
      </Link>
      <div className="page-head sticker" style={{ background: game.color }}>
        <span className="game-logo big-logo">{game.logo ? <img src={game.logo} alt="" /> : "🎮"}</span>
        <div>
          <h1>{game.name}</h1>
          <div className="muted">
            {videos.length} clip{game.lastAgo ? ` · clip mới nhất ${game.lastAgo}` : ""}
          </div>
        </div>
      </div>
      <section className="section">
        <VideoGrid videos={videos} />
      </section>
    </>
  );
}
