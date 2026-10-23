# Nhà Khoa Học — web fan của Rambo (TUI TÊN BÔ)

Toàn bộ nội dung kênh YouTube của Rambo, chia theo **game**, **định dạng** và **chủ đề**. Bấm vào thẻ video là mở YouTube.

```bash
npm install
npm run dev        # http://localhost:3010
npm run check:yt   # kiểm tra nhanh: có đọc được video mới nhất và tình trạng live không
npm run logos      # tải logo cho game mới (cần macOS vì dùng sips)
```

## Dữ liệu lấy từ đâu

Không cần API key. Server đọc HTML công khai của kênh (`ytInitialData`) cùng RSS (`lib/yt-scrape.mjs`):

| Dữ liệu | Nguồn | Làm mới |
| --- | --- | --- |
| Kho video (~900 clip) | Tab Video + Trực tiếp (cuộn 12 trang), mọi playlist, Shorts | 10 phút |
| Đang live? | Trang `/channel/<id>/live` | 45 giây; trình duyệt hỏi lại mỗi phút |
| Về Bô | `content/about.ts` (có nguồn) + số liệu tính từ kho video | theo dữ liệu |

## Phân loại (`lib/classify.mjs`)

Kênh hay gắn nhãn đầu tiêu đề: `(Valorant) …`, `(DailyStream) …`, `(IRL STREAM) …`. Mỗi video được gắn:

- **Game:** theo danh sách `GAMES` (gộp tên gõ sai, bắt cả video không có nhãn). Nhãn lạ chưa khai báo sẽ tự thành game mới.
- **Định dạng:** mỗi video một loại, lấy loại đầu tiên khớp trong `FORMATS`.
- **Chủ đề:** có thể trùng nhau (Gia đình Bô, Cùng anh Độ & Refund).

Logo game ở `public/logos/<slug>.png|jpg`. Game không có logo sẽ hiện chữ cái đầu.
