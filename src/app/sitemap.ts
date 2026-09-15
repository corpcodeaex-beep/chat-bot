import type { MetadataRoute } from "next";
import { LEGAL_DOCS } from "@/lib/legal";
import { INDUSTRIES } from "@/lib/marketing";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const legal = LEGAL_DOCS.map((d) => d.path);
  const paths = ["", "/features", "/pricing", "/industries", "/about", "/contact", ...INDUSTRIES.map((i) => `/industries/${i.slug}`), ...legal];
  return paths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: legal.includes(path) ? "yearly" : "monthly",
    priority: path === "" ? 1 : legal.includes(path) ? 0.3 : path.startsWith("/industries/") ? 0.6 : 0.8,
  }));
}
