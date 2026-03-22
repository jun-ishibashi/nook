import type { MetadataRoute } from "next";
import { isSiteNoIndex } from "@/lib/site-indexing";

export default function robots(): MetadataRoute.Robots {
  if (isSiteNoIndex()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
  };
}
