import { NextResponse } from "next/server";
import { fetchFullCatalog } from "@/lib/data-fetcher";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const dynamic = "force-dynamic";

const DOMAIN = "https://centralbiomedicals.com";

export async function GET() {
    try {
        // Master Catalog Products (already filtered by published & website visibility)
        const publishedProducts = await fetchFullCatalog();

        // Extract active categories from published products
        const categoryMap = new Map();
        publishedProducts.forEach((prod) => {
            const cat = prod.category || "General";
            if (!categoryMap.has(cat)) {
                categoryMap.set(cat, []);
            }
            categoryMap.get(cat).push(prod);
        });

        const categories = Array.from(categoryMap.entries()).map(([name, prods]) => ({
            id: name.toLowerCase().replace(/\s+/g, "-"),
            category: name,
            products: prods,
        }));

        // Districts
        let districts = [];
        try {
            let snap = await getDocs(
                collection(db, "websites", "centralbiomedicalcom", "districts")
            );
            if (snap.empty) {
                snap = await getDocs(
                    collection(db, "websites", "centralbiomedicals", "districts")
                );
            }
            districts = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (dErr) {
            console.warn("Districts load warning for llms.txt:", dErr.message);
        }

        // ===========================
        // Categories Text
        // ===========================
        const categoryText =
            categories.length > 0
                ? categories
                    .map((cat) => {
                        const productList = (cat.products || [])
                            .map((item) => `- ${item.title || item.name}`)
                            .join("\n");

                        return `
## ${cat.category}

Category ID: ${cat.id}
Total Products: ${cat.products?.length || 0}

Products:
${productList || "No Products"}
`;
                    })
                    .join("\n")
                : "No Categories Found";

        // ===========================
        // Products Text
        // ===========================
        const productText =
            publishedProducts.length > 0
                ? publishedProducts
                    .map((product) => {
                        return `
# ${product.title || product.name}

Category: ${product.category || "N/A"}
Subcategory: ${product.subCategory || "N/A"}
Brand: ${product.brand || "Raj Biosis"}
Model: ${product.model || "N/A"}
Description: ${product.desc || product.description || "No description available"}
Instrument: ${product.instrument || "N/A"}
Automation: ${product.automation || "N/A"}
Usage: ${product.usage || "N/A"}
Throughput: ${product.throughput || "N/A"}
Capacity: ${product.capacity || "N/A"}
Availability: ${product.availability || "In Stock"}
Price: ${product.price ? `₹${product.price}` : "Contact for Price"}
Product URL: ${DOMAIN}/items/${product.slug || product.id}

Tags: ${[
                            product.title,
                            product.brand,
                            product.category,
                            product.subCategory,
                            product.model,
                            product.instrument,
                        ]
                            .filter(Boolean)
                            .join(", ")}
`;
                    })
                    .join("\n")
                : "No Products Found";

        // ===========================
        // District Text
        // ===========================
        const districtText =
            districts.length > 0
                ? districts
                    .map((item) => `${DOMAIN}/${item.slug || item.id}`)
                    .join("\n")
                : "No Districts Found";

        // ===========================
        // Full LLMS Content
        // ===========================
        const content = `
# Central Biomedicals & Raj Biosis

India's Trusted Biomedical & Medical Diagnostic Equipment Manufacturer & Exporter

Website: ${DOMAIN}
Published Products: ${publishedProducts.length}
Categories: ${categories.length}
Districts: ${districts.length}

## About
Central Biomedicals is a premier Indian manufacturer and global exporter of medical diagnostic equipment, hematology analyzers, biochemistry analyzers, ELISA readers, and laboratory instruments.

## Services
- Biomedical Equipment Supply
- Laboratory Equipment Manufacturing
- Diagnostic Equipment Export
- Installation Support & Training
- Technical Calibration & Support
- Pan India & Global Freight Delivery

## Categories
${categoryText}

------------------------------------------------

## Products
${productText}

------------------------------------------------

## District Landing Pages
${districtText}

------------------------------------------------

Sitemap: ${DOMAIN}/sitemap.xml
Robots: ${DOMAIN}/robots.txt
Contact: ${DOMAIN}/contact
Last Updated: ${new Date().toISOString()}
`;

        return new NextResponse(content, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (e) {
        return NextResponse.json(
            {
                success: false,
                error: e.message,
            },
            {
                status: 500,
            }
        );
    }
}