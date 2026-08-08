import { fetchFullCatalog } from "@/lib/data-fetcher-server";
import ProductsClient from "./ProductsClient";
import { getBreadcrumbSchema, getCollectionPageSchema } from "@/lib/seo";

export const revalidate = 3600; // Revalidate cache every hour

export const metadata = {
  title: "Medical & Diagnostic Products Catalog | Central Biomedicals",
  description:
    "Explore our complete product catalog of CBC machines, hematology analyzers, biochemistry analyzers, ELISA readers, and diagnostic laboratory equipment.",
  alternates: {
    canonical: "https://centralbiomedicals.com/items",
  },
  openGraph: {
    title: "Medical & Diagnostic Products Catalog | Central Biomedicals",
    description: "High-precision biomedical equipment and laboratory analyzers for hospitals and pathology labs.",
    url: "https://centralbiomedicals.com/items",
  },
};

export default async function ProductsPage({ district = null, city = null }) {
  // Fetch full catalog from server cache
  const allProducts = await fetchFullCatalog();

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Products Catalog", url: "/items" },
  ]);

  const collectionSchema = getCollectionPageSchema(
    "Medical & Diagnostic Products Catalog",
    "Comprehensive catalog of diagnostic analyzers and biomedical equipment.",
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
      <ProductsClient
        initialProducts={allProducts}
        district={district}
        city={city}
      />
    </>
  );
}