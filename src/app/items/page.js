import { fetchFullCatalog } from "@/lib/data-fetcher-server";
import ProductsClient from "./ProductsClient";

export const revalidate = 3600;

export async function generateMetadata() {
  const title =
    "Biomedical & Laboratory Equipment | Central Biomedicals";

  const description =
    "Explore biomedical, diagnostic, laboratory and hospital equipment from Central Biomedicals. Browse quality medical equipment, analyzers and laboratory instruments across India.";

  return {
    title,
    description,

    alternates: {
      canonical: "https://centralbiomedicals.com/items",
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title,
      description,
      url: "https://centralbiomedicals.com/items",
      siteName: "Central Biomedicals",
      type: "website",
      locale: "en_IN",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProductsPage({
  district = null,
  city = null,
}) {
  const allProducts = await fetchFullCatalog();

  return (
    <ProductsClient
      initialProducts={allProducts}
      district={district}
      city={city}
    />
  );
}