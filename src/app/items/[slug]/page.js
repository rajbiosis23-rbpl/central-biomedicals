import ProductDetails from "./ProductDetails";

export async function generateMetadata({ params }) {
    const { slug } = await params;

    const productName =
        slug
            ?.replace(/-/g, " ")
            ?.replace(/\b\w/g, c => c.toUpperCase());

    return {
        title: `${productName} Supplier in India | Central Biomedicals`,

        description: `Buy ${productName} from Central Biomedicals. Trusted supplier of biomedical and laboratory equipment across India.`,

        keywords: [
            productName,
            `${productName} Supplier`,
            `${productName} Dealer`,
            `${productName} Price`,
            "Biomedical Equipment",
            "Laboratory Equipment",
        ],
    };
}

export default async function Page({ params }) {
    const { slug } = await params;

    return <ProductDetails slug={slug} />;
}