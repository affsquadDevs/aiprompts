import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getAllPackIds, getCategories } from "@/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/packs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = getCategories().map((c) => ({
    url: `${SITE_URL}/packs?category=${c.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const packRoutes: MetadataRoute.Sitemap = getAllPackIds().map((id) => ({
    url: `${SITE_URL}/packs/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...packRoutes];
}
