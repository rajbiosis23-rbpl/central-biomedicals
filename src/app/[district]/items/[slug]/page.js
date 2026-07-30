import ProductDetails from "../../../items/[slug]/ProductDetails";
import { fetchFullCatalog } from "@/lib/data-fetcher-server";

export default async function Page({ params }) {
    const { slug, district } = await params;
    const allProducts = await fetchFullCatalog();
    const product = allProducts.find((p) => p.slug === slug) || null;

    return (
        <ProductDetails
            slug={slug}
            district={district}
            product={product}
        />
    );
}