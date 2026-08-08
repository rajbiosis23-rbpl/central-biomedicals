import { fetchFullCatalog } from "@/lib/data-fetcher-server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default async function sitemap() {
    const baseUrl = "https://centralbiomedicals.com";

    const urls = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/services`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/items`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/export`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
    ];

    try {
        // Fetch products using the server cache catalog helper
        const products = await fetchFullCatalog();
        const seenProductSlugs = new Set();

        products.forEach((product) => {
            if (!product.slug || seenProductSlugs.has(product.slug)) return;
            seenProductSlugs.add(product.slug);

            urls.push({
                url: `${baseUrl}/items/${product.slug}`,
                lastModified: new Date(),
                changeFrequency: "weekly",
                priority: 0.8,
            });
        });

        // Fetch district pages for local landing pages
        const districtSnap = await getDocs(
            collection(db, "websites", "centralbiomedicals", "districts")
        );

        districtSnap.docs.forEach((doc) => {
            const data = doc.data();
            const slug = data.slug || doc.id;
            if (!slug) return;

            urls.push({
                url: `${baseUrl}/${slug}`,
                lastModified: new Date(),
                changeFrequency: "monthly",
                priority: 0.7,
            });
        });
    } catch (error) {
        console.error("Sitemap Generation Error:", error);
    }

    return urls;
}