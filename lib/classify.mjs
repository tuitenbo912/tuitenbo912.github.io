// Phân loại video dựa trên tiêu đề. Kênh hay gắn nhãn đầu tiêu đề kiểu
// "(Valorant) ...", "(DailyStream) ...", "(IRL STREAM) ...", nên nhãn này là
// tín hiệu chính; từ khoá trong tiêu đề dùng cho video không có nhãn.
// File thuần JS để cả web lẫn script tải logo dùng chung.

/** Bỏ dấu + in hoa, để so khớp không phụ thuộc cách gõ. */
export function fold(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toUpperCase();
}

export function slugify(s) {
  return fold(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Nhãn đầu tiêu đề: "(GTA V 2026) ..." → "GTA V 2026" */
export function titleTag(title) {
  return title.match(/^\s*(?:🔴\s*)?[([]\s*([^)\]]+?)\s*[)\]]/)?.[1] ?? null;
}

/**
 * Game Rambo từng chơi. `match` chạy trên nhãn và tiêu đề đã bỏ dấu, in hoa.
 * `logo` cho script `npm run logos`: steam = appid, appstore = tên app trên App Store,
 * favicon = tên miền trang chủ.
 */
export const GAMES = [
  { name: "PUBG", match: /PUBG|AO LANG|PHA KEP TUYEN THU|BATTLEGROUNDS/, logo: { steam: 578080 } },
  { name: "GTA V", match: /\bGTA|MIXI ?CITY|CHANH CITY|HUY TROC CITY|GOVN|DON CHE|ROLE ?PLAY/, logo: { steam: 271590 } },
  {
    name: "FC Online",
    match:
      /FC ONLINE|\bFO4\b|^FIFA$|FIFA ONLINE|\bFCO\b|^(?!.*(ONE PIECE|BOX CARD|BABY THREE)).*(MO THE|MO HO\b|DAP THE)|VONG SU KIEN|ICON \+\d|\bCC \+\d|\bWS \+\d|MUA KENH CHAT|CU NHAP \d/,
    logo: { appstore: "FC Online M by EA SPORTS" },
  },
  { name: "Valorant", match: /VALORANT/, logo: { favicon: "playvalorant.com" } },
  { name: "Goose Goose Duck", match: /GOOSE GOOSE DUCK|CHOI VIT|CHU VIT/, logo: { steam: 1568590 } },
  { name: "The Isle", match: /THE ISLE\b/, logo: { steam: 376210 } },
  { name: "Liar's Bar", match: /LIAR'?S BAR/, logo: { steam: 3097560 } },
  { name: "Business Tour", match: /BUS+IN?E?S+ TOUR|CO TI PHU/, logo: { steam: 397900 } },
  { name: "Euro Truck Simulator 2", match: /EURO TRUCK/, logo: { steam: 227300 } },
  { name: "Đột Kích", match: /DOT KICH|CROSSFIRE(?!: ?LEGENDS)/, logo: null },
  { name: "CrossFire: Legends", match: /CROSSFIRE: ?LEGENDS/, logo: { appstore: "Crossfire: Legends" } },
  { name: "Truy Kích", match: /TRUY KICH/, logo: null },
  { name: "Đấu Trường Chân Lý", match: /\bTFT\b|DAU TRUONG CHAN LY/, logo: { appstore: "Đấu Trường Chân Lý" } },
  { name: "Mount & Blade II", match: /MOUNT\s*&\s*BLADE|BANNERLORD/, logo: { steam: 261550 } },
  { name: "Contraband Police", match: /CONTRABAND POLICE/, logo: { steam: 756800 } },
  { name: "Only Up", match: /ONLY UP/, logo: { steam: 2475490 } },
  { name: "Lockdown Protocol", match: /LOCKDOWN PROTOCOL/, logo: { steam: 2780980 } },
  { name: "Delta Force", match: /DELTA FORCE/, logo: { steam: 2507950 } },
  { name: "Revenge on Gold Diggers", match: /REVENGE ON GOLD/, logo: { steam: 3350200 } },
  { name: "Tai Ương", match: /TAI UONG|THE SCOURGE/, logo: { steam: 2456350 } },
  { name: "Đồng Cỏ Lau", match: /DONG CO LAU/, logo: { steam: 3985730 } },
  { name: "Cỏ Máu", match: /CO MAU/, logo: { steam: 1673000 } },
  { name: "Sea of Thieves", match: /SEA OF THIEVES/, logo: { steam: 1172620 } },
  { name: "Counter-Strike 2", match: /^CS2?$|\bCS2\b|CS:? ?GO|COUNTER.?STRIKE/, logo: { steam: 730 } },
  { name: "Left 4 Dead 2", match: /LEFT 4 DEAD|^LEFT$/, logo: { steam: 550 } },
  { name: "Mall Simulator", match: /MALL SM?I?MULATOR/, logo: { steam: 3180150 } },
  { name: "Streamer Life Simulator", match: /STREAMER LI(FE|VE) SIMULAT/, logo: { steam: 1261040 } },
  { name: "Gym Simulator 24", match: /GYM SIMULATOR/, logo: { steam: 2559270 } },
  { name: "Thief Simulator 2", match: /THIEF SIMULATOR/, logo: { steam: 1332720 } },
  { name: "Chained Together", match: /CHAINED TOGETHER/, logo: { steam: 2567870 } },
  { name: "Blood Money: Lethal Eden", match: /BLOOD MONEY/, logo: { steam: 3850560 } },
  { name: "Silent Hill f", match: /SILENT HILL/, logo: { steam: 2947440 } },
  { name: "The Mortuary Assistant", match: /MORTUARY ASSISTANT/, logo: { steam: 1295920 } },
  { name: "Marvel Rivals", match: /MARVEL RIVALS/, logo: { steam: 2767030 } },
  { name: "Where Winds Meet", match: /WHERE ?WINDS ?MEET/, logo: { steam: 3564740 } },
  { name: "Schedule I", match: /SCHEDULE I\b/, logo: { steam: 3164500 } },
  { name: "Party Animals", match: /PARTY ANIMALS?\b/, logo: { steam: 1260320 } },
  { name: "Pummel Party", match: /PUMMEL PARTY/, logo: { steam: 880940 } },
  { name: "Plants vs. Zombies", match: /PLANTS VS\.? ZOMBIES/, logo: { steam: 3590 } },
  { name: "Car For Sale Simulator", match: /CAR FOR SALE/, logo: { steam: 2248760 } },
  { name: "Halu: The Fracture", match: /HALU/, logo: { steam: 3893210 } },
  { name: "Grieving (Berduka)", match: /GRIEVING|BERDUKA/, logo: { steam: 4003990 } },
  { name: "Graveyard 404", match: /GRAVEYARD ?404/, logo: { steam: 3846620 } },
  { name: "Biệt Đội Đùn Đùn", match: /BIET DOI DUN DUN/, logo: null },
  { name: "Alt F4", match: /ALT ?F ?4/ },
  { name: "DayZ", match: /\bDAYZ\b/, logo: { steam: 221100 } },
  { name: "Among Us", match: /AMONG ?US/, logo: { steam: 945360 } },
  { name: "Payday", match: /PAYDAY/, logo: { favicon: "paydaythegame.com" } },
  { name: "Liên Minh Huyền Thoại", match: /\bLMHT\b|LIEN MINH|LEAGUE OF LEGENDS|^(BO )?LOL\b|KATHOLIC|PENTAKILL/, logo: { favicon: "leagueoflegends.com" } },
  { name: "Liên Quân Mobile", match: /LIEN QUAN/, logo: { appstore: "Garena Liên Quân Mobile" } },
  { name: "Minecraft", match: /MINECRAFT/, logo: { favicon: "minecraft.net" } },
  { name: "Fortnite", match: /FORTNITE/, logo: { favicon: "fortnite.com" } },
  { name: "Raft", match: /\bRAFT\b/, logo: { steam: 648800 } },
  { name: "Rust", match: /\bRUST\b/, logo: { steam: 252490 } },
  { name: "A Way Out", match: /A WAY OUT/, logo: { steam: 1222700 } },
  { name: "It Takes Two", match: /IT TAKES TWO/, logo: { steam: 1426210 } },
  { name: "Gartic Phone", match: /GARTIC/, logo: { favicon: "garticphone.com" } },
  { name: "Battleship", match: /BATTLESHIP/, logo: null },
  { name: "Pico Park", match: /PICO PARK/, logo: { steam: 1509960 } },
  { name: "Gang Beasts", match: /GANG BEASTS/, logo: { steam: 285900 } },
  { name: "Ma Sói", match: /MA SOI|AGROU/, logo: null },
  { name: "SCUM", match: /\bSCUM\b/, logo: { steam: 513710 } },
  { name: "Sons of the Forest", match: /SONS OF THE FOREST/, logo: { steam: 1326470 } },
  { name: "Hell Let Loose", match: /HELL LET LOOSE/, logo: { steam: 686810 } },
  { name: "Thần Trùng", match: /THAN TRUNG/ },
  { name: "Super People", match: /SUPER PEOPLE/ },
  { name: "The King of Fighters XV", match: /KING OF FIGHTERS|\bKOF\b/, logo: { steam: 1498570 } },
  { name: "ARK", match: /\bARK\b/, logo: { steam: 346110 } },
  { name: "Call of Duty: Warzone", match: /\bCOD\b|WARZONE|CALL OF DUTY/, logo: { favicon: "callofduty.com" } },
];

/** Playlist không nói lên game nào (bỏ dấu, in hoa). */
const NON_GAME_PLAYLISTS = /HOI VIEN|LANG THANG|LIVESTREAM|IRL|SHORTS|TALKSHOW|OMETV|DUYET BAI|STREAM MOMENT|DAILY|OFFICIAL MV|INTRO|REACTION|VLOG/;

/**
 * Playlist gợi ý định dạng, dùng khi tiêu đề không có nhãn định dạng.
 * @type {[RegExp, string][]}
 */
const PLAYLIST_FORMATS = [
  [/TALKSHOW/, "talkshow"],
  [/OMETV/, "ome-azar"],
  [/REACTION/, "reaction"],
  [/OFFICIAL MV/, "mv"],
  [/LANG THANG|IRL/, "irl"],
];

/** Nhãn đầu tiêu đề không phải tên game. */
const FORMAT_TAG = /DAI\w*\s*ST|DAILY|IRL|VLOG|REACTION|TALK\w*SHOW|OME ?TV|NIM[O0] ?SHOW|GALA|MOMENT|GHEP DOI|Q ?& ?A|REUP|CAM RAMBO|CHECK THU|GOC PHAN|\bMV\b|DUYET BAI|CO\s*STE?R?A?M|RESTREAM|LIVESTREAM|PHAN TIEP|AZAR|LANG THANG|^PGS|^PGC|^PNC|DAI TIEC|PHA KEP|HOI VIEN|SUPER SUNDAY/;

/** Tên game từ nhãn lạ (game mới chưa khai báo ở GAMES). */
function gameFromTag(tag) {
  const clean = tag
    .replace(/#\s*\w*$/, "")
    .replace(/\b(DEMO|END|FREE SAMPLE|PROLOGUE)\b/gi, "")
    .replace(/[:\-–|]+\s*$/, "")
    .trim();
  if (!clean || FORMAT_TAG.test(fold(clean))) return null;
  return clean === clean.toUpperCase()
    ? clean.toLowerCase().replace(/(^|\s)(\p{L})/gu, (m) => m.toUpperCase())
    : clean;
}

/**
 * Định dạng nội dung. Mỗi video thuộc tối đa một định dạng: lấy cái đầu tiên khớp.
 * `test` nhận { tag, title, game, live } với tag/title đã bỏ dấu, in hoa.
 * Định dạng `byKeyword` chỉ áp cho video không thuộc game nào, vì clip game đã nằm ở thẻ game.
 * Video không khớp gì: buổi live → Livestream, clip không có game → Clip vui khác,
 * clip game → chỉ nằm trong thẻ game.
 */
export const FORMATS = [
  {
    slug: "costream",
    name: "Costream giải đấu",
    emoji: "🏆",
    blurb: "Ngồi xem và bình luận giải PUBG (PGS, PGC, PNC), cổ vũ đội Việt Nam",
    color: "#FFE08A",
    test: ({ tag, title }) => /CO-?\s*STE?R?A?M|^PG[SC]|^PNC/.test(tag) || /^CO-?STREAM|\[(PGS|PGC|PNC)|TRUNG LAP/.test(title),
  },
  {
    slug: "irl",
    name: "IRL",
    emoji: "🚶",
    blurb: "Cầm máy ra đường: đi ăn, đi bão, Khoa Lang Thang",
    color: "#B9F3C7",
    test: ({ tag, title }) => /IRL|LANG THANG/.test(tag) || /^IRL\b|^KHOA LANG THANG/.test(title),
  },
  {
    slug: "vlog",
    name: "Vlog",
    emoji: "🎥",
    blurb: "Series Vlog và Daily Vlog đánh số thứ tự",
    color: "#A6F0E0",
    test: ({ tag }) => /^(DAILY\s*)?VLOG\s*#?\s*\d+/.test(tag),
  },
  {
    slug: "livestream",
    name: "Livestream",
    emoji: "🔴",
    blurb: "Bản ghi các buổi live, gồm cả Daily Stream hằng đêm",
    color: "#FF8A80",
    test: ({ tag, title }) => /^DAI\w*\s*ST/.test(tag) || /^DAILY STREAM$/.test(title),
  },
  {
    slug: "mv",
    name: "Âm nhạc & MV",
    emoji: "🎵",
    blurb: "Rambo lấn sân ca hát: MV, lyric video, intro kênh",
    color: "#FFC6FF",
    test: ({ tag, title }) => /\bMV\b|LYRIC/.test(tag) || /\bMV\b|LYRIC VIDEO|OFFICIAL MUSIC/.test(title),
  },
  {
    slug: "ome-azar",
    name: "OmeTV & Azar",
    emoji: "🎲",
    blurb: "Ghép đôi ngẫu nhiên với người lạ, toàn gặp gái xinh hoặc gặp quỷ",
    color: "#C9B8FF",
    byKeyword: true,
    test: ({ tag, title }) => /AZAR|OME ?TV/.test(tag) || /\bOME(TV)?\b|AZAR|TIN NHAN CHO/.test(title),
  },
  {
    slug: "reaction",
    name: "Reaction",
    emoji: "😂",
    blurb: "Xem clip, xem vlog anh em, xem lại chính mình",
    color: "#FFB5C9",
    byKeyword: true,
    test: ({ tag, title }) => /REACTION/.test(tag) || (!tag && /REACTION|XEM LAI|KHI XEM|SAU KHI XEM|REVIEW|NHIN LAI|TONG HOP|FUNNY|CUNG XEM/.test(title)),
  },
  {
    slug: "mo-the",
    name: "Unbox & bóc thẻ",
    emoji: "🃏",
    blurb: "Đập box card, bóc thẻ One Piece, mở Baby Three",
    color: "#9FE3FF",
    byKeyword: true,
    test: ({ title }) => /MO THE|DAP THE|MO HOP|MO HOM|MO RA|UNBOX|BABY THREE|BOX CARD|\bBOX\b|THE ONE PIECE/.test(title),
  },
  {
    slug: "an-uong",
    name: "Ăn uống",
    emoji: "🍜",
    blurb: "Mukbang, thử món, review đồ ăn",
    color: "#FF9F68",
    byKeyword: true,
    test: ({ title }) => /MUKBANG|AN THU|THUONG THUC|AM THUC|\bMON (AN|CA|QUA)|VOI MON\b|MON NGON|\bMI\b|\bMY (CUA|SOT|TOM)|BUN RIEU|BEEF|TEPANYAKI|OMASAKE|COM CHAY|AN VAT|HOT VIT LON/.test(title),
  },
  {
    slug: "talkshow",
    name: "Talkshow & Tâm sự",
    emoji: "🎤",
    blurb: "Ngồi nói chuyện, tâm sự, kể chuyện đời",
    color: "#E2D4F7",
    byKeyword: true,
    test: ({ tag, title }) => /TALK\w*SHOW/.test(tag) || /TALKSHOW|TAM SU|TRO CHUYEN|QUA KHU/.test(title),
  },
  {
    slug: "clip-vui",
    name: "Clip vui khác",
    emoji: "🤪",
    blurb: "Mấy clip lầy lội không xếp vào đâu được",
    color: "#F1F5A8",
    test: () => false,
  },
];

export const SHORTS_FORMAT = {
  slug: "shorts",
  name: "Shorts",
  emoji: "⚡",
  blurb: "Clip ngắn, xem một phát là cười",
  color: "#9FE3FF",
};

const HORROR_GAMES = [
  "Tai Ương", "Đồng Cỏ Lau", "Cỏ Máu", "Silent Hill f", "The Mortuary Assistant", "Grieving (Berduka)",
  "Halu: The Fracture", "Amenti", "Graveyard 404", "Chuxie", "Bad Parenting 1", "Her Trees", "The Isle", "Thần Trùng",
  "Sons of the Forest", "Paper Dolls", "Pacify", "Devour", "The Kidnap", "Welcome to Kowloon", "Content Warning",
];
const JOB_GAMES = /SIMULATOR|CONTRABAND|SCHEDULE|SUSHI HOUSE|BUSINESS TOUR/i;

/**
 * Chủ đề: một video có thể thuộc nhiều chủ đề, bất kể định dạng.
 * `test` nhận { title (bỏ dấu, in hoa), raw (tiêu đề gốc), game }.
 */
export const THEMES = [
  {
    slug: "gia-dinh",
    name: "Gia đình Bô",
    emoji: "👨‍👩‍👦",
    blurb: "Bà xã Mèo Méo (Trân mập), các con, mẹ, đám cưới",
    color: "#FFC8DD",
    test: ({ title }) => /BA XA|ONG XA|MEO MEO|TRAN MAP|TRAN MEO|ME TRAN|ME TIEN|BE BEN|DAM CUOI RAMBO|ANH CUOI|HINH CUOI|DUA CON/.test(title),
  },
  {
    slug: "anh-em-refund",
    name: "Cùng anh Độ & Refund",
    emoji: "🤝",
    blurb: "Đi chơi, đi ăn, đi giải với anh Độ Mixi và anh em Refund",
    color: "#BDE0FE",
    test: ({ title }) => /DO MIXI|ANH DO\b|BO DO\b|REFUND|MIXICORP|MIXICUP|NHISM|ANH PHA|DEV NGUYEN|EM DEV|CHI DOAN|BAO HAN/.test(title),
  },
  {
    slug: "viet-nam",
    name: "Cổ vũ Việt Nam",
    emoji: "🇻🇳",
    blurb: "Đi bão, ngồi live cổ vũ tuyển Việt Nam ở mọi giải",
    color: "#FFB4A2",
    test: ({ title, raw }) => /🇻🇳/.test(raw) || /VIET NAM|DTQG/.test(title),
  },
  {
    slug: "kinh-di",
    name: "Game kinh dị",
    emoji: "👻",
    blurb: "Tai Ương, Silent Hill f, Đồng Cỏ Lau… Rambo hét nhiều hơn bắn",
    color: "#CDB4DB",
    test: ({ title, game }) => HORROR_GAMES.includes(game) || /KINH DI|LOI NGUYEN|TAM LINH|HU MA/.test(title),
  },
  {
    slug: "lam-nghe-ao",
    name: "Làm đủ nghề (trong game)",
    emoji: "🧰",
    blurb: "Hải quan, trộm, bán xe, mở siêu thị, chủ quán sushi: nghề nào cũng thử",
    color: "#FDE68A",
    test: ({ game }) => !!game && JOB_GAMES.test(game),
  },
  {
    slug: "xuat-ngoai",
    name: "Bô xuất ngoại",
    emoji: "✈️",
    blurb: "London, New York, Munich, Thượng Hải, Hàn Quốc…",
    color: "#A0C4FF",
    test: ({ title, raw }) =>
      /LONDON|NEW YORK|MUNICH|BAYERN|THUONG HAI|SHANGHAI|KOREA|HAN QUOC|CHAU AU|LOS ANGELES|NHAT BAN|SINGAPORE|SAN BAY/.test(title) ||
      /NƯỚC MỸ|ĐI MỸ|MƠ MỸ|BÊN MỸ|ĐI ĐỨC|ĐI ÚC|HỌC ÚC/i.test(raw),
  },
  {
    slug: "bong-da",
    name: "Mê bóng đá",
    emoji: "⚽",
    blurb: "Đá MixiCup, xem Argentina, ngồi bình luận như BLV",
    color: "#B9FBC0",
    test: ({ title }) => /BONG DA|DA BONG|MIXICUP|DOI BONG|HAU VE|SUPER SUNDAY|ARGENTINA|THUY SY|GARNACHO|HALA MA|WORLD CUP|TRAN CAU|BLV/.test(title),
  },
  {
    slug: "gai-xinh",
    name: "Gặp gái xinh",
    emoji: "💘",
    blurb: "Cưa cẩm, tán gái, gặp người đẹp (rồi bị bà xã VAR)",
    color: "#FFAFCC",
    test: ({ title }) => /GAI XINH|NGUOI DEP|CO NUONG|CUA CAM|TAN GAI|NU XINH|FEN NU|TEAM NU/.test(title),
  },
  {
    slug: "boc-phot",
    name: "Bóc phốt & VAR",
    emoji: "🕵️",
    blurb: "Drama, bị VAR, lật tẩy lừa đảo, check sao kê",
    color: "#D8E2DC",
    test: ({ title }) => /\bVAR\b|BOC PHOT|DRAMA|LUA DAO|SAO KE|LAT TAY|BOC ME/.test(title),
  },
  {
    slug: "cam-dong",
    name: "Khoảnh khắc xúc động",
    emoji: "🥹",
    blurb: "Mấy lúc Bô không lầy nữa mà rưng rưng",
    color: "#E9EDC9",
    test: ({ title }) => /XUC DONG|TRAI LONG|NUOC MAT|CAM DONG|TAM BIET/.test(title),
  },
];

/** Game suy ra từ tên playlist chứa video (tín hiệu phụ, vì vài playlist để lẫn nội dung). */
function gameFromPlaylists(lists) {
  for (const raw of lists) {
    const name = fold(raw);
    if (NON_GAME_PLAYLISTS.test(name)) continue;
    const known = GAMES.find((g) => g.match.test(name))?.name;
    if (known) return known;
    const guess = gameFromTag(raw.replace(/\s+(SS\s*\d+|\d{4}|#\d+)$/i, ""));
    if (guess) return guess;
  }
  return null;
}

/**
 * Gắn game, định dạng, chủ đề cho một video.
 * `lists`: tên các playlist chứa video. Thứ tự ưu tiên game: nhãn tiêu đề → từ khoá tiêu đề → playlist.
 */
export function classify(video, lists = []) {
  const tagRaw = titleTag(video.title);
  const tag = tagRaw ? fold(tagRaw) : "";
  const title = fold(video.title);
  const live = !!(video.isLive || video.wasLive);

  let game =
    (tag && GAMES.find((g) => g.match.test(tag))?.name) ||
    GAMES.find((g) => g.match.test(title))?.name ||
    gameFromPlaylists(lists) ||
    (tagRaw ? gameFromTag(tagRaw) : null);
  const ctx = { tag, title, game, live };
  const listFormat = PLAYLIST_FORMATS.find(([re]) => lists.some((l) => re.test(fold(l))))?.[1];
  const format = video.isShort
    ? SHORTS_FORMAT.slug
    : (FORMATS.find((f) => !f.byKeyword && f.slug !== "clip-vui" && f.test(ctx))?.slug ??
      (game ? undefined : listFormat) ??
      FORMATS.find((f) => f.byKeyword && !game && f.test(ctx))?.slug ??
      (live ? "livestream" : game ? null : "clip-vui"));
  // Costream là xem giải, không phải tự chơi.
  if (format === "costream") game = null;

  return {
    game,
    format,
    themes: THEMES.filter((t) => t.test({ title, raw: video.title, game })).map((t) => t.slug),
  };
}
