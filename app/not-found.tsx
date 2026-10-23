import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty sticker" style={{ marginTop: 32 }}>
      <div style={{ fontSize: 56 }}>🤷</div>
      <p>Không có trang này.</p>
      <Link className="btn" href="/">
        Về trang chủ
      </Link>
    </div>
  );
}
