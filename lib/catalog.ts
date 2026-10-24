import { FORMATS, SHORTS_FORMAT, THEMES } from "./classify.mjs";

export type Video = {
  id: string;
  title: string;
  thumb: string;
  duration: string | null;
  views: string | null;
  ago: string | null;
  time: number | null;
  isLive: boolean;
  wasLive: boolean;
  isShort?: boolean;
  /** Game chính (nhãn tiêu đề) và mọi game có trong video, kể cả từ mốc thời gian mô tả. */
  game?: string | null;
  games?: string[];
  format?: string | null;
  formats?: string[];
  themes?: string[];
};

export type Category = { slug: string; name: string; emoji: string; blurb: string; color: string };

/** Định dạng (buổi live có mốc thời gian có thể thuộc nhiều loại) + chủ đề (có thể trùng) + Shorts. */
export const CATEGORIES: (Category & { kind: "format" | "theme" | "shorts" })[] = [
  ...FORMATS.map(({ slug, name, emoji, blurb, color }) => ({ slug, name, emoji, blurb, color, kind: "format" as const })),
  { ...SHORTS_FORMAT, kind: "shorts" as const },
  ...THEMES.map(({ slug, name, emoji, blurb, color }) => ({ slug, name, emoji, blurb, color, kind: "theme" as const })),
];

export const CARD_COLORS = ["#FF9F68", "#9FE3FF", "#FFD23F", "#B9F3C7", "#FFB5C9", "#C9B8FF", "#FFE08A", "#A6F0E0"];

/** Playlist không đưa vào kho (video chỉ dành cho hội viên, người ngoài không xem được). */
export const SKIP_PLAYLISTS = ["Hội Viên"];
