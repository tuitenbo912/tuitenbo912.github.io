import Link from "next/link";
import { notFound } from "next/navigation";
import VideoGrid from "@/components/VideoGrid";
import { getGameVideos, getGames } from "@/lib/data";

// Dựng sẵn trang của mọi game lúc build, làm mới ngầm mỗi 5 phút. Game mới dựng lúc có người vào.
// Khớp với hạn làm mới dữ liệu trong lib/data.ts (ARCHIVE_TTL).
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getGames()).map((g) => ({ slug: g.slug }));
}

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
