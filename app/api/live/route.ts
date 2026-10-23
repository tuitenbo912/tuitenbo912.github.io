import { getLive } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getLive());
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 502 });
  }
}
