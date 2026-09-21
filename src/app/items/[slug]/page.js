import ProductDetails from "./ProductDetails";
import { fetchFullCatalog } from "@/lib/data-fetcher-server";
import { getProductSchema, getBreadcrumbSchema } from "@/lib/seo";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const allProducts = await fetchFullCatalog();
    const product = allProducts.find((p) => p.slug === slug) || null;

    if (!product) {
        return {
            title: "Product Not Found | Central Biomedicals",
            description: "The requested medical diagnostic product is not available or has been unassigned.",
        };
    }

    const formattedSlug = slug
        ?.replace(/-/g, " ")
        ?.replace(/\b\w/g, (c) => c.toUpperCase());

    const titleName = product?.title || formattedSlug;
    const categoryText = product?.category ? `${product.category} ` : "";
    const brandText = product?.brand ? `${product.brand} ` : "";

    const title = `${titleName} | ${categoryText}Manufacturer & Exporter | Central Biomedicals`;

    const rawDesc = product?.desc || product?.description || "";
    const description = rawDesc.length > 30
        ? rawDesc.slice(0, 155) + "..."
        : `Manufacturer and global exporter of ${titleName} (${brandText}diagnostic equipment). High precision laboratory instrument for hospitals, diagnostic centers, and pathology labs. Request quote.`;

    const url = `https://centralbiomedicals.com/items/${slug}`;

    const ogImages = product?.images?.length
        ? product.images.map((img) => ({ url: img, alt: titleName }))
        : product?.image
        ? [{ url: product.image, alt: titleName }]
        : [{ url: "/logo.png", width: 1200, height: 630, alt: "Central Biomedicals" }];

    return {
        metadataBase: new URL("https://centralbiomedicals.com"),
        title,
        description,

        keywords: [
            titleName,
            `${titleName} Manufacturer`,
            `${titleName} Exporter`,
            `${titleName} Supplier`,
            `${titleName} Price`,
            `${titleName} Diagnostic Machine`,
            "Biomedical Equipment Manufacturer India",
            "Medical Equipment Exporter",
            "Central Biomedicals",
        ],

        alternates: {
            canonical: url,
        },

        openGraph: {
            title,
            description,
            url,
            siteName: "Central Biomedicals",
            type: "website",
            locale: "en_US",
            images: ogImages,
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ogImages.map((i) => i.url),
        },

        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
    };
}

export default async function Page({ params }) {
    const { slug } = await params;
    const allProducts = await fetchFullCatalog();
    const product = allProducts.find((p) => p.slug === slug) || null;

    if (!product) {
        notFound();
    }

    const productSchema = getProductSchema(product);

    const breadcrumbSchema = getBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Products", url: "/items" },
        { name: product?.category || "Category", url: "/items" },
        { name: product?.title || slug, url: `/items/${slug}` },
    ]);

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: `What is the application of ${product.title}?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: `${product.title} is utilized in hospitals, diagnostic centers, pathology laboratories, and clinical facilities for accurate biomedical analysis.`,
                },
            },
            {
                "@type": "Question",
                name: `Does Central Biomedicals export ${product.title} internationally?`,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: `Yes, Central Biomedicals exports ${product.title} globally with complete export documentation, safe packaging, and international freight assistance.`,
                },
            },
            {
                "@type": "Question",
                name: "Do you provide technical and installation support?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, installation assistance, operational training, and technical support are provided for all diagnostic instruments.",
                },
            },
        ],
    };

    return (
        <>
            {productSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            <ProductDetails slug={slug} product={product} />
        </>
    );
}