import { useEffect } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "Uplight";
const DEFAULT_DESCRIPTION =
  "Open source uptime monitoring. Monitor your services from multiple regions, get instant alerts, and keep users informed with status pages.";
const DEFAULT_OG_IMAGE = "/og-image.png";

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Basic meta tags
    setMeta("description", description);

    // Robots
    if (noIndex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.remove();
    }

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", ogType, true);
    setMeta("og:site_name", SITE_NAME, true);
    if (ogImage) {
      setMeta("og:image", ogImage, true);
    }
    if (canonical) {
      setMeta("og:url", canonical, true);
    }

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    if (ogImage) {
      setMeta("twitter:image", ogImage);
    }

    // Canonical link
    if (canonical) {
      let link = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // JSON-LD structured data
    const existingScript = document.querySelector(
      'script[data-seo="jsonld"]'
    ) as HTMLScriptElement;
    if (jsonLd) {
      if (existingScript) {
        existingScript.textContent = JSON.stringify(jsonLd);
      } else {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.dataset.seo = "jsonld";
        script.textContent = JSON.stringify(jsonLd);
        document.head.appendChild(script);
      }
    } else if (existingScript) {
      existingScript.remove();
    }

    // Cleanup: remove JSON-LD on unmount
    return () => {
      const script = document.querySelector('script[data-seo="jsonld"]');
      if (script) script.remove();
    };
  }, [fullTitle, description, canonical, ogImage, ogType, noIndex, jsonLd]);

  return null;
}
