import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // نوفّر متغيرات NEXT_PUBLIC للمتصفح اعتماداً على المتغيرات المتاحة في المشروع.
    // مفتاح anon مخصص أصلاً ليكون عاماً في المتصفح ومحمي عبر RLS.
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      "https://kehkbtpnolsatpolvfmy.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
