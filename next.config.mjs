/** @type {import('next').NextConfig} */
export default {
  // Logo game và avatar được đọc bằng fs lúc chạy, nên phải đóng gói kèm vào function.
  outputFileTracingIncludes: {
    "/**": ["./public/logos/**", "./assets/**"],
  },
  // Logo game ít khi đổi: cho trình duyệt nhớ 7 ngày, người quay lại không phải tải lại.
  async headers() {
    return [
      {
        source: "/logos/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};
