/** @type {import('next').NextConfig} */
export default {
  // Logo game và avatar được đọc bằng fs lúc chạy, nên phải đóng gói kèm vào function.
  outputFileTracingIncludes: {
    "/**": ["./public/logos/**", "./assets/**"],
  },
};
