import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Document readers run as plain Node packages on the server.
  serverExternalPackages: ["unpdf", "mammoth", "nodemailer"],
  experimental: {
    // Admin API goes through proxy.ts; allow document uploads up to ~20 MB.
    proxyClientMaxBodySize: "20mb",
  },
};

export default nextConfig;
