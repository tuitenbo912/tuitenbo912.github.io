"use client";

import { useEffect, useState } from "react";

const format = (iso: string, timeZone?: string) =>
  new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone });

/** Giờ theo múi giờ máy người xem. Lúc dựng trên server chưa biết múi giờ đó nên tạm in giờ Việt Nam. */
export default function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState(() => format(iso, "Asia/Ho_Chi_Minh"));
  useEffect(() => setText(format(iso)), [iso]);
  return <time dateTime={iso}>{text}</time>;
}
