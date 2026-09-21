import ProductDetails from "../../../items/[slug]/ProductDetails";
import { fetchFullCatalog } from "@/lib/data-fetcher-server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }) {
    const { slug, district } = await params;
    const allProducts = await fetchFullCatalog();
    const product = allProducts.find((p) => p.slug === slug) || null;

    if (!product) {
        notFound();
    }

    return (
        <ProductDetails
            slug={slug}
            district={district}
            product={product}
        />
    );
}