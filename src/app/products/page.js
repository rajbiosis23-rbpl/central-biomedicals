import { fetchFullCatalog } from "@/lib/data-fetcher-server";
import ProductsClient from "../items/ProductsClient";
import { getBreadcrumbSchema, getCollectionPageSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Biomedical & Diagnostic Products | Central Biomedicals",
  description:
    "Discover certified medical diagnostic equipment, hematology analyzers, biochemistry analyzers, and lab reagents from Central Biomedicals.",
  alternates: {
    canonical: "https://centralbiomedicals.com/items",
  },
  openGraph: {
    title: "Biomedical & Diagnostic Products | Central Biomedicals",
    description: "Browse high performance laboratory and diagnostic instruments from India's trusted biomedical supplier.",
    url: "https://centralbiomedicals.com/items",
  },
};

export default async function ProductsRoutePage() {
  const allProducts = await fetchFullCatalog();

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Products", url: "/items" },
  ]);

  const collectionSchema = getCollectionPageSchema(
    "Biomedical & Diagnostic Products",
    "Browse high performance laboratory and diagnostic instruments.",
    "/items",
    allProducts.length
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <ProductsClient initialProducts={allProducts} />
    </>
  );
}