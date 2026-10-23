// Thông tin về Rambo đã đối chiếu với báo và hồ sơ thi đấu. Mỗi mục ghi nguồn.
// Sửa hoặc thêm ở đây; chỗ nào các nguồn nói khác nhau thì ghi rõ.

export type Source = { label: string; url: string };

const SRC = {
  esports: { label: "Esports Earnings", url: "https://www.esportsearnings.com/players/56656-rambo-lam-inh-khoa" },
  kenh14: {
    label: "Kenh14",
    url: "https://kenh14.vn/da-stream-co-duyen-dac-biet-khien-rambo-gap-duoc-do-mixi-roi-tro-thanh-cai-ten-cuc-hot-cua-lang-streamer-viet-20211231004311647.chn",
  },
  ttvh: {
    label: "Thể thao & Văn hoá",
    url: "https://thethaovanhoa.vn/buoc-ngoat-cuoc-doi-cua-rambo-cao-lanh-tu-qua-khu-bao-thu-doi-doi-thanh-hot-streamer-trieu-view-nho-do-mixi-diu-dat-20230209184346605.htm",
  },
  vnn: { label: "VietNamNet", url: "https://vietnamnet.vn/pubg-meou-roi-di-do-mixi-quay-tro-lai-doi-hinh-cua-refund-ig32403.html" },
  tiktok: { label: "TikTok TUI TÊN BÔ", url: "https://www.tiktok.com/@tuitenbo.official/video/7653635558794693908" },
  channel: { label: "Kênh YouTube", url: "https://www.youtube.com/@TUITENBO" },
  vgtBaby: {
    label: "Việt Giải Trí",
    url: "https://vietgiaitri.com/hot-rambo-thong-bao-sap-len-chuc-bo-tiet-lo-luon-ten-dat-cho-con-trai-20210925i6052626/",
  },
  vgtLove: {
    label: "Việt Giải Trí",
    url: "https://vietgiaitri.com/ho-so-tinh-ai-rambo-cao-lanh-duyen-no-voi-nhung-moi-tinh-chi-oi-anh-yeu-em-va-cai-ket-hoan-hao-voi-hot-girl-banh-trang-tron-20211018i6100807/",
  },
  wedding: {
    label: "VGT",
    url: "https://vgt.vn/rambo-hoa-rapper-quay-tung-le-cuoi-cdm-lac-mat-dan-khach-moi-trieu-views-ihyes-20241223t7344192/",
  },
} satisfies Record<string, Source>;

export const PROFILE: { label: string; value: string; note?: string; sources: Source[] }[] = [
  {
    label: "Tên thật",
    value: "Khoa",
    note: 'Họ thì có hai bản. Hồ sơ thi đấu và Instagram (lamdinhkhoa96) ghi Lâm Đình Khoa. Còn Facebook là khoa.phuoc, và con trai đầu tên Đinh Văn Thanh Phước Thiện, khớp với "Đinh Văn Thanh Phước Khoa".',
    sources: [SRC.esports, SRC.channel, SRC.vgtBaby],
  },
  { label: "Năm sinh", value: "1996", sources: [SRC.kenh14] },
  { label: "Quê", value: "Cao Lãnh, Đồng Tháp", note: 'Báo gọi là "chàng trai Cao Lãnh".', sources: [SRC.kenh14, SRC.ttvh] },
  { label: "Nghề", value: "Streamer, YouTuber, cựu tuyển thủ PUBG", sources: [SRC.kenh14] },
  {
    label: "Biệt danh",
    value: "Bô, Bu Ngô, Bô Béo, Châu Tinh Bô",
    note: "Bu Ngô và Bô Béo là tên Rambo tự xưng trong tiêu đề video.",
    sources: [SRC.channel, SRC.ttvh],
  },
];

export const TIMELINE: { when: string; title: string; text: string; sources: Source[] }[] = [
  {
    when: "Trước khi nổi",
    title: "Báo thủ Cao Lãnh",
    text: 'Chưa có việc ổn định, ở quê phụ mẹ bán hoa. Tự nhận mình là "báo thủ chính hiệu". Mẹ từng phản đối chơi game vì nghĩ không kiếm ra tiền.',
    sources: [SRC.ttvh],
  },
  {
    when: "Thời PUBG lên ngôi",
    title: "Đi đá stream anh Độ",
    text: "Học cách đá stream từ streamer nước ngoài, rồi vào PUBG săn anh Độ Mixi, lúc kênh anh Độ còn chưa tới 100 nghìn sub. Khác mọi người, Rambo hay quay sang giúp anh Độ nên được để ý, sau đó hai anh em chơi chung.",
    sources: [SRC.kenh14, SRC.ttvh],
  },
  {
    when: "2018",
    title: "Lên tuyển thủ",
    text: "Đánh PUBG chuyên nghiệp cho EVOS, sau đó về Refund Gaming. Anh Độ còn gọi điện xin phép mẹ Rambo cho theo nghề game.",
    sources: [SRC.kenh14, SRC.vnn, SRC.ttvh],
  },
  {
    when: "27/10/2018",
    title: "Giải quốc tế đầu tiên",
    text: "Ra mắt ở JIB PUBG SEA Championship 2018, xếp hạng 15.",
    sources: [SRC.esports],
  },
  {
    when: "14/06/2019",
    title: "🏆 Vô địch PUBG Vietnam Series 2019 Phase 2",
    text: "Cùng Refund Gaming (Nhism, Snake, Pino, FunkyM) lên ngôi. Đây là danh hiệu vô địch duy nhất trong hồ sơ thi đấu của Rambo.",
    sources: [SRC.esports, SRC.kenh14],
  },
  {
    when: "2019–2020",
    title: "Những giải cuối",
    text: "Hạng 3 Star PUBG Tournament 2019, hạng 12 PUBG SEA Championship 2019 Phase 2. Giải cuối cùng trong hồ sơ là PUBG Vietnam Series 2020 Spring. Tổng cộng 7 giải.",
    sources: [SRC.esports],
  },
  {
    when: "Sau đó",
    title: "Thành streamer full-time",
    text: "Refund thôi thi đấu PUBG chuyên nghiệp, chuyển hẳn sang livestream giải trí. Rambo là thành viên thứ hai của Refund (sau anh Độ) có nút Vàng YouTube.",
    sources: [SRC.kenh14, SRC.ttvh],
  },
];

export const TRIVIA: { emoji: string; text: string; sources: Source[] }[] = [
  {
    emoji: "🎭",
    text: 'Hồi nhỏ hay nhại giọng Châu Tinh Trì khi chơi với bạn bè, nên giờ còn có biệt danh "Châu Tinh Bô".',
    sources: [SRC.ttvh, SRC.channel],
  },
  { emoji: "👨‍👦", text: 'Trên stream hay gọi anh Độ Mixi là "người bố".', sources: [SRC.kenh14] },
  { emoji: "🏠", text: "Đã xây cho mẹ một căn nhà lớn và mua tặng mẹ một chiếc Mercedes.", sources: [SRC.ttvh] },
  {
    emoji: "🐱",
    text: 'Trong tiêu đề video, vợ được gọi là "bà xã Mèo Méo" hay "Trân mập", còn Rambo tự xưng là "ông xã Bồ Bố".',
    sources: [SRC.channel],
  },
  {
    emoji: "💸",
    text: 'Fan gọi là "Refund Rambo" theo tên đội, còn tên kênh thì tự giới thiệu luôn: Tui tên Bô.',
    sources: [SRC.channel],
  },
  {
    emoji: "🥢",
    text: 'Quen vợ nhờ bánh tráng trộn: Rambo đặt 10 bịch bánh tráng của chị Trân, lúc giao chỉ bị lấy 30 nghìn tiền ship. Hỏi sao rẻ vậy thì được trả lời: "Thùng bánh tráng tình yêu đó".',
    sources: [SRC.vgtLove, SRC.wedding],
  },
  {
    emoji: "🐄",
    text: 'Chị Trân lớn hơn Rambo 2 tuổi, và chính chị là người follow Instagram Rambo trước. Đúng chuẩn "cọc đi tìm trâu".',
    sources: [SRC.vgtLove, SRC.wedding],
  },
  {
    emoji: "👶",
    text: 'Báo tin sắp làm bố ngay trên livestream năm 2021. Con trai đầu tên Đinh Văn Thanh Phước Thiện, do bà đặt. Rambo còn đùa là "cu con chui ra từ lần đi chơi Phú Quốc".',
    sources: [SRC.vgtBaby],
  },
  {
    emoji: "💒",
    text: "Đám cưới bị hoãn vì Covid, tới cuối năm 2024 mới tổ chức ở TP.HCM, lúc đã có hai cậu con trai. MC là Mimosa, khách mời có anh Độ, ViruSs, Thầy Giáo Ba.",
    sources: [SRC.wedding],
  },
  {
    emoji: "🎤",
    text: 'Ở đám cưới, Rambo hát tặng vợ bài "Gấp đôi yêu thương". Gồng nốt cao không nổi nên hát như rap, khách nghe xong quên luôn bản gốc.',
    sources: [SRC.wedding],
  },
  {
    emoji: "📺",
    text: 'Từng live trên Nimo nhiều năm. Có hẳn video "Tạm biệt Nimo", rồi quay về với buổi live "Hello YouTube! Rambo trở lại live YouTube sau nhiều năm xa cách".',
    sources: [SRC.channel],
  },
  {
    emoji: "🌾",
    text: "Giọng miền Tây chính hiệu, cũng là một lý do người xem mê. Lúc biết con là trai, Rambo mong con lớn lên cũng phải đúng chuẩn miền Tây.",
    sources: [SRC.vgtBaby],
  },
  {
    emoji: "🔬",
    text: 'Trong phần từ khoá của kênh có cả "Phùng Khoa Học". Nên web này tên là Nhà Khoa Học.',
    sources: [SRC.channel],
  },
];
