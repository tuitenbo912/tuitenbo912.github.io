import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

// Icon trên tab trình duyệt: avatar kênh TUI TÊN BÔ cắt tròn, nền trong suốt.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  const avatar = fs.readFileSync(path.join(process.cwd(), "assets/rambo-avatar.jpg")).toString("base64");
  return new ImageResponse(
    <img
      src={`data:image/jpeg;base64,${avatar}`}
      width={64}
      height={64}
      style={{ borderRadius: "50%", objectFit: "cover" }}
    />,
    size,
  );
}
