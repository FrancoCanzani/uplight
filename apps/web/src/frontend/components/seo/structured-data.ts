// Structured data generators for different page types

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Uplight",
    url: "https://uplight.dev",
    logo: "https://uplight.dev/logo.png",
    description:
      "Open source uptime monitoring. Monitor your services from multiple regions, get instant alerts, and keep users informed with status pages.",
    sameAs: ["https://github.com/francocanzani/uplight"],
  };
}

export function createWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Uplight",
    url: "https://uplight.dev",
    description: "Open source uptime monitoring",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://uplight.dev/status/{search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function createSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Uplight",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Open source uptime monitoring tool with multi-region checks, instant alerts, and public status pages.",
    featureList: [
      "Multi-region monitoring from 9+ locations",
      "30-second check intervals",
      "Slack, Discord, email, and webhook alerts",
      "Public status pages",
      "SSL and domain expiry monitoring",
      "Team collaboration",
    ],
  };
}

export function createFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function createStatusPageSchema(data: {
  name: string;
  description?: string;
  url: string;
  status: "operational" | "degraded" | "outage";
  services: Array<{
    name: string;
    status: string;
    uptime: number;
  }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${data.name} Status`,
    description: data.description || `Current status for ${data.name} services`,
    url: data.url,
    mainEntity: {
      "@type": "ItemList",
      name: "Service Status",
      description: `Status of ${data.name} services`,
      numberOfItems: data.services.length,
      itemListElement: data.services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name: service.name,
          description: `${service.name} is ${service.status}. ${service.uptime.toFixed(2)}% uptime.`,
        },
      })),
    },
  };
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function createArticleSchema(data: {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description,
    url: data.url,
    datePublished: data.publishedAt,
    dateModified: data.updatedAt || data.publishedAt,
    author: {
      "@type": "Organization",
      name: data.author || "Uplight",
    },
    publisher: {
      "@type": "Organization",
      name: "Uplight",
      logo: {
        "@type": "ImageObject",
        url: "https://uplight.dev/logo.png",
      },
    },
    image: data.image || "https://uplight.dev/og-image.png",
  };
}

export function createHowToSchema(data: {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: data.name,
    description: data.description,
    totalTime: data.totalTime,
    step: data.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };
}

export function createComparisonSchema(data: {
  title: string;
  description: string;
  url: string;
  mainProduct: string;
  comparedProduct: string;
  features: Array<{
    name: string;
    mainValue: string;
    comparedValue: string;
  }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description,
    url: data.url,
    articleSection: "Comparison",
    about: [
      {
        "@type": "SoftwareApplication",
        name: data.mainProduct,
      },
      {
        "@type": "SoftwareApplication",
        name: data.comparedProduct,
      },
    ],
  };
}
