import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import Link from "next/link";
import LivePill from "@/components/LivePill";
import { getChannel } from "@/lib/data";
import "./globals.css";

const baloo = Baloo_2({ subsets: ["latin", "vietnamese"], weight: ["500", "600", "700", "800"], variable: "--font-baloo" });

// Trang dựng lúc có người vào (dữ liệu đã được cache trong lib/data.ts), không dựng lúc build:
// YouTube trục trặc lúc deploy sẽ không làm hỏng bản build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nhà Khoa Học",
  description: "Toàn bộ nội dung của Rambo (TUI TÊN BÔ), chia theo game và kiểu nội dung.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const channel = await getChannel().catch(() => null);
  return (
    <html lang="vi" className={baloo.variable}>
      <body>
        <header className="topbar">
          <div className="wrap">
            <Link href="/" className="brand">
              {channel?.avatar && <img src={channel.avatar} alt="" />}
              <span>Nhà Khoa Học</span>
            </Link>
            <nav className="nav">
              <Link href="/#game">Game</Link>
              <Link href="/#loai" className="hide-sm">
                Nội dung
              </Link>
              <Link href="/#moi">Clip mới</Link>
              <Link href="/ve-bo">Về Bô</Link>
              <LivePill />
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="footer wrap">
          Web fan làm, không phải kênh chính thức. Mọi video thuộc về{" "}
          <a href="https://www.youtube.com/@TUITENBO" target="_blank" rel="noreferrer">
            <u>TUI TÊN BÔ</u>
          </a>
          .
        </footer>
      </body>
    </html>
  );
}
