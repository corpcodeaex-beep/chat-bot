import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/", "/embed/", "/login", "/forgot-password", "/reset-password"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
