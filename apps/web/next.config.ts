import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "dcwieoyzmyesvfugjrxn.supabase.co",
      "i3.ytimg.com",
      "unsplash.com",
    ],
  },
  experimental: {
    reactCompiler: true,
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
