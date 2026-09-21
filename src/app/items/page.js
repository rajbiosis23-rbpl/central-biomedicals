import { fetchFullCatalog } from "@/lib/data-fetcher-server";
import ProductsClient from "./ProductsClient";
import { getBreadcrumbSchema, getCollectionPageSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage({ district = null, city = null }) {
  // Fetch full catalog from Master Catalog
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