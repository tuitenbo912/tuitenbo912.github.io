import { getLive } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getLive(), {
      headers: {
        // CDN của Vercel giữ kết quả 60 giây: đông người mở web thì function vẫn chỉ chạy
        // khoảng 1 lần mỗi phút. Trình duyệt thì luôn hỏi lại CDN để lấy bản mới nhất.
        "Vercel-CDN-Cache-Control": "max-age=60, stale-while-revalidate=60",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
