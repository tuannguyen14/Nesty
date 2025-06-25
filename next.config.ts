import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'agavsansrstvzzdqmdku.supabase.co',
        // pathname: '/**' // Nếu muốn cho phép tất cả path (có thể bỏ qua vì mặc định là tất cả)
      },
      // Thêm các domain khác (nếu có) theo dạng object tương tự
    ],
  },
};

export default nextConfig;
