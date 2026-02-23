import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/signup", "/login", "/forgot-password"],
        disallow: ["/dashboard/", "/reset-password/"],
      },
    ],
    sitemap: "https://www.swaradigital.com/sitemap.xml",
  };
}
