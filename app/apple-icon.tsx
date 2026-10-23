import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

// Icon khi lưu web ra màn hình chính iPhone: avatar kênh TUI TÊN BÔ cắt tròn, nền trong suốt.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const avatar = fs.readFileSync(path.join(process.cwd(), "assets/rambo-avatar.jpg")).toString("base64");
  return new ImageResponse(
    <img
      src={`data:image/jpeg;base64,${avatar}`}
      width={180}
      height={180}
      style={{ borderRadius: "50%", objectFit: "cover" }}
    />,
    size,
  );
}
