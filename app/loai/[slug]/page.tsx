import Link from "next/link";
import { notFound } from "next/navigation";
import VideoGrid from "@/components/VideoGrid";
import { getCategoryVideos } from "@/lib/data";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getCategoryVideos((await params).slug);
  if (!data) notFound();
  const { cat, videos } = data;
  return (
    <>
      <Link href="/#loai" className="back">
        ← Các kiểu nội dung
      </Link>
      <div className="page-head sticker" style={{ background: cat.color }}>
        <div className="big">{cat.emoji}</div>
        <div>
          <h1>{cat.name}</h1>
          <div className="muted">{cat.blurb}</div>
        </div>
      </div>
      <section className="section">
        <VideoGrid videos={videos} shorts={cat.kind === "shorts"} />
      </section>
    </>
  );
}
