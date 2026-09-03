import type { MetadataRoute } from "next";
import { company } from "@/brand";

/**
 * Web app manifest. Its job here is `display: standalone`: when the site is
 * added to an iPhone home screen it opens without Safari's chrome, the
 * viewport runs under the physical Dynamic Island, and the nav island sits
 * below it using the real safe-area inset (see --island-top in globals.css).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: company.name,
    short_name: company.name,
    description: company.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [{ src: "/brand/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
