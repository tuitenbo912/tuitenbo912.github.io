"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="empty sticker" style={{ marginTop: 32 }}>
      <div style={{ fontSize: 56 }}>📡</div>
      <p>Không lấy được dữ liệu mới từ YouTube. Có thể mạng chập chờn hoặc YouTube vừa đổi giao diện.</p>
      <button className="btn" onClick={reset}>
        Thử lại
      </button>
    </div>
  );
}
