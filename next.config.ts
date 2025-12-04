import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Opzioni di configurazione */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 👈 Questo permette immagini da QUALSIASI sito esterno
      },
    ],
  },
};

export default nextConfig;